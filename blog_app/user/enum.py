from django.db import models


class UserRole(models.IntegerChoices):
    ADMIN = 0, "Admin"
    READER = 1, "Reader"
    AUTHOR = 2, "Author"
    EDITOR = 3, "Editor"
    MODERATOR = 4, "Moderator"  
    SUPERADMIN = 5, "SuperAdmin"