from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from common.enum import UserRole, RoleChangeRequestStatus, NotificationType
from .models import RoleChangeRequest, Notification

User = get_user_model()

ROLE_REQUEST_ELIGIBLE = {UserRole.READER, UserRole.AUTHOR, UserRole.EDITOR}

ROLE_REQUEST_TARGETS = {
    UserRole.READER: [UserRole.AUTHOR],
    UserRole.AUTHOR: [UserRole.READER, UserRole.EDITOR],
    UserRole.EDITOR: [UserRole.AUTHOR, UserRole.ADMIN],
}


def get_requestable_roles(user):
    return ROLE_REQUEST_TARGETS.get(user.role, [])


def role_change_requires_superadmin(request_obj):
    """Admin cannot approve; only Super Admin may act on this request."""
    user = request_obj.user
    requested = request_obj.requested_role
    if user.role == UserRole.ADMIN:
        return True
    if user.role == UserRole.EDITOR:
        return True
    if requested in (UserRole.ADMIN, UserRole.EDITOR):
        return True
    return False


class RoleChangeRequestService:

    @staticmethod
    def _role_label(role):
        return UserRole(role).label

    @staticmethod
    def _notify_admins(request_obj):
        admins = User.objects.filter(role__in=(UserRole.ADMIN, UserRole.SUPERADMIN))
        user = request_obj.user
        title = "New role change request"
        message = (
            f"{user.username} requested to change from "
            f"{RoleChangeRequestService._role_label(request_obj.current_role)} to "
            f"{RoleChangeRequestService._role_label(request_obj.requested_role)}."
        )
        Notification.objects.bulk_create(
            [
                Notification(
                    recipient=admin,
                    notification_type=NotificationType.ROLE_CHANGE_REQUEST,
                    title=title,
                    message=message,
                    role_change_request=request_obj,
                )
                for admin in admins
            ]
        )

    @staticmethod
    def _notify_requester(request_obj, approved):
        status_word = "approved" if approved else "rejected"
        Notification.objects.create(
            recipient=request_obj.user,
            notification_type=NotificationType.ROLE_CHANGE_RESOLVED,
            title=f"Role change request {status_word}",
            message=(
                f"Your request to become "
                f"{RoleChangeRequestService._role_label(request_obj.requested_role)} "
                f"was {status_word}."
            ),
            role_change_request=request_obj,
        )

    @staticmethod
    def create_request(user, requested_role, message=""):
        if user.role not in ROLE_REQUEST_ELIGIBLE:
            raise ValidationError("Your role cannot submit a role change request.")

        allowed = get_requestable_roles(user)
        if requested_role not in allowed:
            raise ValidationError("You cannot request this role from your current role.")

        if requested_role == user.role:
            raise ValidationError("You already have this role.")

        if RoleChangeRequest.objects.filter(
            user=user,
            status=RoleChangeRequestStatus.PENDING,
        ).exists():
            raise ValidationError("You already have a pending role change request.")

        request_obj = RoleChangeRequest.objects.create(
            user=user,
            current_role=user.role,
            requested_role=requested_role,
            message=(message or "").strip(),
        )
        RoleChangeRequestService._notify_admins(request_obj)
        return request_obj

    @staticmethod
    def list_for_user(user):
        return RoleChangeRequest.objects.filter(user=user)

    @staticmethod
    def list_pending_for_reviewer(actor):
        if actor.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
            raise ValidationError("Only administrators can view role change requests.")

        qs = RoleChangeRequest.objects.filter(
            status=RoleChangeRequestStatus.PENDING,
        ).select_related("user")

        if actor.role == UserRole.ADMIN:
            qs = qs.exclude(
                user__role=UserRole.ADMIN,
            ).exclude(
                user__role=UserRole.EDITOR,
            ).exclude(
                requested_role__in=(UserRole.ADMIN, UserRole.EDITOR),
            )
        return qs

    @staticmethod
    def _actor_can_review(actor, request_obj):
        if actor.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
            raise ValidationError("Only administrators can review role change requests.")

        if request_obj.status != RoleChangeRequestStatus.PENDING:
            raise ValidationError("This request has already been reviewed.")

        if role_change_requires_superadmin(request_obj):
            if actor.role != UserRole.SUPERADMIN:
                raise ValidationError(
                    "Only Super Admin can review this request."
                )
        return True

    @staticmethod
    @transaction.atomic
    def approve_request(actor, request_obj, review_note=""):
        from .services import UserService

        RoleChangeRequestService._actor_can_review(actor, request_obj)

        user = request_obj.user
        new_role = request_obj.requested_role

        if role_change_requires_superadmin(request_obj):
            UserService.superadmin_set_user_role(actor, user, new_role)
        else:
            UserService.admin_set_user_role(actor, user, new_role)

        request_obj.status = RoleChangeRequestStatus.APPROVED
        request_obj.reviewed_by = actor
        request_obj.review_note = (review_note or "").strip()
        request_obj.save()

        RoleChangeRequestService._notify_requester(request_obj, approved=True)
        return request_obj

    @staticmethod
    @transaction.atomic
    def reject_request(actor, request_obj, review_note=""):
        RoleChangeRequestService._actor_can_review(actor, request_obj)

        request_obj.status = RoleChangeRequestStatus.REJECTED
        request_obj.reviewed_by = actor
        request_obj.review_note = (review_note or "").strip()
        request_obj.save()

        RoleChangeRequestService._notify_requester(request_obj, approved=False)
        return request_obj


class NotificationService:

    @staticmethod
    def list_for_user(user, unread_only=False):
        qs = Notification.objects.filter(recipient=user)
        if unread_only:
            qs = qs.filter(is_read=False)
        return qs

    @staticmethod
    def unread_count(user):
        return Notification.objects.filter(recipient=user, is_read=False).count()

    @staticmethod
    def mark_read(user, notification_id):
        try:
            notification = Notification.objects.get(pk=notification_id, recipient=user)
        except Notification.DoesNotExist:
            raise ValidationError("Notification not found.")
        notification.is_read = True
        notification.save()
        return notification

    @staticmethod
    def mark_all_read(user):
        Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
