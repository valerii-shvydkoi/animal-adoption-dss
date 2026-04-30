from django.test import TestCase
from core.services.ahp_service import AHPService


class AHPServiceTest(TestCase):
    def test_consistent_matrix(self):
        # Ідеально узгоджена матриця 3x3
        matrix = [
            [1, 3, 5],
            [1 / 3, 1, 3],
            [1 / 5, 1 / 3, 1]
        ]
        result = AHPService.calculate_weights(matrix)

        self.assertTrue(result['is_consistent'])
        self.assertTrue(result['cr'] < 0.1)
        self.assertEqual(len(result['weights']), 3)

    def test_inconsistent_matrix(self):
        # Абсолютно нелогічна матриця (A > B, B > C, але C > A)
        matrix = [
            [1, 9, 1 / 9],
            [1 / 9, 1, 9],
            [9, 1 / 9, 1]
        ]
        result = AHPService.calculate_weights(matrix)

        self.assertFalse(result['is_consistent'])
        self.assertTrue(result['cr'] >= 0.1)