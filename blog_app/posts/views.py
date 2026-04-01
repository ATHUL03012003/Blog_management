from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from common.enum import UserRole
from .permissions import IsAuthor, IsEditor, IsAdmin
from .serializers import PostSerializer
from .services import PostService
from .models import Post 
from common.enum import PostStatus

class CreatePostView(APIView):

    permission_classes = [IsAuthenticated, IsAuthor | IsEditor | IsAdmin]

    def post(self, request):

        serializer = PostSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():

            post = PostService.create_post(
                request.user,
                serializer.validated_data
            )

            return Response(PostSerializer(post).data, status=201)

        return Response(serializer.errors, status=400)


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

    def put(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        # FIXED: Author can update THEIR OWN post
        # Admin, SuperAdmin, Editor can update ANY post
        is_owner = post.author == request.user
        is_privileged = request.user.role in [
            UserRole.ADMIN,
            UserRole.SUPERADMIN,
            UserRole.EDITOR
        ]

        if not is_owner and not is_privileged:
            return Response({"error": "Permission denied"}, status=403)

        serializer = PostSerializer(post, data=request.data, partial=True)

        if serializer.is_valid():
            post = PostService.update_post(post, serializer.validated_data)
            return Response(PostSerializer(post).data)

        return Response(serializer.errors, status=400)


class DeletePostView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, slug):

        post = PostService.get_post_by_slug(slug)

        if post.author != request.user and request.user.role not in [
            UserRole.ADMIN,
            UserRole.SUPERADMIN
        ]:
            return Response({"error": "Permission denied"}, status=403)

        PostService.delete_post(post)

        return Response({"message": "Post deleted"})

class PublishPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        # Only author (their own post) or Editor/Admin can publish
        is_owner = post.author == request.user
        is_privileged = request.user.role in [
            UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EDITOR
        ]

        if not is_owner and not is_privileged:
            return Response({"error": "Permission denied"}, status=403)

        post = PostService.publish_post(post)
        return Response(PostSerializer(post).data)

# Author submits post for editor review
class SubmitForReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if post.author != request.user:
            return Response({"error": "Only the author can submit this post"}, status=403)

        if post.status not in [PostStatus.DRAFT, PostStatus.REJECTED]:
            return Response({"error": "Only draft or rejected posts can be submitted for review"}, status=400)

        post = PostService.submit_for_review(post)
        return Response(PostSerializer(post).data)

# Editor approves post (REVIEW → PUBLISHED)
class ApprovePostView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if post.status != PostStatus.REVIEW:
            return Response({"error": "Only posts in review can be approved"}, status=400)

        post = PostService.publish_post(post)
        return Response(PostSerializer(post).data)

# Editor rejects a post (REVIEW → REJECTED)
class RejectPostView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def post(self, request, slug):
        post = PostService.get_post_by_slug(slug)

        if post.status != PostStatus.REVIEW:
            return Response({"error": "Only posts in review can be rejected"}, status=400)

        post = PostService.reject_post(post)
        return Response(PostSerializer(post).data)

# Editor sees all posts waiting for review
class ReviewQueueView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def get(self, request):
        posts = Post.objects.filter(status=PostStatus.REVIEW).order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

# Author sees all their own posts (all statuses)
class MyPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(author=request.user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)