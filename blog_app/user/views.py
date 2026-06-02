from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from .services import UserService
from .serializers import RegisterSerializer, LoginSerializer
from .services import GoogleAuthService

class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = UserService.register_user(serializer.validated_data)
        tokens = UserService.generate_tokens(user)

        return Response(tokens, status=201)

class LoginView(APIView):

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

    def post(self, request):
        token = request.data.get("token")

        if not token:
            return Response({"error": "Token missing"}, status=400)

        auth_response = GoogleAuthService.authenticate_google_user(token)

        if not auth_response:
            return Response({"error": "Invalid Google token"}, status=400)

        return Response(auth_response, status=200)