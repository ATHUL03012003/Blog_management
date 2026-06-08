from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from category.models import Category
from comments.constants import COMMENT_WARNING_SUSPEND_THRESHOLD
from comments.models import Comment, PostLike, CommentWarning
from common.enum import PostStatus, UserRole
from posts.models import Post
from user.models import Notification

User = get_user_model()


class CommentLikeAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reader = User.objects.create_user(
            username="reader",
            email="reader@example.com",
            password="pass12345",
            role=UserRole.READER,
        )
        self.author = User.objects.create_user(
            username="author",
            email="author@example.com",
            password="pass12345",
            role=UserRole.AUTHOR,
        )
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="pass12345",
            role=UserRole.ADMIN,
        )
        self.category = Category.objects.create(name="Tech", slug="tech")
        self.post = Post.objects.create(
            title="Published Post",
            slug="published-post",
            content="<p>Hello world</p>",
            author=self.author,
            category=self.category,
            status=PostStatus.PUBLISHED,
        )
        self.draft_post = Post.objects.create(
            title="Draft Post",
            slug="draft-post",
            content="<p>Draft</p>",
            author=self.author,
            category=self.category,
            status=PostStatus.DRAFT,
        )

    def test_list_comments_on_published_post(self):
        Comment.objects.create(
            post=self.post,
            author=self.reader,
            content="Nice post!",
        )
        response = self.client.get(f"/api/posts/{self.post.slug}/comments/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["content"], "Nice post!")

    def test_create_comment_requires_auth(self):
        response = self.client.post(
            f"/api/posts/{self.post.slug}/comments/",
            {"content": "Great read"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_create_comment_on_published_post(self):
        self.client.force_authenticate(user=self.reader)
        response = self.client.post(
            f"/api/posts/{self.post.slug}/comments/",
            {"content": "Great read"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["author_username"], "reader")
        self.assertTrue(Comment.objects.filter(post=self.post, author=self.reader).exists())

    def test_cannot_comment_on_draft_post(self):
        self.client.force_authenticate(user=self.reader)
        response = self.client.post(
            f"/api/posts/{self.draft_post.slug}/comments/",
            {"content": "Should fail"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_create_reply_to_comment(self):
        self.client.force_authenticate(user=self.reader)
        parent = Comment.objects.create(
            post=self.post,
            author=self.author,
            content="Top level",
        )
        response = self.client.post(
            f"/api/posts/{self.post.slug}/comments/",
            {"content": "A reply", "parent": parent.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Comment.objects.filter(parent=parent).count(), 1)

    def test_create_nested_reply(self):
        self.client.force_authenticate(user=self.reader)
        parent = Comment.objects.create(
            post=self.post,
            author=self.author,
            content="Top level",
        )
        reply = Comment.objects.create(
            post=self.post,
            author=self.author,
            parent=parent,
            content="First reply",
        )
        response = self.client.post(
            f"/api/posts/{self.post.slug}/comments/",
            {"content": "Reply to reply", "parent": reply.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(reply.replies.count(), 1)

    def test_update_own_comment(self):
        comment = Comment.objects.create(
            post=self.post,
            author=self.reader,
            content="Original",
        )
        self.client.force_authenticate(user=self.reader)
        response = self.client.put(
            f"/api/comments/{comment.id}/update/",
            {"content": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        comment.refresh_from_db()
        self.assertEqual(comment.content, "Updated")

    def test_delete_own_comment(self):
        comment = Comment.objects.create(
            post=self.post,
            author=self.reader,
            content="Delete me",
        )
        self.client.force_authenticate(user=self.reader)
        response = self.client.delete(f"/api/comments/{comment.id}/delete/")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Comment.objects.filter(pk=comment.id).exists())

    def test_toggle_like(self):
        self.client.force_authenticate(user=self.reader)
        response = self.client.post(f"/api/posts/{self.post.slug}/like/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["liked"])
        self.assertEqual(response.data["like_count"], 1)
        self.assertTrue(PostLike.objects.filter(post=self.post, user=self.reader).exists())

        response = self.client.post(f"/api/posts/{self.post.slug}/like/")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["liked"])
        self.assertEqual(response.data["like_count"], 0)

    def test_post_detail_includes_engagement_fields(self):
        Comment.objects.create(
            post=self.post,
            author=self.reader,
            content="One comment",
        )
        PostLike.objects.create(post=self.post, user=self.reader)
        self.client.force_authenticate(user=self.reader)
        response = self.client.get(f"/api/posts/{self.post.slug}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["like_count"], 1)
        self.assertEqual(response.data["comment_count"], 1)
        self.assertTrue(response.data["is_liked"])
        self.assertTrue(response.data["comments_enabled"])

    def test_author_can_disable_comments(self):
        self.client.force_authenticate(user=self.author)
        response = self.client.post(
            f"/api/posts/{self.post.slug}/comments/toggle/",
            {"comments_enabled": False},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.post.refresh_from_db()
        self.assertFalse(self.post.comments_enabled)

    def test_cannot_comment_when_disabled(self):
        self.post.comments_enabled = False
        self.post.save()
        self.client.force_authenticate(user=self.reader)
        response = self.client.post(
            f"/api/posts/{self.post.slug}/comments/",
            {"content": "Should fail"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_admin_moderate_delete_issues_warning(self):
        comment = Comment.objects.create(
            post=self.post,
            author=self.reader,
            content="Malicious content",
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/comments/{comment.id}/moderate-delete/",
            {"reason": "Hate speech and harassment"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["warning_count"], 1)
        self.assertFalse(response.data["suspended"])
        self.reader.refresh_from_db()
        self.assertEqual(self.reader.comment_warning_count, 1)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.reader,
                notification_type="comment_warning",
            ).exists()
        )
        self.assertFalse(Comment.objects.filter(pk=comment.id).exists())

    def test_repeated_warnings_suspend_account(self):
        self.client.force_authenticate(user=self.admin)
        for i in range(COMMENT_WARNING_SUSPEND_THRESHOLD):
            comment = Comment.objects.create(
                post=self.post,
                author=self.reader,
                content=f"Bad comment {i}",
            )
            response = self.client.post(
                f"/api/comments/{comment.id}/moderate-delete/",
                {"reason": "Repeated policy violations here"},
                format="json",
            )
            self.assertEqual(response.status_code, 200)

        self.reader.refresh_from_db()
        self.assertFalse(self.reader.is_active)
        self.assertIsNotNone(self.reader.comment_suspended_until)
        self.assertEqual(CommentWarning.objects.filter(user=self.reader).count(), 3)

    def test_cannot_reactivate_before_30_days(self):
        self.reader.is_active = False
        self.reader.comment_suspended_until = timezone.now() + timedelta(days=10)
        self.reader.comment_warning_count = 3
        self.reader.save()

        response = self.client.post(
            "/api/auth/reactivate-after-suspension/",
            {"identifier": "reader", "password": "pass12345"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.reader.refresh_from_db()
        self.assertFalse(self.reader.is_active)

    def test_can_reactivate_after_30_days(self):
        self.reader.is_active = False
        self.reader.comment_suspended_until = timezone.now() - timedelta(days=1)
        self.reader.comment_warning_count = 3
        self.reader.save()

        response = self.client.post(
            "/api/auth/reactivate-after-suspension/",
            {"identifier": "reader", "password": "pass12345"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.reader.refresh_from_db()
        self.assertTrue(self.reader.is_active)
        self.assertIsNone(self.reader.comment_suspended_until)
        self.assertEqual(self.reader.comment_warning_count, 0)
