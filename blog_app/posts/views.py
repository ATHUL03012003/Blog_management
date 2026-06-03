from django.core.exceptions import ImproperlyConfigured
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from common.enum import UserRole
from .permissions import IsAuthor, IsEditor, IsAdmin
from .serializers import PostSerializer, PostWriteSerializer, RejectPostSerializer
from .services import PostService
from .models import Post
from common.enum import PostStatus
from .cloudinary_utils import CONTENT_FOLDER, upload_image


def _media_upload_error_response(exc):
    if isinstance(exc, ValueError):
        return Response({"error": str(exc)}, status=400)
    if isinstance(exc, ImproperlyConfigured):
        return Response({"error": str(exc)}, status=503)
    return Response({"error": "Image upload failed."}, status=500)


def _can_write_posts(user):
    return user.role in [
        UserRole.AUTHOR,
        UserRole.EDITOR,
        UserRole.ADMIN,
        UserRole.SUPERADMIN,
    ]


def _post_write_permission(user, post):
    is_owner = post.author == user
    is_privileged = user.role in [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EDITOR]
    return is_owner or is_privileged


class CreatePostView(APIView):
    permission_classes = [IsAuthenticated, IsAuthor | IsEditor | IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = PostWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            post = PostService.create_post(request.user, serializer.validated_data)
        except (ValueError, ImproperlyConfigured) as exc:
            return _media_upload_error_response(exc)
        return Response(PostSerializer(post).data, status=201)


class PostListView(APIView):
    def get(self, request):
        posts = PostService.get_all_posts()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


class PostDetailView(APIView):
    def get(self, request, slug):
        post = PostService.get_post_by_slug(slug)
        serializer = PostSerializer(post)
        return Response(serializer.data)


class UpdatePostView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if not _post_write_permission(request.user, post):
            return Response({"error": "Permission denied"}, status=403)

        serializer = PostWriteSerializer(post, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            post = PostService.update_post(post, serializer.validated_data)
        except (ValueError, ImproperlyConfigured) as exc:
            return _media_upload_error_response(exc)
        return Response(PostSerializer(post).data)


class DeletePostView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if post.author != request.user and request.user.role not in [
            UserRole.ADMIN,
            UserRole.SUPERADMIN,
        ]:
            return Response({"error": "Permission denied"}, status=403)

        PostService.delete_post(post)
        return Response({"message": "Post deleted"})


class PublishPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        is_owner = post.author == request.user
        is_privileged = request.user.role in [
            UserRole.ADMIN,
            UserRole.SUPERADMIN,
            UserRole.EDITOR,
        ]

        if not is_owner and not is_privileged:
            return Response({"error": "Permission denied"}, status=403)

        if request.user.role == UserRole.AUTHOR:
            if post.author != request.user:
                return Response({"error": "Permission denied"}, status=403)
            if post.status != PostStatus.APPROVED:
                return Response(
                    {
                        "error": (
                            "This post must be approved by an editor before you can publish. "
                            "Submit it for review first."
                        )
                    },
                    status=400,
                )
        elif not is_privileged:
            return Response({"error": "Permission denied"}, status=403)
        elif post.status not in [
            PostStatus.DRAFT,
            PostStatus.REJECTED,
            PostStatus.APPROVED,
        ]:
            return Response(
                {"error": "This post cannot be published in its current state."},
                status=400,
            )

        post = PostService.publish_post(post)
        return Response(PostSerializer(post).data)


class SubmitForReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if post.author != request.user:
            return Response({"error": "Only the author can submit this post"}, status=403)

        if post.status not in [PostStatus.DRAFT, PostStatus.REJECTED]:
            return Response(
                {"error": "Only draft or rejected posts can be submitted for review"},
                status=400,
            )

        post = PostService.submit_for_review(post)
        return Response(PostSerializer(post).data)


class ApprovePostView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if post.status != PostStatus.REVIEW:
            return Response({"error": "Only posts in review can be approved"}, status=400)

        post = PostService.approve_post(post)
        return Response(PostSerializer(post).data)


class RejectPostView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if post.status != PostStatus.REVIEW:
            return Response({"error": "Only posts in review can be rejected"}, status=400)

        serializer = RejectPostSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        post = PostService.reject_post(
            post,
            rejection_reason=serializer.validated_data["rejection_reason"],
            improvement_areas=serializer.validated_data["improvement_areas"],
        )
        return Response(PostSerializer(post).data)


class ReviewQueueView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def get(self, request):
        posts = Post.objects.filter(status=PostStatus.REVIEW).order_by("-created_at")
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


class AdminAllPostsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        posts = Post.objects.all().order_by("-created_at")
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


class MyPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(author=request.user).order_by("-created_at")
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


class UploadPostImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if not _can_write_posts(request.user):
            return Response({"error": "Permission denied"}, status=403)

        image = request.FILES.get("image")
        try:
            url = upload_image(image, folder=CONTENT_FOLDER)
        except (ValueError, ImproperlyConfigured) as exc:
            return _media_upload_error_response(exc)
        return Response({"url": url}, status=201)
