from django.contrib import admin

from .models import User, RoleChangeRequest, Notification

admin.site.register(User)
admin.site.register(RoleChangeRequest)
admin.site.register(Notification)