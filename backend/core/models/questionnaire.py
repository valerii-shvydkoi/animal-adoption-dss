from django.db import models
from .base import TimeStampedModel
from .user import User


class Questionnaire(TimeStampedModel):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="questionnaire"
    )
    matrix_data = models.JSONField(help_text="Збережена матриця порівнянь AHP")
