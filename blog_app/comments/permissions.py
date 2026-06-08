from rest_framework.permissions import BasePermission

from common.enum import UserRole


class IsModerator(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == UserRole.MODERATOR
