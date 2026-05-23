from django.test import TestCase
from core.models import User, Shelter
from core.services.volunteer_request_service import VolunteerRequestService
from core.exceptions import RequestAlreadyExistsError


class VolunteerRequestTest(TestCase):
    def test_duplicate_request_raises_error(self):
        user = User.objects.create(email="v2@test.com")
        owner = User.objects.create_user(
            email="volunteer-request-owner@test.com",
            password="password123",
            role="SHELTER_MANAGER",
        )
        shelter = Shelter.objects.create(
            owner=owner,
            name="Притулок",
            region="Київська",
            city="Київ",
            address="Адреса",
            phone="123",
        )

        VolunteerRequestService.create(user, shelter.id, phone="+380000000000")

        with self.assertRaises(RequestAlreadyExistsError):
            VolunteerRequestService.create(user, shelter.id, phone="+380000000000")
