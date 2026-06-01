from django.urls import path
from .views import (
    CategoryListView,
    CategoryCreateView,
    CategoryDetailView,
    CategoryUpdateView,
    CategoryDeleteView,
    TagListView,
    TagCreateView,
    TagDeleteView,
    TagUpdateView,
    PostsByTagView,
    PostsByCategoryView,
)

urlpatterns = [
    path("", CategoryListView.as_view(), name="category-list"),
    path("create/", CategoryCreateView.as_view(), name="category-create"),

    # ✅ All tags/* paths BEFORE <slug:slug>/* paths
    path("tags/", TagListView.as_view(), name="tag-list"),
    path("tags/create/", TagCreateView.as_view(), name="tag-create"),
    path("tags/<slug:slug>/update/", TagUpdateView.as_view(), name="tag-update"),
    path("tags/<slug:slug>/delete/", TagDeleteView.as_view(), name="tag-delete"),
    path("tags/<slug:slug>/posts/", PostsByTagView.as_view(), name="posts-by-tag"),

    # ✅ Category slug paths LAST
    path("<slug:slug>/", CategoryDetailView.as_view(), name="category-detail"),
    path("<slug:slug>/update/", CategoryUpdateView.as_view(), name="category-update"),
    path("<slug:slug>/delete/", CategoryDeleteView.as_view(), name="category-delete"),
    path("<slug:slug>/posts/", PostsByCategoryView.as_view(), name="posts-by-category"),
]