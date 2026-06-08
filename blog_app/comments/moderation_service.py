from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from common.enum import NotificationType, UserRole
from user.models import Notification

from .constants import COMMENT_SUSPENSION_DAYS, COMMENT_WARNING_SUSPEND_THRESHOLD
from .models import Comment, CommentWarning

User = get_user_model()


class CommentModerationService:

    @staticmethod
    def _is_admin(user):
        return user.role in (UserRole.ADMIN, UserRole.SUPERADMIN)

    @staticmethod
    def _notify_user(user, notification_type, title, message):
        Notification.objects.create(
            recipient=user,
            notification_type=notification_type,
            title=title,
            message=message,
        )

    @staticmethod
    @transaction.atomic
    def moderate_delete(admin, comment, reason):
        if not CommentModerationService._is_admin(admin):
            raise ValidationError("Only Admin or Super Admin can moderate comments.")

        if admin.id == comment.author_id:
            raise ValidationError("You cannot moderate your own comment.")

        target_user = comment.author
        if target_user.role == UserRole.SUPERADMIN:
            raise ValidationError("Super Admin accounts cannot receive comment warnings.")

        CommentWarning.objects.create(
            user=target_user,
            issued_by=admin,
            comment_content=comment.content,
            reason=reason.strip(),
        )

        target_user.comment_warning_count += 1
        suspended = False
        suspended_until = None

        if target_user.comment_warning_count >= COMMENT_WARNING_SUSPEND_THRESHOLD:
            suspended_until = timezone.now() + timedelta(days=COMMENT_SUSPENSION_DAYS)
            target_user.is_active = False
            target_user.comment_suspended_until = suspended_until
            suspended = True

        target_user.save(
            update_fields=[
                "comment_warning_count",
                "is_active",
                "comment_suspended_until",
            ]
        )

        comment.delete()

        warning_message = (
            f"Your comment was removed for violating community guidelines. "
            f"Reason: {reason.strip()} "
            f"(Warning {target_user.comment_warning_count} of "
            f"{COMMENT_WARNING_SUSPEND_THRESHOLD}.)"
        )
        CommentModerationService._notify_user(
            target_user,
            NotificationType.COMMENT_WARNING,
            "Comment removed — warning issued",
            warning_message,
        )

        if suspended:
            CommentModerationService._notify_user(
                target_user,
                NotificationType.COMMENT_SUSPENSION,
                "Account temporarily suspended",
                (
                    f"Your account has been suspended for {COMMENT_SUSPENSION_DAYS} days "
                    f"due to repeated comment violations. You may reactivate your account "
                    f"after {suspended_until.strftime('%B %d, %Y')}."
                ),
            )

        return {
            "message": "Comment removed and warning issued.",
            "warning_count": target_user.comment_warning_count,
            "suspended": suspended,
            "suspended_until": suspended_until,
        }

    @staticmethod
    def can_toggle_comments(user, post):
        if user.role in (UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPERADMIN):
            return True
        if user.role == UserRole.AUTHOR and post.author_id == user.id:
            return True
        return False

    @staticmethod
    def toggle_comments(user, post, enabled):
        if not CommentModerationService.can_toggle_comments(user, post):
            raise ValidationError("You do not have permission to change comment settings.")

        post.comments_enabled = enabled
        post.save(update_fields=["comments_enabled", "updated_at"])
        return post

    @staticmethod
    def ensure_user_can_comment(user):
        if not user.is_active:
            if user.comment_suspended_until:
                if timezone.now() < user.comment_suspended_until:
                    remaining = (user.comment_suspended_until - timezone.now()).days + 1
                    raise ValidationError(
                        f"Your account is suspended. You can reactivate after "
                        f"{user.comment_suspended_until.strftime('%B %d, %Y')} "
                        f"({remaining} day(s) remaining)."
                    )
                raise ValidationError(
                    "Your account is suspended. Use the reactivation endpoint to restore access."
                )
            raise ValidationError("Your account is inactive.")

    @staticmethod
    def reactivate_after_suspension(user):
        if user.is_active:
            raise ValidationError("Account is already active.")

        if not user.comment_suspended_until:
            raise ValidationError(
                "This account was deactivated by an administrator and cannot be self-reactivated."
            )

        if timezone.now() < user.comment_suspended_until:
            remaining = (user.comment_suspended_until - timezone.now()).days + 1
            raise ValidationError(
                f"You can reactivate your account after "
                f"{user.comment_suspended_until.strftime('%B %d, %Y')} "
                f"({remaining} day(s) remaining)."
            )

        user.is_active = True
        user.comment_suspended_until = None
        user.comment_warning_count = 0
        user.save(
            update_fields=[
                "is_active",
                "comment_suspended_until",
                "comment_warning_count",
            ]
        )
        return user

    @staticmethod
    def get_suspension_login_message(user):
        if not user.comment_suspended_until:
            return "This account has been deactivated."

        if timezone.now() < user.comment_suspended_until:
            remaining = (user.comment_suspended_until - timezone.now()).days + 1
            return (
                f"Your account is suspended until "
                f"{user.comment_suspended_until.strftime('%B %d, %Y')} "
                f"({remaining} day(s) remaining) due to comment violations."
            )

        return (
            "Your suspension period has ended. "
            "Use POST /api/auth/reactivate-after-suspension/ to restore your account."
        )
