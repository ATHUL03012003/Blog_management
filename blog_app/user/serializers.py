from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
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