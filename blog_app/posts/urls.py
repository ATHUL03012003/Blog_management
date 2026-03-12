from django.urls import path
from .views import (
    CreatePostView,
    PostListView,
    PostDetailView,
    UpdatePostView,
    DeletePostView,
    PublishPostView
)

urlpatterns = [

    path("", PostListView.as_view(), name="post-list"),

    path("create/", CreatePostView.as_view(), name="create-post"),

    path("<slug:slug>/", PostDetailView.as_view(), name="post-detail"),

    path("<slug:slug>/update/", UpdatePostView.as_view(), name="update-post"),

    path("<slug:slug>/delete/", DeletePostView.as_view(), name="delete-post"),

    path("<slug:slug>/publish/", PublishPostView.as_view(), name="publish-post"),

]