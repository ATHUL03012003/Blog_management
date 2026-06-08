from django.db.models import Prefetch
from django.shortcuts import get_object_or_404

from common.enum import PostStatus
from posts.models import Post

from .models import Comment, PostLike
from .moderation_service import CommentModerationService


class CommentService:

    @staticmethod
    def _get_published_post(slug):
        post = get_object_or_404(Post, slug=slug)
        if post.status != PostStatus.PUBLISHED:
            raise ValueError("Comments are only allowed on published posts.")
        return post

    @staticmethod
    def _attach_reply_tree(comments):
        by_parent = {}
        for comment in comments:
            by_parent.setdefault(comment.parent_id, []).append(comment)
        for comment in comments:
            comment._child_comments = by_parent.get(comment.id, [])
        return by_parent.get(None, [])

    @staticmethod
    def get_post_comments(slug):
        post = CommentService._get_published_post(slug)
        if not post.comments_enabled:
            raise ValueError("Comments are disabled for this post.")

        comments = list(
            Comment.objects.filter(post=post)
            .select_related("author")
            .order_by("created_at")
        )
        return CommentService._attach_reply_tree(comments)

    @staticmethod
    def create_comment(user, slug, data):
        CommentModerationService.ensure_user_can_comment(user)
        post = CommentService._get_published_post(slug)
        if not post.comments_enabled:
            raise ValueError("Comments are disabled for this post.")

        parent = data.get("parent")
        if parent is not None and parent.post_id != post.id:
            raise ValueError("Parent comment must belong to the same post.")

        return Comment.objects.create(
            post=post,
            author=user,
            parent=parent,
            content=data["content"],
        )

    @staticmethod
    def get_comment_by_id(comment_id):
        return Comment.objects.select_related("post", "author").get(pk=comment_id)

    @staticmethod
    def update_comment(comment, data):
        comment.content = data["content"]
        comment.save(update_fields=["content", "updated_at"])
        return comment

    @staticmethod
    def delete_comment(comment):
        comment.delete()


class LikeService:

    @staticmethod
    def _get_published_post(slug):
        post = get_object_or_404(Post, slug=slug)
        if post.status != PostStatus.PUBLISHED:
            raise ValueError("Likes are only allowed on published posts.")
        return post

    @staticmethod
    def get_like_status(user, slug):
        post = LikeService._get_published_post(slug)
        liked = False
        if user and user.is_authenticated:
            liked = PostLike.objects.filter(post=post, user=user).exists()
        return {
            "liked": liked,
            "like_count": post.likes.count(),
        }

    @staticmethod
    def toggle_like(user, slug):
        post = LikeService._get_published_post(slug)
        like, created = PostLike.objects.get_or_create(post=post, user=user)
        if not created:
            like.delete()
            liked = False
        else:
            liked = True
        return {
            "liked": liked,
            "like_count": post.likes.count(),
        }
