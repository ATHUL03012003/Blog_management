from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Post
from common.enum import PostStatus
from django.utils.text import slugify
import uuid

from .utils import sanitize_post_html
from .cloudinary_utils import COVER_FOLDER, upload_image


class PostService:
    @staticmethod
    def create_post(user, data):
        image_file = data.pop("image", None)
        image_url = upload_image(image_file, folder=COVER_FOLDER) if image_file else None
        slug = slugify(data["title"]) + "-" + str(uuid.uuid4())[:6]
        post = Post.objects.create(
            title=data["title"],
            slug=slug,
            content=sanitize_post_html(data["content"]),
            excerpt=data.get("excerpt", ""),
            author=user,
            status=PostStatus.DRAFT,
            category=data.get("category"),
            image=image_url,
        )
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
    def update_post(post, data):
        image_file = data.pop("image", None)
        if image_file:
            post.image = upload_image(image_file, folder=COVER_FOLDER)
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
        post.save()

        if "tags" in data:
            post.tags.set(data["tags"])

        return post

    @staticmethod
    def delete_post(post):
        post.delete()

    @staticmethod
    def approve_post(post):
        post.status = PostStatus.APPROVED
        post.save(update_fields=["status", "updated_at"])
        return post

    @staticmethod
    def publish_post(post):
        post.status = PostStatus.PUBLISHED
        post.published_at = timezone.now()
        post.save()
        return post

    @staticmethod
    def submit_for_review(post):
        post.status = PostStatus.REVIEW
        post.rejection_reason = ""
        post.improvement_areas = ""
        post.save(
            update_fields=["status", "rejection_reason", "improvement_areas", "updated_at"]
        )
        return post

    @staticmethod
    def reject_post(post, rejection_reason="", improvement_areas=""):
        post.status = PostStatus.REJECTED
        post.rejection_reason = rejection_reason.strip()
        post.improvement_areas = improvement_areas.strip()
        post.save(
            update_fields=[
                "status",
                "rejection_reason",
                "improvement_areas",
                "updated_at",
            ]
        )
        return post
