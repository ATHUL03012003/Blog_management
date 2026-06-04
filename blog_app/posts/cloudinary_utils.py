"""Upload and manage post images on Cloudinary."""

import hashlib
import mimetypes
import os
import re
from pathlib import Path

import cloudinary.api
import cloudinary.uploader
from cloudinary.exceptions import NotFound
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.files import File
from django.db.models import Q

from .media_constants import ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE
from .models import Post

COVER_FOLDER = "blogapp/posts/covers"
CONTENT_FOLDER = "blogapp/posts/content"
# Legacy shared dedup folder (still checked when reusing existing assets).
DEDUP_FOLDER = "blogapp/posts/dedup"
ALL_IMAGE_FOLDERS = (DEDUP_FOLDER, COVER_FOLDER, CONTENT_FOLDER)

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


def _read_image_bytes(image) -> bytes:
    if hasattr(image, "read"):
        image.seek(0)
        data = image.read()
        image.seek(0)
        return data
    return bytes(image)


def _content_hash(image) -> str:
    return hashlib.sha256(_read_image_bytes(image)).hexdigest()


def _dedupe_public_id(content_hash: str, folder: str) -> str:
    return f"{folder}/{content_hash}"


def _existing_resource_url(public_id: str) -> str | None:
    try:
        resource = cloudinary.api.resource(public_id, resource_type="image")
    except NotFound:
        return None
    return resource.get("secure_url")


def _find_existing_by_hash(content_hash: str) -> str | None:
    for folder in ALL_IMAGE_FOLDERS:
        url = _existing_resource_url(_dedupe_public_id(content_hash, folder))
        if url:
            return url
    return None


def is_cloudinary_url(url: str | None) -> bool:
    return bool(url and "res.cloudinary.com" in url)


def resolve_local_media_path(url: str) -> Path | None:
    """Map a legacy ``/media/...`` URL to a file under ``MEDIA_ROOT``."""
    if not url:
        return None
    path_part = None
    if url.startswith("/media/"):
        path_part = url.removeprefix("/media/").lstrip("/")
    elif "/media/" in url:
        path_part = url.split("/media/", 1)[1].lstrip("/")
    if not path_part:
        return None
    local = Path(settings.MEDIA_ROOT) / path_part
    return local if local.is_file() else None


def ensure_cloudinary_image_url(url: str | None, *, folder: str) -> str | None:
    """Upload a legacy local media file to Cloudinary and return its HTTPS URL."""
    if not url or is_cloudinary_url(url):
        return url
    local_path = resolve_local_media_path(url)
    if not local_path:
        return url
    content_type, _ = mimetypes.guess_type(local_path.name)
    with local_path.open("rb") as handle:
        uploaded = File(handle, name=local_path.name)
        if content_type:
            uploaded.content_type = content_type
        return upload_image(uploaded, folder=folder)


def cloudinary_url_in_use(url: str, *, exclude_post_id: int | None = None) -> bool:
    if not url:
        return False
    qs = Post.objects.filter(Q(image=url) | Q(content__contains=url))
    if exclude_post_id is not None:
        qs = qs.exclude(pk=exclude_post_id)
    return qs.exists()


def upload_image(image, *, folder: str) -> str:
    """Upload an image, reusing an existing Cloudinary asset when bytes match.

    Covers are stored under ``COVER_FOLDER``, inline images under ``CONTENT_FOLDER``.
    The same file bytes are not uploaded twice even across those folders.
    """
    _ensure_configured()
    validate_image_file(image)

    content_hash = _content_hash(image)
    public_id = _dedupe_public_id(content_hash, folder)

    existing_url = _find_existing_by_hash(content_hash)
    if existing_url:
        return existing_url

    try:
        result = cloudinary.uploader.upload(
            image,
            public_id=public_id,
            resource_type="image",
            overwrite=False,
            unique_filename=False,
            use_filename=False,
        )
    except Exception:
        # Concurrent upload of the same file may win the race; reuse the asset.
        existing_url = _find_existing_by_hash(content_hash)
        if existing_url:
            return existing_url
        raise

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


def delete_cloudinary_url(url: str, *, exclude_post_id: int | None = None) -> None:
    if cloudinary_url_in_use(url, exclude_post_id=exclude_post_id):
        return
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
