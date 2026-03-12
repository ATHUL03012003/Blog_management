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