from rest_framework import serializers
from .models import Post
from category.models import Category, Tag
from category.serializers import CategorySerializer, TagSerializer


class PostSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    tags_detail = TagSerializer(source="tags", many=True, read_only=True)
    author_username = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

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
            "author_username",
            "status",
            "category",
            "tags",
            "category_detail",
            "tags_detail",
            "like_count",
            "comment_count",
            "is_liked",
            "comments_enabled",
            "created_at",
            "updated_at",
            "published_at",
            "rejection_reason",
            "improvement_areas",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_username",
            "slug",
            "status",
            "created_at",
            "updated_at",
            "published_at",
        ]

    def get_author_username(self, obj):
        return obj.author.username if obj.author_id else None

    def get_like_count(self, obj):
        if hasattr(obj, "like_count"):
            return obj.like_count
        return obj.likes.count()

    def get_comment_count(self, obj):
        if hasattr(obj, "comment_count"):
            return obj.comment_count
        return obj.comments.count()

    def get_is_liked(self, obj):
        if hasattr(obj, "is_liked"):
            return obj.is_liked
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()


class PostWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)

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


class RejectPostSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True, min_length=10)
    improvement_areas = serializers.CharField(required=True, min_length=10)
