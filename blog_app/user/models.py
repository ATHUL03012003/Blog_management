from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from common.enum import UserRole, RoleChangeRequestStatus, NotificationType
from .managers import UserManager
from django.core.exceptions import ValidationError


class User(AbstractUser):
    role = models.PositiveSmallIntegerField(
        choices=UserRole.choices,
        default=UserRole.READER,
    )
    is_verified = models.BooleanField(default=False)
    email = models.EmailField(unique=True)
    comment_warning_count = models.PositiveSmallIntegerField(default=0)
    comment_suspended_until = models.DateTimeField(null=True, blank=True)
    objects = UserManager()
    USERNAME_FIELD = 'username'           # ✅ Login with username
    REQUIRED_FIELDS = ['email']

    def save(self, *args, **kwargs):

        if self.role == UserRole.SUPERADMIN:
            if User.objects.filter(role=UserRole.SUPERADMIN).exclude(id=self.id).exists():
                raise ValidationError("Only one SuperAdmin is allowed")

        super().save(*args, **kwargs)


class RoleChangeRequest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="role_change_requests",
    )
    current_role = models.PositiveSmallIntegerField(choices=UserRole.choices)
    requested_role = models.PositiveSmallIntegerField(choices=UserRole.choices)
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=RoleChangeRequestStatus.choices,
        default=RoleChangeRequestStatus.PENDING,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_role_requests",
    )
    review_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.get_current_role_display()} → {self.get_requested_role_display()} ({self.status})"


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(
        max_length=40,
        choices=NotificationType.choices,
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    role_change_request = models.ForeignKey(
        RoleChangeRequest,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.recipient.username}"
