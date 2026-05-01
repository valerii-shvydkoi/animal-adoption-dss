from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse


class ThrottlingTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('token_obtain_pair')

    def test_login_throttling(self):
        # Робимо 10 хибних запитів (максимальний ліміт для anon)
        for _ in range(10):
            self.client.post(self.url, {'email': 'test@test.com', 'password': 'wrong'})

        # 11-й запит має бути заблокований системою (код 429 Too Many Requests)
        response = self.client.post(self.url, {'email': 'test@test.com', 'password': 'wrong'})
        self.assertEqual(response.status_code, 429)