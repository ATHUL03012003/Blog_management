from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from common.enum import UserRole
from .permissions import IsAuthor, IsEditor, IsAdmin
from .serializers import PostSerializer
from .services import PostService


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

        # ✅ FIXED: Author can update THEIR OWN post
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