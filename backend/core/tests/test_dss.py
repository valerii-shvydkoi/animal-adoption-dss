from django.test import TestCase
from unittest.mock import Mock
from core.services.dss_matching_service import DSSMatchingService


class DSSMatchingServiceTests(TestCase):
    def setUp(self):
        self.user_weights = {
            "shelter": 0.20,
            "evacuation": 0.20,
            "floor": 0.20,
            "stress": 0.10,
            "social": 0.10,
            "character": 0.10,
            "activity": 0.05,
            "weight": 0.05,
            "age": 0.0,
        }

        self.heavy_dog = Mock()
        self.heavy_dog.species = "DOG"
        self.heavy_dog.weight = 40.0
        self.heavy_dog.age_months = 36
        self.heavy_dog.stress_resistance = 4
        self.heavy_dog.sociability = 4
        self.heavy_dog.activity_level = 3

    def test_heavy_dog_no_elevator_high_floor(self):
        profile = Mock()
        profile.has_elevator = False
        profile.floor = 9
        profile.has_car = True
        profile.has_shelter = True

        result = DSSMatchingService.calculate_match(
            self.user_weights, self.heavy_dog, user_profile=profile
        )

        self.assertIsNotNone(result)
        self.assertTrue(any("9 поверх без ліфта" in risk for risk in result["risks"]))
        self.assertTrue(result["match_percent"] < 80)

    def test_heavy_dog_with_elevator(self):
        profile = Mock()
        profile.has_elevator = True
        profile.floor = 9
        profile.has_car = True
        profile.has_shelter = True

        result = DSSMatchingService.calculate_match(
            self.user_weights, self.heavy_dog, user_profile=profile
        )

        self.assertFalse(any("без ліфта" in risk for risk in result["risks"]))
        self.assertTrue(result["match_percent"] > 60)

    def test_no_car_evacuation_risk(self):
        profile = Mock()
        profile.has_elevator = True
        profile.floor = 2
        profile.has_car = False
        profile.has_shelter = True

        result = DSSMatchingService.calculate_match(
            self.user_weights, self.heavy_dog, user_profile=profile
        )

        self.assertTrue(any("немає авто" in risk for risk in result["risks"]))
