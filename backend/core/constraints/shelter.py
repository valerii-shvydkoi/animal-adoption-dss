from .base import BaseConstraint
from core.models import Pet

class ShelterConstraint(BaseConstraint):
    # Блокує стресозалежних тварин, якщо поруч немає укриття
    def is_blocked(self, pet: Pet, user_data: dict) -> bool:
        has_shelter = user_data.get('has_nearby_shelter', False)
        return pet.stress_resistance < 3 and not has_shelter

    @property
    def error_message(self) -> str:
        return 'Тварина чутлива до стресу, а поруч відсутнє надійне укриття.'