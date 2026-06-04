from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.exceptions import ValidationError as DjangoValidationError
from posts.permissions import IsAdmin
from .permissions import IsSuperAdmin
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    UserListSerializer,
    AdminSetRoleSerializer,
    SuperAdminSetRoleSerializer,
    SuperAdminSetUserActiveSerializer,
    RoleChangeRequestCreateSerializer,
    RoleChangeRequestSerializer,
    RoleChangeRequestReviewSerializer,
    NotificationSerializer,
)
from .services import UserService, GoogleAuthService
from .role_request_service import RoleChangeRequestService, NotificationService
from .models import RoleChangeRequest
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = UserService.register_user(serializer.validated_data)
        tokens = UserService.generate_tokens(user)

        return Response(tokens, status=201)

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = UserService.authenticate_user(
            serializer.validated_data["identifier"],
            serializer.validated_data["password"]
        )

        if not user:
            if UserService.is_deactivated_login(
                serializer.validated_data["identifier"],
                serializer.validated_data["password"],
            ):
                return Response({"error": "This account has been deactivated."}, status=403)
            return Response({"error": "Invalid credentials"}, status=401)

        tokens = UserService.generate_tokens(user)

        return Response(tokens, status=200)

class GoogleLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        action = request.data.get("action", "login")

        if not token:
            return Response({"error": "Token missing"}, status=400)

        if action not in {"login", "register"}:
            return Response({"error": "Invalid action. Use 'login' or 'register'."}, status=400)

        auth_response, error_code = GoogleAuthService.authenticate_google_user(token, action)

        if error_code == "invalid_token":
            return Response({"error": "Invalid Google token"}, status=400)

        if error_code == "not_registered":
            return Response(
                {"error": "No account found with this Google email. Please sign up first."},
                status=404,
            )

        if error_code == "deactivated":
            return Response({"error": "This account has been deactivated."}, status=403)

        return Response(auth_response, status=200)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        try:
            user = UserService.update_profile(request.user, serializer.validated_data)
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)
        return Response(UserProfileSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        try:
            UserService.change_password(
                request.user,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)
        return Response({"message": "Password updated successfully."})


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        role_param = request.query_params.get("role")
        role_filter = None
        if role_param is not None and role_param != "":
            try:
                role_filter = int(role_param)
            except ValueError:
                return Response({"error": "Invalid role filter."}, status=400)
        users = UserService.list_manageable_users(role_filter=role_filter)
        return Response(UserListSerializer(users, many=True).data)


class AdminSetUserRoleView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        serializer = AdminSetRoleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            target = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        try:
            user = UserService.admin_set_user_role(
                request.user, target, serializer.validated_data["role"]
            )
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)

        return Response(UserListSerializer(user).data)


class SuperAdminOverviewView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        return Response(UserService.get_platform_overview())


class SuperAdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        role_param = request.query_params.get("role")
        role_filter = None
        if role_param is not None and role_param != "":
            try:
                role_filter = int(role_param)
            except ValueError:
                return Response({"error": "Invalid role filter."}, status=400)
        users = UserService.list_all_users(role_filter=role_filter)
        return Response(UserListSerializer(users, many=True).data)


class SuperAdminSetUserRoleView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def patch(self, request, user_id):
        serializer = SuperAdminSetRoleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            target = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        try:
            user = UserService.superadmin_set_user_role(
                request.user, target, serializer.validated_data["role"]
            )
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)

        return Response(UserListSerializer(user).data)


class SuperAdminSetUserActiveView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def patch(self, request, user_id):
        serializer = SuperAdminSetUserActiveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            target = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        try:
            user = UserService.superadmin_set_user_active(
                request.user, target, serializer.validated_data["is_active"]
            )
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)

        return Response(UserListSerializer(user).data)


class RoleChangeRequestCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RoleChangeRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        try:
            req = RoleChangeRequestService.create_request(
                request.user,
                serializer.validated_data["requested_role"],
                serializer.validated_data.get("message", ""),
            )
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)
        return Response(RoleChangeRequestSerializer(req).data, status=201)


class MyRoleChangeRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = RoleChangeRequestService.list_for_user(request.user)
        return Response(RoleChangeRequestSerializer(qs, many=True).data)


class PendingRoleChangeRequestsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        try:
            qs = RoleChangeRequestService.list_pending_for_reviewer(request.user)
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)
        return Response(RoleChangeRequestSerializer(qs, many=True).data)


class RoleChangeRequestReviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, request_id):
        serializer = RoleChangeRequestReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            req_obj = RoleChangeRequest.objects.select_related("user").get(pk=request_id)
        except RoleChangeRequest.DoesNotExist:
            return Response({"error": "Request not found."}, status=404)

        action = serializer.validated_data["action"]
        note = serializer.validated_data.get("review_note", "")

        try:
            if action == "approve":
                req_obj = RoleChangeRequestService.approve_request(
                    request.user, req_obj, note
                )
            else:
                req_obj = RoleChangeRequestService.reject_request(
                    request.user, req_obj, note
                )
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)

        return Response(RoleChangeRequestSerializer(req_obj).data)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        unread_only = request.query_params.get("unread") == "1"
        qs = NotificationService.list_for_user(request.user, unread_only=unread_only)
        return Response(NotificationSerializer(qs, many=True).data)


class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"count": NotificationService.unread_count(request.user)})


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        try:
            notification = NotificationService.mark_read(request.user, notification_id)
        except DjangoValidationError as exc:
            msgs = getattr(exc, "messages", None) or [str(exc)]
            return Response({"error": msgs[0]}, status=400)
        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        NotificationService.mark_all_read(request.user)
        return Response({"message": "All notifications marked as read."})