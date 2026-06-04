from django.core.management.base import BaseCommand

from posts.cloudinary_utils import COVER_FOLDER, ensure_cloudinary_image_url
from posts.models import Post


class Command(BaseCommand):
    help = "Upload legacy /media/posts/ cover images to Cloudinary and update post records."

    def handle(self, *args, **options):
        migrated = 0
        skipped = 0
        for post in Post.objects.exclude(image__isnull=True).exclude(image=""):
            new_url = ensure_cloudinary_image_url(post.image, folder=COVER_FOLDER)
            if not new_url or new_url == post.image:
                skipped += 1
                continue
            post.image = new_url
            post.save(update_fields=["image", "updated_at"])
            migrated += 1
            self.stdout.write(f"  {post.slug} -> {new_url}")

        self.stdout.write(
            self.style.SUCCESS(f"Done. Migrated {migrated}, skipped {skipped}.")
        )
