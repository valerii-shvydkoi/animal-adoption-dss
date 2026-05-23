import numpy as np
from typing import List, Dict, Any


class AHPService:
    RI = {1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12}

    @staticmethod
    def calculate_weights(matrix: List[List[float]]) -> Dict[str, Any]:
        n = len(matrix)
        if n == 0 or any(len(row) != n for row in matrix):
            raise ValueError("Матриця AHP повинна бути непорожньою та квадратною.")

        np_matrix = np.array(matrix, dtype=float)
        if np.any(np_matrix <= 0):
            raise ValueError("Матриця AHP повинна містити лише додатні значення.")

        col_sums = np_matrix.sum(axis=0)

        norm_matrix = np_matrix / col_sums
        weights = norm_matrix.mean(axis=1)

        weighted_sum = np.dot(np_matrix, weights)
        safe_weights = np.where(weights == 0, 1e-9, weights)
        lambda_max = np.mean(weighted_sum / safe_weights)

        ci = (lambda_max - n) / (n - 1) if n > 1 else 0
        cr = ci / AHPService.RI.get(n, 1.0) if n > 2 else 0

        return {
            "weights": [float(value) for value in weights.tolist()],
            "cr": float(cr),
            "is_consistent": bool(cr < 0.1),
        }

    @staticmethod
    def build_consistent_matrix(v12: float, v23: float) -> List[List[float]]:
        v12 = max(float(v12), 1.0)
        v23 = max(float(v23), 1.0)
        v13 = v12 * v23
        return [
            [1.0, v12, v13],
            [1.0 / v12, 1.0, v23],
            [1.0 / v13, 1.0 / v23, 1.0],
        ]

    @staticmethod
    def calculate_consistency_report(
        ahp_data: Dict[str, Any],
    ) -> Dict[str, Dict[str, Any]]:
        report = {}

        sections = {
            "global_prefs": ahp_data.get("global_prefs", {}),
            "safety": ahp_data.get("safety", {}),
            "physical": ahp_data.get("physical", {}),
            "psychological": ahp_data.get("psychological", {}),
        }

        for name, section in sections.items():
            matrix = AHPService.build_consistent_matrix(
                float(section.get("intensity_12", 1)),
                float(section.get("intensity_23", 1)),
            )
            result = AHPService.calculate_weights(matrix)
            report[name] = {
                "cr": result["cr"],
                "is_consistent": result["is_consistent"],
            }

        return report

    @staticmethod
    def process_all_categories(ahp_data: Dict[str, Any]) -> Dict[str, float]:
        global_raw = ahp_data.get("global_prefs", {})
        g_matrix = AHPService.build_consistent_matrix(
            float(global_raw.get("intensity_12", 1)),
            float(global_raw.get("intensity_23", 1)),
        )
        global_res = AHPService.calculate_weights(g_matrix)

        macro_order = global_raw.get("order", ["safety", "physical", "psychological"])
        cat_weights = {}
        for i, name in enumerate(macro_order):
            if i < len(global_res["weights"]):
                cat_weights[name] = global_res["weights"][i]

        final_weights = {}

        for cat_name in ["safety", "physical", "psychological"]:
            cat = ahp_data.get(cat_name)
            if not cat:
                continue

            intensity_12 = float(cat.get("intensity_12", 3))
            intensity_23 = float(cat.get("intensity_23", 3))

            matrix = AHPService.build_consistent_matrix(intensity_12, intensity_23)
            res = AHPService.calculate_weights(matrix)

            cat_multiplier = cat_weights.get(cat_name, 0.33)

            for i, criterion_id in enumerate(cat.get("order", [])):
                if i < len(res["weights"]):
                    final_weights[criterion_id] = res["weights"][i] * cat_multiplier

        default_keys = [
            "stress",
            "social",
            "character",
            "shelter",
            "evacuation",
            "floor",
            "activity",
            "weight",
            "age",
        ]
        for key in default_keys:
            if key not in final_weights:
                final_weights[key] = 0.1 / len(default_keys)

        total_weight = sum(value for value in final_weights.values() if value > 0)
        if total_weight <= 0:
            return {key: 1 / len(default_keys) for key in default_keys}

        return {
            key: float(value / total_weight) for key, value in final_weights.items()
        }
