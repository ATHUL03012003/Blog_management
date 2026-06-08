from rest_framework import serializers

from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author",
            "author_username",
            "parent",
            "content",
            "created_at",
            "updated_at",
            "replies",
        ]
        read_only_fields = [
            "id",
            "post",
            "author",
            "author_username",
            "created_at",
            "updated_at",
            "replies",
        ]

    def get_author_username(self, obj):
        return obj.author.username if obj.author_id else None

    def get_replies(self, obj):
        children = getattr(obj, "_child_comments", None)
        if children is None:
            children = obj.replies.select_related("author").order_by("created_at")
        return CommentSerializer(children, many=True).data


class CommentUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = ["content"]

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Content is required.")
        return value.strip()


class CommentWriteSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Comment
        fields = ["content", "parent"]

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Content is required.")
        return value.strip()

    def validate_parent(self, value):
        if value is None:
            return value
        post = self.context.get("post")
        if post and value.post_id != post.id:
            raise serializers.ValidationError(
                "Parent comment must belong to the same post."
            )
        return value


class CommentModerateDeleteSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True, min_length=10, max_length=500)


class ToggleCommentsSerializer(serializers.Serializer):
    comments_enabled = serializers.BooleanField()
