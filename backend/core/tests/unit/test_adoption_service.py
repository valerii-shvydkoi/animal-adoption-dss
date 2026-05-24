from django.test import TestCase
from rest_framework.exceptions import ValidationError

from core.models import Pet, Questionnaire, QuestionnaireResult, Shelter, User
from core.services.adoption_service import AdoptionService


class AdoptionServiceTest(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@test.com",
            password="password123",
            role="SHELTER_MANAGER",
        )
        self.user = User.objects.create_user(
            email="adopter@test.com",
            password="password123",
            role="USER",
        )
        self.other_user = User.objects.create_user(
            email="other@test.com",
            password="password123",
            role="USER",
        )
        self.shelter = Shelter.objects.create(
            owner=self.owner,
            name="Тестовий притулок",
            region="Київська",
            city="Київ",
            address="вул. Тестова, 1",
            phone="+380501111111",
        )
        self.pet = Pet.objects.create(
            name="Лакі",
            shelter=self.shelter,
            age_months=12,
            is_available=True,
            activity_level=3,
            sociability=4,
            stress_resistance=4,
            weight=8.0,
        )
        questionnaire = Questionnaire.objects.create(
            user=self.other_user,
            matrix_data={
                "global_prefs": {"order": ["safety", "physical", "psychological"]}
            },
        )
        self.foreign_result = QuestionnaireResult.objects.create(
            questionnaire=questionnaire,
            snapshot_data={"weights": {"safety": 1.0}},
        )

    def test_create_request_rejects_foreign_questionnaire_result(self):
        with self.assertRaises(ValidationError):
            AdoptionService.create_request(
                user=self.user,
                pet_id=self.pet.id,
                result_id=self.foreign_result.id,
                message="Хочу познайомитися з твариною.",
            )
