from django.test import TestCase
from core.models import User, Shelter, VolunteerRequest
from core.services.volunteer_request_service import VolunteerRequestService
from core.exceptions import RequestAlreadyExistsError


class VolunteerRequestTest(TestCase):
    def test_duplicate_request_raises_error(self):
        user = User.objects.create(email="v2@test.com")
        shelter = Shelter.objects.create(name="Притулок", address="Адреса", phone="123")

        # Створюємо першу заявку успішно
        VolunteerRequestService.create(user, shelter.id)

        # Друга заявка має викликати помилку
        with self.assertRaises(RequestAlreadyExistsError):
            VolunteerRequestService.create(user, shelter.id)