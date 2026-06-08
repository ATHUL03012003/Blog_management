from django.contrib import admin

from .models import Comment, PostLike, CommentWarning


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "author", "parent", "created_at")
    list_filter = ("created_at",)
    search_fields = ("content", "author__username", "post__title")
    raw_id_fields = ("post", "author", "parent")


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "user", "created_at")
    list_filter = ("created_at",)
    raw_id_fields = ("post", "user")


@admin.register(CommentWarning)
class CommentWarningAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "issued_by", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "reason", "comment_content")
    raw_id_fields = ("user", "issued_by")
