from django.db.models import Count, Exists, OuterRef

from posts.models import Post

from .models import PostLike


def annotate_post_engagement(queryset, user=None):
    queryset = queryset.annotate(
        like_count=Count("likes", distinct=True),
        comment_count=Count("comments", distinct=True),
    )
    if user and user.is_authenticated:
        queryset = queryset.annotate(
            is_liked=Exists(
                PostLike.objects.filter(post=OuterRef("pk"), user=user)
            )
        )
    return queryset
