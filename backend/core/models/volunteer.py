from django.db import models
from .base import TimeStampedModel
from .user import User
from .shelter import Shelter

class Volunteer(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE, related_name='volunteers')

    def __str__(self):
        return f"{self.user.email} - {self.shelter.name}"