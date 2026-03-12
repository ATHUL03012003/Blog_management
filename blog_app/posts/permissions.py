from rest_framework.permissions import BasePermission
from common.enum import UserRole


class IsAuthor(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == UserRole.AUTHOR


class IsEditor(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == UserRole.EDITOR



class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user.role in [
            UserRole.ADMIN,
            UserRole.SUPERADMIN
        ]       
