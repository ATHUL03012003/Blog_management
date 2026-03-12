from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="This email is already registered.")]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],  # ✅ Uses Django's built-in password validators
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(   # ✅ Confirm password field
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')  # Remove before creating user
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    identifier= serializers.CharField()
    password= serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("identifier")
        password = attrs.get("password")


        if not identifier or not password:
            raise serializers.ValidationError(
                "identifier and password are required"
            )
        return attrs