from django.db import transaction
from core.models import VolunteerRequest, RequestStatus, User
from core.exceptions import RequestAlreadyExistsError


class VolunteerRequestService:
    @staticmethod
    def create(
        user: User,
        shelter_id: int = None,
        phone: str = None,
        experience: str = None,
        availability: str = None,
        message: str = None,
        new_shelter_name: str = None,
        new_shelter_region: str = None,
        new_shelter_city: str = None,
        new_shelter_address: str = None,
        new_shelter_website: str = None,
    ) -> VolunteerRequest:
        if VolunteerRequest.objects.filter(
            user=user, status=RequestStatus.PENDING
        ).exists():
            raise RequestAlreadyExistsError()

        return VolunteerRequest.objects.create(
            user=user,
            shelter_id=int(shelter_id) if shelter_id else None,
            phone=phone or "",
            experience=experience,
            availability=availability,
            message=message,
            new_shelter_name=new_shelter_name,
            new_shelter_region=new_shelter_region,
            new_shelter_city=new_shelter_city,
            new_shelter_address=new_shelter_address,
            new_shelter_website=new_shelter_website,
            status=RequestStatus.PENDING,
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
