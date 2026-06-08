from django.urls import path

from .views import CommentUpdateView, CommentDeleteView, CommentModerateDeleteView

urlpatterns = [
    path("<int:pk>/update/", CommentUpdateView.as_view(), name="comment-update"),
    path("<int:pk>/delete/", CommentDeleteView.as_view(), name="comment-delete"),
    path(
        "<int:pk>/moderate-delete/",
        CommentModerateDeleteView.as_view(),
        name="comment-moderate-delete",
    ),
]