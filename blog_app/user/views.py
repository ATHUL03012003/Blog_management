from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from .services import UserService
from .serializers import RegisterSerializer, LoginSerializer
from .services import GoogleAuthService


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