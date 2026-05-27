from rest_framework import serializers
from .models import Post
from category.models import Category, Tag
from category.serializers import CategorySerializer, TagSerializer


class PostSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    tags_detail = TagSerializer(source="tags", many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "excerpt",
            "image",
            "author",
            "status",
            "category",
            "tags",
            "category_detail",
            "tags_detail",
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


class PostWriteSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False,
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Post
        fields = ["title", "content", "excerpt", "category", "tags", "image"]

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Content is required.")
        return value
