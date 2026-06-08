from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from common.enum import PostStatus, UserRole
from posts.permissions import IsAdmin
from posts.services import PostService
from .models import Comment
from .serializers import (
    CommentSerializer,
    CommentWriteSerializer,
    CommentUpdateSerializer,
    CommentModerateDeleteSerializer,
    ToggleCommentsSerializer,
)
from .services import CommentService, LikeService
from .moderation_service import CommentModerationService


class PostCommentListCreateView(APIView):

    def get(self, request, slug):
        try:
            comments = CommentService.get_post_comments(slug)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required."}, status=401)

        post = PostService.get_post_by_slug(slug)
        if post.status != PostStatus.PUBLISHED:
            return Response(
                {"error": "Comments are only allowed on published posts."},
                status=400,
            )
        if not post.comments_enabled:
            return Response(
                {"error": "Comments are disabled for this post."},
                status=403,
            )

        try:
            CommentModerationService.ensure_user_can_comment(request.user)
        except DjangoValidationError as exc:
            messages = getattr(exc, "messages", [str(exc)])
            return Response({"error": messages[0]}, status=403)

        serializer = CommentWriteSerializer(
            data=request.data,
            context={"post": post},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            comment = CommentService.create_comment(
                request.user,
                slug,
                serializer.validated_data,
            )
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)

        return Response(CommentSerializer(comment).data, status=201)


class CommentUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            comment = CommentService.get_comment_by_id(pk)
        except Comment.DoesNotExist:
            return Response({"error": "Comment not found."}, status=404)

        if comment.author_id != request.user.id:
            return Response({"error": "Permission denied."}, status=403)

        try:
            CommentModerationService.ensure_user_can_comment(request.user)
        except DjangoValidationError as exc:
            messages = getattr(exc, "messages", [str(exc)])
            return Response({"error": messages[0]}, status=403)

        serializer = CommentUpdateSerializer(
            comment,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        comment = CommentService.update_comment(comment, serializer.validated_data)
        return Response(CommentSerializer(comment).data)


class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            comment = CommentService.get_comment_by_id(pk)
        except Comment.DoesNotExist:
            return Response({"error": "Comment not found."}, status=404)

        if comment.author_id != request.user.id:
            return Response({"error": "Permission denied."}, status=403)

        CommentService.delete_comment(comment)
        return Response({"message": "Comment deleted."})


class CommentModerateDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            comment = CommentService.get_comment_by_id(pk)
        except Comment.DoesNotExist:
            return Response({"error": "Comment not found."}, status=404)

        serializer = CommentModerateDeleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            result = CommentModerationService.moderate_delete(
                request.user,
                comment,
                serializer.validated_data["reason"],
            )
        except DjangoValidationError as exc:
            messages = getattr(exc, "messages", [str(exc)])
            return Response({"error": messages[0]}, status=400)

        return Response(result)


class PostCommentsToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)
        serializer = ToggleCommentsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            post = CommentModerationService.toggle_comments(
                request.user,
                post,
                serializer.validated_data["comments_enabled"],
            )
        except DjangoValidationError as exc:
            messages = getattr(exc, "messages", [str(exc)])
            return Response({"error": messages[0]}, status=403)

        state = "enabled" if post.comments_enabled else "disabled"
        return Response(
            {
                "message": f"Comments {state} for this post.",
                "comments_enabled": post.comments_enabled,
            }
        )


class PostLikeView(APIView):

    def get(self, request, slug):
        try:
            status = LikeService.get_like_status(request.user, slug)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        return Response(status)

    def post(self, request, slug):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required."}, status=401)

        try:
            status = LikeService.toggle_like(request.user, slug)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        return Response(status)
