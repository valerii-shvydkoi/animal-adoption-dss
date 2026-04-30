from django.test import TestCase
from core.services.feedback_service import FeedbackService


class FeedbackServiceTest(TestCase):
    def test_generate_advice_for_car(self):
        reasons = ['Тварина занадто важка для евакуації без власного автомобіля.']
        advice = FeedbackService.generate_advice(reasons)

        # Перевіряємо, чи є в пораді згадка про авто
        self.assertTrue(any('авто' in a for a in advice))