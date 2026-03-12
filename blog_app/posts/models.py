from django.db import models
from django.conf import settings
from common.enum import PostStatus
class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    status = models.PositiveSmallIntegerField(choices=PostStatus.choices, default=PostStatus.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(upload_to="posts/", null=True, blank=True)
    def __str__(self):
        return self.title