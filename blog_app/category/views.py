from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Category, Tag
from .serializers import CategorySerializer, TagSerializer
from .services import CategoryService, TagService
from posts.serializers import PostSerializer
from posts.permissions import IsEditor, IsAdmin


class CategoryListView(APIView):

    def get(self, request):
        categories = CategoryService.get_all_categories()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class CategoryCreateView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category = CategoryService.create_category(serializer.validated_data)
            return Response(CategorySerializer(category).data, status=201)
        return Response(serializer.errors, status=400)


class CategoryDetailView(APIView):

    def get(self, request, slug):
        category = CategoryService.get_category_by_slug(slug)
        if not category:
            return Response({"error": "Category not found"}, status=404)
        serializer = CategorySerializer(category)
        return Response(serializer.data)


class CategoryUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def put(self, request, slug):
        category = CategoryService.get_category_by_slug(slug)
        if not category:
            return Response({"error": "Category not found"}, status=404)

        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            category = CategoryService.update_category(category, serializer.validated_data)
            return Response(CategorySerializer(category).data)
        return Response(serializer.errors, status=400)


class CategoryDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, slug):
        category = CategoryService.get_category_by_slug(slug)
        if not category:
            return Response({"error": "Category not found"}, status=404)
        CategoryService.delete_category(category)
        return Response({"message": "Category deleted"})


class PostsByCategoryView(APIView):

    def get(self, request, slug):
        category = CategoryService.get_category_by_slug(slug)
        if not category:
            return Response({"error": "Category not found"}, status=404)
        posts = CategoryService.get_posts_by_category(category)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


class TagListView(APIView):

    def get(self, request):
        tags = TagService.get_all_tags()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)


class TagCreateView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def post(self, request):
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            tag = TagService.create_tag(serializer.validated_data)
            return Response(TagSerializer(tag).data, status=201)
        return Response(serializer.errors, status=400)


class TagUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsEditor | IsAdmin]

    def put(self, request, slug):
        tag = TagService.get_tag_by_slug(slug)
        if not tag:
            return Response({"error": "Tag not found"}, status=404)

        serializer = TagSerializer(tag, data=request.data, partial=True)
        if serializer.is_valid():
            tag = TagService.update_tag(tag, serializer.validated_data)
            return Response(TagSerializer(tag).data)
        return Response(serializer.errors, status=400)


class TagDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, slug):
        tag = TagService.get_tag_by_slug(slug)
        if not tag:
            return Response({"error": "Tag not found"}, status=404)
        TagService.delete_tag(tag)
        return Response({"message": "Tag deleted"})


class PostsByTagView(APIView):

    def get(self, request, slug):
        tag = TagService.get_tag_by_slug(slug)
        if not tag:
            return Response({"error": "Tag not found"}, status=404)
        posts = TagService.get_posts_by_tag(tag)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)