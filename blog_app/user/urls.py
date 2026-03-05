from django.urls import path
from .views import GoogleLoginView, RegisterView, LoginView

urlpatterns = [
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),  
]