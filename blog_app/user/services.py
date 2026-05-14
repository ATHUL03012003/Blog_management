from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings        
from common.enum import UserRole
User = get_user_model()


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


