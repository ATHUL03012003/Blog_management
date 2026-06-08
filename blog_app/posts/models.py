from django.db import models
from django.conf import settings
from common.enum import PostStatus
from category.models import Category, Tag
class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)  
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    category = models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,blank=True,related_name="posts")
    tags = models.ManyToManyField(Tag,blank=True,related_name="posts")
    status = models.PositiveSmallIntegerField(choices=PostStatus.choices, default=PostStatus.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    # Cloudinary HTTPS URL only (not a local file path)
    image = models.URLField(max_length=500, blank=True, null=True)
    rejection_reason = models.TextField(blank=True)
    improvement_areas = models.TextField(blank=True)
    comments_enabled = models.BooleanField(default=True)
    def __str__(self):
        return self.title