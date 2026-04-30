from django.db import models
from .base import TimeStampedModel


class Shelter(TimeStampedModel):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name
