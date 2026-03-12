from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "image",
            "author",
            "status",
            "created_at",
            "updated_at",
            "published_at",
        ]

        read_only_fields = [
            "id",
            "author",
            "slug",
            "status",
            "created_at",
            "updated_at",
            "published_at",
        ]