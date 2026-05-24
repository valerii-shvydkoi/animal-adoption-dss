from django.db import transaction
from rest_framework.exceptions import ValidationError, NotFound
from core.models import Pet, AdoptionRequest, User, QuestionnaireResult
from core.models.enums import AdoptionStatus
from core.exceptions import PetNotAvailableError


class AdoptionService:
    @staticmethod
    def create_request(
        user: User, pet_id: int, result_id: int = None, message: str = None
    ) -> AdoptionRequest:
        with transaction.atomic():
            try:
                pet = Pet.objects.select_for_update().get(id=pet_id)
            except Pet.DoesNotExist:
                raise NotFound({"detail": "Улюбленця не знайдено."})

            if not pet.is_available:
                raise PetNotAvailableError()

            active_statuses = [
                AdoptionStatus.PENDING,
                AdoptionStatus.REVIEWED,
                AdoptionStatus.APPROVED,
            ]
            if AdoptionRequest.objects.filter(
                user=user, pet=pet, status__in=active_statuses
            ).exists():
                raise ValidationError(
                    {"detail": "Ви вже подали активну заявку на цю тварину."}
                )

            questionnaire_result = None

            if result_id:
                questionnaire_result = (
                    QuestionnaireResult.objects.filter(questionnaire__user=user)
                    .filter(id=result_id)
                    .first()
                )

                if questionnaire_result is None:
                    raise ValidationError(
                        {
                            "detail": (
                                "Результат анкети не знайдено "
                                "або він не належить користувачу."
                            )
                        }
                    )
            else:
                questionnaire_result = (
                    QuestionnaireResult.objects.filter(questionnaire__user=user)
                    .order_by("-created_at")
                    .first()
                )

            request = AdoptionRequest.objects.create(
                user=user,
                pet=pet,
                questionnaire_result=questionnaire_result,
                message=message,
                status=AdoptionStatus.PENDING,
            )
            return request

    @staticmethod
    def cancel_all_for_pet(pet: Pet) -> None:
        AdoptionRequest.objects.filter(
            pet=pet,
            status__in=[AdoptionStatus.PENDING, AdoptionStatus.REVIEWED],
        ).update(status=AdoptionStatus.REJECTED)
