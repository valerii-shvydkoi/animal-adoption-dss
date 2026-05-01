from django.db import models
from .base import TimeStampedModel
from .user import User
from .pet import Pet
from .enums import AdoptionStatus


class AdoptionRequest(TimeStampedModel):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="adoption_requests"
    )
    pet = models.ForeignKey(
        Pet, on_delete=models.CASCADE, related_name="adoption_requests"
    )
    questionnaire_result = models.ForeignKey(
        "core.QuestionnaireResult",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="adoption_requests",
    )
    status = models.CharField(
        max_length=20, choices=AdoptionStatus.choices, default=AdoptionStatus.PENDING
    )
