from rest_framework import permissions
from core.models import UserRole


class IsVolunteer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.VOLUNTEER
        )


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):

        if hasattr(obj, "user"):
            return obj.user == request.user
        return False


class IsShelterOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):

        if hasattr(request.user, "volunteer_profile") and hasattr(obj, "shelter"):
            return obj.shelter == request.user.volunteer_profile.shelter
        return False
