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
)
from .services import UserService, GoogleAuthService
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