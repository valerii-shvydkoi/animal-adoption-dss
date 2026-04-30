from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import SoftDeleteModel, TimeStampedModel
from .shelter import Shelter


class Pet(SoftDeleteModel, TimeStampedModel):
    name = models.CharField(max_length=100)
    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE, related_name="pets")
    is_available = models.BooleanField(default=True)

    # Шкали 1-5 для алгоритму AHP
    activity_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    sociability = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    stress_resistance = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    # Фізичні параметри для жорстких обмежень
    weight = models.DecimalField(max_digits=5, decimal_places=2)  # у кг

    def __str__(self):
        return self.name
