from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from common.enum import PostStatus, UserRole
from posts.models import Post

User = get_user_model()


class PostDetailAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author = User.objects.create_user(
            username="author",
            email="author@example.com",
            password="pass12345",
            role=UserRole.AUTHOR,
        )
        self.other_author = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="pass12345",
            role=UserRole.AUTHOR,
        )
        self.reader = User.objects.create_user(
            username="reader",
            email="reader@example.com",
            password="pass12345",
            role=UserRole.READER,
        )
        self.editor = User.objects.create_user(
            username="editor",
            email="editor@example.com",
            password="pass12345",
            role=UserRole.EDITOR,
        )
        self.draft = Post.objects.create(
            title="Draft post",
            slug="draft-post",
            content="Secret draft content",
            author=self.author,
            status=PostStatus.DRAFT,
        )
        self.published = Post.objects.create(
            title="Published post",
            slug="published-post",
            content="Public content",
            author=self.author,
            status=PostStatus.PUBLISHED,
        )

    def test_anonymous_can_read_published_post(self):
        res = self.client.get(f"/api/posts/{self.published.slug}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["slug"], self.published.slug)

    def test_anonymous_cannot_read_draft_post(self):
        res = self.client.get(f"/api/posts/{self.draft.slug}/")
        self.assertEqual(res.status_code, 404)

    def test_reader_cannot_read_draft_post(self):
        self.client.force_authenticate(user=self.reader)
        res = self.client.get(f"/api/posts/{self.draft.slug}/")
        self.assertEqual(res.status_code, 404)

    def test_author_can_read_own_draft(self):
        self.client.force_authenticate(user=self.author)
        res = self.client.get(f"/api/posts/{self.draft.slug}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["title"], "Draft post")

    def test_other_author_cannot_read_draft(self):
        self.client.force_authenticate(user=self.other_author)
        res = self.client.get(f"/api/posts/{self.draft.slug}/")
        self.assertEqual(res.status_code, 404)

    def test_editor_can_read_draft(self):
        self.client.force_authenticate(user=self.editor)
        res = self.client.get(f"/api/posts/{self.draft.slug}/")
        self.assertEqual(res.status_code, 200)
