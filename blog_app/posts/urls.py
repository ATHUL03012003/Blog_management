from django.urls import path
from comments.views import PostCommentListCreateView, PostLikeView, PostCommentsToggleView
from .views import (
    CreatePostView,
    PostListView,
    PostDetailView,
    UpdatePostView,
    DeletePostView,
    PublishPostView,
    SubmitForReviewView,
    ApprovePostView,
    RejectPostView,
    ReviewQueueView,
    AdminAllPostsView,
    MyPostsView,
    UploadPostImageView,
)

urlpatterns = [

    path("", PostListView.as_view(), name="post-list"),

    path("create/", CreatePostView.as_view(), name="create-post"),

    path("my-posts/", MyPostsView.as_view(), name="my-posts"),

    path("upload-image/", UploadPostImageView.as_view(), name="upload-post-image"),

    path("review-queue/", ReviewQueueView.as_view(), name="review-queue"),

    path("admin/all/", AdminAllPostsView.as_view(), name="admin-all-posts"),

    path("<slug:slug>/comments/toggle/", PostCommentsToggleView.as_view(), name="post-comments-toggle"),

    path("<slug:slug>/comments/", PostCommentListCreateView.as_view(), name="post-comments"),

    path("<slug:slug>/like/", PostLikeView.as_view(), name="post-like"),

    path("<slug:slug>/", PostDetailView.as_view(), name="post-detail"),

    path("<slug:slug>/update/", UpdatePostView.as_view(), name="update-post"),

    path("<slug:slug>/delete/", DeletePostView.as_view(), name="delete-post"),

    path("<slug:slug>/publish/", PublishPostView.as_view(), name="publish-post"),

    path("<slug:slug>/submit-review/", SubmitForReviewView.as_view(), name="submit-review"), 

    path("<slug:slug>/approve/", ApprovePostView.as_view(), name="approve-post"),

    path("<slug:slug>/reject/", RejectPostView.as_view(), name="reject-post"),

]