from typing import List
from core.models import AdoptionRequest, User, Shelter

class AdoptionRepository:
    @staticmethod
    def get_user_requests(user: User) -> List[AdoptionRequest]:
        return list(AdoptionRequest.objects.filter(user=user).order_by('-created_at'))

    @staticmethod
    def get_shelter_requests(shelter: Shelter) -> List[AdoptionRequest]:
        return list(AdoptionRequest.objects.filter(pet__shelter=shelter).select_related('user', 'pet'))