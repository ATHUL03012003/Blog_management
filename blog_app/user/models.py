from django.db import models
from django.contrib.auth.models import AbstractUser
from .enum import UserRole
from .managers import UserManager
from django.core.exceptions import ValidationError

class User(AbstractUser):
    role = models.PositiveSmallIntegerField(
        choices=UserRole.choices,
        default=UserRole.READER,
    )
    is_verified = models.BooleanField(default=False)
    email = models.EmailField(unique=True)
    objects = UserManager()

    def save(self, *args, **kwargs):

        if self.role == UserRole.SUPERADMIN:
            if User.objects.filter(role=UserRole.SUPERADMIN).exclude(id=self.id).exists():
                raise ValidationError("Only one SuperAdmin is allowed")

        super().save(*args, **kwargs)
