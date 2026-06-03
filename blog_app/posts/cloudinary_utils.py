"""Upload and manage post images on Cloudinary."""

import os
import re

import cloudinary.uploader
from django.core.exceptions import ImproperlyConfigured

from .media_constants import ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE

COVER_FOLDER = "blogapp/posts/covers"
CONTENT_FOLDER = "blogapp/posts/content"

CLOUDINARY_UPLOAD_SEGMENT = "/upload/"
PUBLIC_ID_FROM_URL = re.compile(
    r"res\.cloudinary\.com/[^/]+/image/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z0-9]+)?$"
)


def _ensure_configured():
    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        raise ImproperlyConfigured(
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in blog_app/.env"
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
    _ensure_configured()
    validate_image_file(image)
    result = cloudinary.uploader.upload(
        image,
        folder=folder,
        resource_type="image",
        overwrite=False,
        unique_filename=True,
        use_filename=False,
    )
    return result["secure_url"]


def public_id_from_url(url: str) -> str | None:
    if not url or "res.cloudinary.com" not in url:
        return None
    clean = url.split("?")[0]
    if CLOUDINARY_UPLOAD_SEGMENT in clean:
        after = clean.split(CLOUDINARY_UPLOAD_SEGMENT, 1)[1]
        # Strip transformation segments (e.g. f_auto,q_auto)
        parts = after.split("/")
        while parts and parts[0].startswith(("f_", "q_", "w_", "h_", "c_")):
            parts.pop(0)
        if not parts:
            return None
        public_id = "/".join(parts)
        if public_id.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif")):
            public_id = public_id.rsplit(".", 1)[0]
        return public_id
    match = PUBLIC_ID_FROM_URL.search(clean)
    return match.group(1) if match else None


def delete_cloudinary_url(url: str) -> None:
    public_id = public_id_from_url(url)
    if not public_id:
        return
    try:
        _ensure_configured()
        cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception:
        pass


def extract_image_urls_from_html(html: str) -> list[str]:
    if not html:
        return []
    return re.findall(r'src=["\'](https://res\.cloudinary\.com[^"\']+)["\']', html)
