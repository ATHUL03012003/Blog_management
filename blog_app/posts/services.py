from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Post
from common.enum import PostStatus, UserRole
from django.utils.text import slugify
import uuid

from .utils import sanitize_post_html


class PostService:
    @staticmethod
    def create_post(user, data):
        slug = slugify(data["title"]) + "-" + str(uuid.uuid4())[:6]
        post = Post.objects.create(
            title=data["title"],
            slug=slug,
            content=sanitize_post_html(data["content"]),
            excerpt=data.get("excerpt", ""),
            author=user,
            status=PostStatus.DRAFT,
            category=data.get("category"),
        )
        if data.get("image"):
            post.image = data["image"]
            post.save(update_fields=["image"])
        tags = data.get("tags")
        if tags is not None:
            post.tags.set(tags)
        return post

    @staticmethod
    def get_all_posts():
        return Post.objects.filter(status=PostStatus.PUBLISHED)

    @staticmethod
    def get_post_by_slug(slug):
        return get_object_or_404(Post, slug=slug)

    @staticmethod
    def user_can_view_post(user, post):
        if post.status == PostStatus.PUBLISHED:
            return True
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if post.author_id == user.id:
            return True
        return user.role in (UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPERADMIN)

    @staticmethod
    def update_post(post, data):
        if "title" in data and data["title"] != post.title:
            new_slug = slugify(data["title"]) + "-" + str(uuid.uuid4())[:6]
            post.slug = new_slug
        if "title" in data:
            post.title = data["title"]
        if "content" in data:
            post.content = sanitize_post_html(data["content"])
        if "excerpt" in data:
            post.excerpt = data["excerpt"]
        if "category" in data:
            post.category = data["category"]
        if "image" in data:
            post.image = data["image"]
        post.save()

        if "tags" in data:
            post.tags.set(data["tags"])

        return post

    @staticmethod
    def delete_post(post):
        post.delete()

    @staticmethod
    def publish_post(post):
        post.status = PostStatus.PUBLISHED
        post.published_at = timezone.now()
        post.save()
        return post

    @staticmethod
    def submit_for_review(post):
        post.status = PostStatus.REVIEW
        post.save()
        return post

    @staticmethod
    def reject_post(post):
        post.status = PostStatus.REJECTED
        post.save()
        return post
