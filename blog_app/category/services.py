from .models import Category, Tag
from posts.models import Post
from common.enum import PostStatus


class CategoryService:

    @staticmethod
    def get_all_categories():
        return Category.objects.all().order_by('name')

    @staticmethod
    def get_category_by_slug(slug):
        try:
            return Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            return None

    @staticmethod
    def create_category(data):
        category = Category.objects.create(
            name=data['name'],
            description=data.get('description', '')
        )
        return category

    @staticmethod
    def update_category(category, data):
        category.name = data.get('name', category.name)
        category.description = data.get('description', category.description)
        category.save()
        return category

    @staticmethod
    def delete_category(category):
        category.delete()

    @staticmethod
    def get_posts_by_category(category):
        return Post.objects.filter(
            category=category,
            status=PostStatus.PUBLISHED
        ).order_by('-published_at')


class TagService:

    @staticmethod
    def get_all_tags():
        return Tag.objects.all().order_by('name')

    @staticmethod
    def get_tag_by_slug(slug):
        try:
            return Tag.objects.get(slug=slug)
        except Tag.DoesNotExist:
            return None

    @staticmethod
    def create_tag(data):
        tag = Tag.objects.create(
            name=data['name']
        )
        return tag

    @staticmethod
    def update_tag(tag, data):
        tag.name = data.get('name', tag.name)
        tag.save()
        return tag

    @staticmethod
    def delete_tag(tag):
        tag.delete()

    @staticmethod
    def get_posts_by_tag(tag):
        return Post.objects.filter(
            tags=tag,
            status=PostStatus.PUBLISHED
        ).order_by('-published_at')