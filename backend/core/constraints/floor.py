from .base import BaseConstraint
from core.models import Pet


class FloorConstraint(BaseConstraint):
    def is_blocked(self, pet: Pet, user_data: dict) -> bool:
        floor = user_data.get("floor", 1)
        has_elevator = user_data.get("has_elevator", True)
        return floor > 5 and not has_elevator and pet.weight > 15

    @property
    def error_message(self) -> str:
        return "Проживання вище 5 поверху без ліфта не підходить для великої тварини."
