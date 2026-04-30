from django.db import models
from .base import TimeStampedModel
from .questionnaire import Questionnaire


class QuestionnaireResult(TimeStampedModel):
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, related_name="results")
    snapshot_data = models.JSONField(help_text="Збережені результати на момент розрахунку")
