from django.urls import path
from .views import (
    GoogleLoginView,
    RegisterView,
    LoginView,
    ProfileView,
    ChangePasswordView,
    AdminUserListView,
    AdminSetUserRoleView,
    SuperAdminOverviewView,
    SuperAdminUserListView,
    SuperAdminSetUserRoleView,
)

urlpatterns = [
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:user_id>/role/", AdminSetUserRoleView.as_view(), name="admin-set-user-role"),
    path("superadmin/overview/", SuperAdminOverviewView.as_view(), name="superadmin-overview"),
    path("superadmin/users/", SuperAdminUserListView.as_view(), name="superadmin-user-list"),
    path(
        "superadmin/users/<int:user_id>/role/",
        SuperAdminSetUserRoleView.as_view(),
        name="superadmin-set-user-role",
    ),
]