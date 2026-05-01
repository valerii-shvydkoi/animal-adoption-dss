from django.test import TestCase
from core.models import Pet, Shelter, User, VolunteerRequest, RequestStatus, Volunteer, UserRole, AdoptionRequest


class SignalsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="v@test.com")
        self.shelter = Shelter.objects.create(name="Притулок", address="Адреса", phone="123")

    def test_volunteer_approval_signal(self):
        req = VolunteerRequest.objects.create(user=self.user, shelter=self.shelter, status=RequestStatus.PENDING)
        req.status = RequestStatus.APPROVED
        req.save()

        self.user.refresh_from_db()
        self.assertEqual(self.user.role, UserRole.VOLUNTEER)
        self.assertTrue(Volunteer.objects.filter(user=self.user).exists())

    def test_pet_delete_cancels_requests(self):
        pet = Pet.objects.create(name="Пес", shelter=self.shelter, activity_level=1, sociability=1, stress_resistance=1, weight=10.0)
        req = AdoptionRequest.objects.create(user=self.user, pet=pet, status=RequestStatus.PENDING, questionnaire_result_id=1)

        pet.delete()
        req.refresh_from_db()
        self.assertEqual(req.status, RequestStatus.REJECTED)