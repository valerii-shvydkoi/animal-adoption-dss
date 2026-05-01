from django.db import models
from .base import TimeStampedModel
from .user import User
from .enums import RequestStatus


class VolunteerRequest(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="volunteer_request")
    shelter = models.ForeignKey(
        'core.Shelter',
        on_delete=models.CASCADE,
        related_name="volunteer_requests",
        null=True
    )
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    