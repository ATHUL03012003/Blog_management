from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from common.enum import PostStatus
from posts.cloudinary_utils import (
    COVER_FOLDER,
    _content_hash,
    _dedupe_public_id,
    cloudinary_url_in_use,
    delete_cloudinary_url,
    upload_image,
)
from posts.models import Post
from user.models import User


class CloudinaryDedupTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="author@example.com",
            password="pass12345",
            username="author",
        )

    def _image_file(self, name="test.png", content=b"same-bytes"):
        return SimpleUploadedFile(
            name,
            content,
            content_type="image/png",
        )

    @patch.dict("os.environ", {"CLOUDINARY_CLOUD_NAME": "test"})
    @patch("posts.cloudinary_utils.cloudinary.api.resource")
    @patch("posts.cloudinary_utils.cloudinary.uploader.upload")
    def test_upload_skips_when_hash_already_exists(self, mock_upload, mock_resource):
        content = b"duplicate-image"
        existing_url = "https://res.cloudinary.com/demo/image/upload/v1/existing.png"
        mock_resource.return_value = {"secure_url": existing_url}

        url = upload_image(self._image_file(content=content), folder=COVER_FOLDER)

        self.assertEqual(
            url, "https://res.cloudinary.com/demo/image/upload/v1/existing.png"
        )
        mock_upload.assert_not_called()

    @patch.dict("os.environ", {"CLOUDINARY_CLOUD_NAME": "test"})
    @patch("posts.cloudinary_utils.cloudinary.api.resource")
    @patch("posts.cloudinary_utils.cloudinary.uploader.upload")
    def test_upload_uses_content_addressed_public_id(self, mock_upload, mock_resource):
        from cloudinary.exceptions import NotFound

        content = b"new-image"
        mock_resource.side_effect = NotFound("missing")
        mock_upload.return_value = {
            "secure_url": "https://res.cloudinary.com/demo/image/upload/v1/new.png",
        }

        upload_image(self._image_file(content=content), folder=COVER_FOLDER)

        public_id = _dedupe_public_id(
            _content_hash(self._image_file(content=content)), COVER_FOLDER
        )
        mock_upload.assert_called_once()
        self.assertEqual(mock_upload.call_args.kwargs["public_id"], public_id)
        self.assertTrue(public_id.startswith(f"{COVER_FOLDER}/"))

    def test_cloudinary_url_in_use_detects_cover_and_content(self):
        url = "https://res.cloudinary.com/demo/image/upload/v1/shared.png"
        Post.objects.create(
            title="Post",
            slug="post-1",
            content=f'<p><img src="{url}" /></p>',
            author=self.user,
            status=PostStatus.DRAFT,
        )
        self.assertTrue(cloudinary_url_in_use(url))

    @patch.dict("os.environ", {"CLOUDINARY_CLOUD_NAME": "test"})
    @patch("posts.cloudinary_utils.cloudinary.uploader.destroy")
    def test_delete_skips_when_another_post_still_references_url(self, mock_destroy):
        url = "https://res.cloudinary.com/demo/image/upload/v1/shared.png"
        post_a = Post.objects.create(
            title="A",
            slug="post-a",
            content="",
            author=self.user,
            image=url,
            status=PostStatus.DRAFT,
        )
        Post.objects.create(
            title="B",
            slug="post-b",
            content=f'<img src="{url}" />',
            author=self.user,
            status=PostStatus.DRAFT,
        )

        delete_cloudinary_url(url, exclude_post_id=post_a.id)

        mock_destroy.assert_not_called()
