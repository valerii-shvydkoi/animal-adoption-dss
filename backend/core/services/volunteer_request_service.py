from django.db import transaction
from core.models import VolunteerRequest, RequestStatus, User
from core.exceptions import RequestAlreadyExistsError


class VolunteerRequestService:
    @staticmethod
    def create(user: User, shelter_id: int) -> VolunteerRequest:
        if VolunteerRequest.objects.filter(
            user=user, status=RequestStatus.PENDING
        ).exists():
            raise RequestAlreadyExistsError()
        return VolunteerRequest.objects.create(
            user=user, shelter_id=shelter_id, status=RequestStatus.PENDING
        )

    @staticmethod
    def approve(request_id: int) -> VolunteerRequest:
        with transaction.atomic():
            req = VolunteerRequest.objects.select_for_update().get(id=request_id)
            req.status = RequestStatus.APPROVED
            req.save()
            return req

    @staticmethod
    def reject(request_id: int) -> VolunteerRequest:
        with transaction.atomic():
            req = VolunteerRequest.objects.select_for_update().get(id=request_id)
            req.status = RequestStatus.REJECTED
            req.save()
            return req
