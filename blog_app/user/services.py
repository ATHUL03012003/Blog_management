from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from common.enum import UserRole

User = get_user_model()

ADMIN_MANAGED_ROLES = {UserRole.READER, UserRole.AUTHOR}
SUPERADMIN_ASSIGNABLE_ROLES = {
    UserRole.READER,
    UserRole.AUTHOR,
    UserRole.EDITOR,
    UserRole.ADMIN,
}


class UserService:

    @staticmethod
    def register_user(data):
        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            role=UserRole.READER
        )
        return user

    @staticmethod
    def generate_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }
        }

    @staticmethod
    def authenticate_user(identifier, password):
        user = authenticate(username=identifier, password=password)
        if not user:
            try:
                user_obj=User.objects.get(email=identifier)
                user=authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                return None
        return user

    @staticmethod
    def serialize_user(user):
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "has_usable_password": user.has_usable_password(),
        }

    @staticmethod
    def update_profile(user, data):
        username = data.get("username")
        email = data.get("email")

        if username is not None:
            username = username.strip()
            if len(username) < 3:
                raise ValidationError("Username must be at least 3 characters.")
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                raise ValidationError("This username is already taken.")
            user.username = username

        if email is not None:
            email = email.strip().lower()
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                raise ValidationError("This email is already registered.")
            user.email = email

        user.save()
        return user

    @staticmethod
    def change_password(user, current_password, new_password):
        if not user.has_usable_password():
            raise ValidationError(
                "Password change is not available for accounts signed in with Google."
            )
        if not user.check_password(current_password):
            raise ValidationError("Current password is incorrect.")
        user.set_password(new_password)
        user.save()
        return user

    @staticmethod
    def list_manageable_users(role_filter=None):
        qs = User.objects.filter(role__in=ADMIN_MANAGED_ROLES).order_by("-date_joined")
        if role_filter is not None:
            qs = qs.filter(role=role_filter)
        return qs

    @staticmethod
    def admin_set_user_role(actor, target_user, new_role):
        if actor.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
            raise ValidationError("Only administrators can change user roles.")

        if new_role not in ADMIN_MANAGED_ROLES:
            raise ValidationError("Only Reader and Author roles can be assigned here.")

        if target_user.role not in ADMIN_MANAGED_ROLES:
            raise ValidationError("This user's role cannot be changed through this action.")

        if target_user.role == new_role:
            raise ValidationError("User already has this role.")

        target_user.role = new_role
        target_user.save()
        return target_user

    @staticmethod
    def list_all_users(role_filter=None):
        qs = User.objects.all().order_by("-date_joined")
        if role_filter is not None:
            qs = qs.filter(role=role_filter)
        return qs

    @staticmethod
    def superadmin_set_user_role(actor, target_user, new_role):
        if actor.role != UserRole.SUPERADMIN:
            raise ValidationError("Only Super Admin can change roles here.")

        if new_role == UserRole.SUPERADMIN:
            raise ValidationError("Super Admin role cannot be assigned via the API.")

        if target_user.role == UserRole.SUPERADMIN:
            raise ValidationError("Super Admin accounts cannot be modified.")

        if new_role not in SUPERADMIN_ASSIGNABLE_ROLES:
            raise ValidationError("Invalid role for this action.")

        if target_user.role == new_role:
            raise ValidationError("User already has this role.")

        target_user.role = new_role
        target_user.save()
        return target_user

    @staticmethod
    def get_platform_overview():
        from posts.models import Post
        from common.enum import PostStatus

        users_by_role = {}
        for role_value, role_label in UserRole.choices:
            users_by_role[str(role_value)] = {
                "label": role_label,
                "count": User.objects.filter(role=role_value).count(),
            }

        posts_by_status = {}
        for status_value, status_label in PostStatus.choices:
            posts_by_status[str(status_value)] = {
                "label": status_label,
                "count": Post.objects.filter(status=status_value).count(),
            }

        return {
            "total_users": User.objects.count(),
            "total_posts": Post.objects.count(),
            "users_by_role": users_by_role,
            "posts_by_status": posts_by_status,
        }


class GoogleAuthService:

    @staticmethod
    def _verify_google_token(token):
        try:
            return id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return None

    @staticmethod
    def _build_unique_username(email):
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        return username

    @staticmethod
    def _build_auth_response(user, created=False):
        tokens = UserService.generate_tokens(user)
        tokens["created"] = created
        return tokens

    @staticmethod
    def authenticate_google_user(token, action="register"):
        idinfo = GoogleAuthService._verify_google_token(token)
        if not idinfo:
            return None, "invalid_token"

        email = idinfo["email"]

        if action == "login":
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return None, "not_registered"
            return GoogleAuthService._build_auth_response(user), None

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": GoogleAuthService._build_unique_username(email),
                "is_verified": True,
                "role": UserRole.READER,
            },
        )
        return GoogleAuthService._build_auth_response(user, created=created), None


