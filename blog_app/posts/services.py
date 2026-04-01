from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Post
from common.enum import PostStatus
from django.utils.text import slugify
import uuid
class PostService:

    @staticmethod   
    def create_post(user, data):
        slug = slugify(data["title"]) + "-" + str(uuid.uuid4())[:6]
        post = Post.objects.create(
            title=data["title"],
            slug=slug,
            content=data["content"],
            author=user,
            status=PostStatus.DRAFT
        )
        return post


    @staticmethod
    def get_all_posts():
        return Post.objects.filter(status=PostStatus.PUBLISHED)


    @staticmethod
    def get_post_by_slug(slug):
        return get_object_or_404(Post, slug=slug)


    @staticmethod
    def update_post(post, data):
        if "title" in data and data["title"] != post.title:
        # Regenerate slug when title changes
            new_slug = slugify(data["title"]) + "-" + str(uuid.uuid4())[:6]
            post.slug = new_slug
        post.title = data.get("title", post.title)
        post.content = data.get("content", post.content)
        post.image = data.get("image", post.image)
        post.save()

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
    # Author submits post for editor review
    @staticmethod
    def submit_for_review(post):
        post.status = PostStatus.REVIEW
        post.save()
        return post

    # Editor rejects a post
    @staticmethod
    def reject_post(post):
        post.status = PostStatus.REJECTED
        post.save()
        return post