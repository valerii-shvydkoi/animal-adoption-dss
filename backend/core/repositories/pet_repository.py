from typing import List
from core.models import Pet


class PetRepository:
    @staticmethod
    def get_available() -> List[Pet]:
        return list(Pet.objects.filter(is_available=True))

    @staticmethod
    def get_by_shelter(shelter_id: int) -> List[Pet]:
        return list(Pet.objects.filter(shelter_id=shelter_id, is_available=True))
