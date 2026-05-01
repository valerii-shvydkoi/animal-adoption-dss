from django.db import transaction
from core.models import Pet, AdoptionRequest, User, RequestStatus
from core.exceptions import PetNotAvailableError


class AdoptionService:
    @staticmethod
    def create_request(user: User, pet_id: int, result_id: int) -> AdoptionRequest:
        with transaction.atomic():
            # Блокуємо рядок тварини до кінця транзакції
            pet = Pet.objects.select_for_update().get(id=pet_id)

            if not pet.is_available:
                raise PetNotAvailableError()

            request = AdoptionRequest.objects.create(
                user=user, pet=pet, questionnaire_result_id=result_id, status=RequestStatus.PENDING
            )
            return request

    @staticmethod
    def cancel_all_for_pet(pet: Pet) -> None:
        AdoptionRequest.objects.filter(pet=pet, status=RequestStatus.PENDING).update(status=RequestStatus.REJECTED)
