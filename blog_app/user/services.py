from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings        
from .enum import UserRole
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
    def authenticate_google_user(token):
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return None

        email = idinfo["email"]
        username=email

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "is_verified": True
            }
        )

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


