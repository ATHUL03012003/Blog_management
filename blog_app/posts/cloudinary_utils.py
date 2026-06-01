"""Upload post images to Cloudinary (no local media/ storage)."""

import os

import cloudinary.uploader
from django.core.exceptions import ImproperlyConfigured

from .media_constants import ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE

COVER_FOLDER = "blogapp/posts/covers"
CONTENT_FOLDER = "blogapp/posts/content"


def _ensure_configured():
    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        raise ImproperlyConfigured(
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment."
        )


def validate_image_file(image):
    if not image:
        raise ValueError("No image file provided.")
    if image.size > MAX_IMAGE_SIZE:
        raise ValueError("Image must be 5MB or smaller.")
    content_type = getattr(image, "content_type", "") or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError("Allowed types: JPEG, PNG, WebP, GIF.")


def upload_image(image, *, folder: str) -> str:
    """Upload a file to Cloudinary and return the HTTPS URL (stored in DB / HTML)."""
    _ensure_configured()
    validate_image_file(image)
    result = cloudinary.uploader.upload(
        image,
        folder=folder,
        resource_type="image",
        overwrite=False,
    )
    return result["secure_url"]
