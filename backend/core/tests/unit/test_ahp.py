from django.test import TestCase
from core.services.ahp_service import AHPService


class AHPServiceTest(TestCase):
    def test_consistent_matrix(self):
        matrix = [[1, 3, 5], [1 / 3, 1, 3], [1 / 5, 1 / 3, 1]]
        result = AHPService.calculate_weights(matrix)

        self.assertTrue(result["is_consistent"])
        self.assertTrue(result["cr"] < 0.1)
        self.assertEqual(len(result["weights"]), 3)

    def test_inconsistent_matrix(self):
        matrix = [[1, 9, 1 / 9], [1 / 9, 1, 9], [9, 1 / 9, 1]]
        result = AHPService.calculate_weights(matrix)

        self.assertFalse(result["is_consistent"])
        self.assertTrue(result["cr"] >= 0.1)

    def test_processed_weights_are_normalized(self):
        ahp_data = {
            "global_prefs": {
                "order": ["safety", "physical", "psychological"],
                "intensity_12": 3,
                "intensity_23": 2,
            },
            "safety": {
                "order": ["shelter", "evacuation", "floor"],
                "intensity_12": 3,
                "intensity_23": 2,
            },
            "physical": {
                "order": ["weight", "activity", "age"],
                "intensity_12": 2,
                "intensity_23": 2,
            },
            "psychological": {
                "order": ["stress", "social", "character"],
                "intensity_12": 2,
                "intensity_23": 3,
            },
        }

        weights = AHPService.process_all_categories(ahp_data)

        self.assertAlmostEqual(sum(weights.values()), 1.0, places=6)
        self.assertEqual(
            set(weights.keys()),
            {
                "shelter",
                "evacuation",
                "floor",
                "weight",
                "activity",
                "age",
                "stress",
                "social",
                "character",
            },
        )
