from .base import BaseConstraint
from core.models import Pet


class WeightConstraint(BaseConstraint):
    # Блокує великих тварин, якщо у користувача немає авто для евакуації
    def is_blocked(self, pet: Pet, user_data: dict) -> bool:
        has_car = user_data.get("has_car", False)
        return pet.weight > 15 and not has_car

    @property
    def error_message(self) -> str:
        return "Тварина занадто важка для евакуації без власного автомобіля."
