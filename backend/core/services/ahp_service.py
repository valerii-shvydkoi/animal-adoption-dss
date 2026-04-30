import numpy as np
from typing import List, Dict, Any


class AHPService:
    RI = {1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12}

    @staticmethod
    def calculate_weights(matrix: List[List[float]]) -> Dict[str, Any]:
        n = len(matrix)
        np_matrix = np.array(matrix)

        # Нормалізація та розрахунок власного вектора
        col_sums = np_matrix.sum(axis=0)
        norm_matrix = np_matrix / col_sums
        weights = norm_matrix.mean(axis=1)

        # Перевірка узгодженості (CR)
        weighted_sum = np.dot(np_matrix, weights)
        lambda_max = np.mean(weighted_sum / weights)
        ci = (lambda_max - n) / (n - 1) if n > 1 else 0
        cr = ci / AHPService.RI.get(n, 1.0) if n > 2 else 0

        return {"weights": weights.tolist(), "cr": cr, "is_consistent": cr < 0.1}
