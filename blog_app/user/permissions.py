from rest_framework.permissions import BasePermission
from common.enum import UserRole


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == UserRole.SUPERADMIN
