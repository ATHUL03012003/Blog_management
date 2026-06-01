from django.contrib import admin
from .models import Post

# Register your models here.

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'author', 'status', 'created_at', 'updated_at', 'published_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'author__username', 'content']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']