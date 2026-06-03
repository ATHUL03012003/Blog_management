from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from common.enum import UserRole

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


class UserProfileSerializer(serializers.ModelSerializer):
    role_label = serializers.SerializerMethodField()
    has_usable_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "role_label",
            "has_usable_password",
        ]
        read_only_fields = ["id", "role", "role_label", "has_usable_password"]

    def get_role_label(self, obj):
        return obj.get_role_display()

    def get_has_usable_password(self, obj):
        return obj.has_usable_password()


class ProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150, required=False)
    email = serializers.EmailField(required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Provide at least one field to update.")
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    new_password2 = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs


class UserListSerializer(serializers.ModelSerializer):
    role_label = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "role_label", "date_joined"]
        read_only_fields = fields

    def get_role_label(self, obj):
        return obj.get_role_display()


class AdminSetRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[UserRole.READER, UserRole.AUTHOR])


class SuperAdminSetRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=[
            UserRole.READER,
            UserRole.AUTHOR,
            UserRole.EDITOR,
            UserRole.ADMIN,
        ]
    )