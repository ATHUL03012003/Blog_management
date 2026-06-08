from django.db import models


class UserRole(models.IntegerChoices):
    ADMIN = 0, "Admin"
    READER = 1, "Reader"
    AUTHOR = 2, "Author"
    EDITOR = 3, "Editor"
    MODERATOR = 4, "Moderator"  
    SUPERADMIN = 5, "SuperAdmin"

class PostStatus(models.IntegerChoices):
    DRAFT = 1, "Draft"
    REVIEW = 2, "Review"
    PUBLISHED = 3, "Published"
    REJECTED = 4, "Rejected"
    APPROVED = 5, "Approved"


class RoleChangeRequestStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class NotificationType(models.TextChoices):
    ROLE_CHANGE_REQUEST = "role_change_request", "Role change request"
    ROLE_CHANGE_RESOLVED = "role_change_resolved", "Role change resolved"
    COMMENT_WARNING = "comment_warning", "Comment warning"
    COMMENT_SUSPENSION = "comment_suspension", "Comment suspension"