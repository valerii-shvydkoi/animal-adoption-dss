from django.test import TestCase
from unittest.mock import patch
from core.services.notification_service import NotificationService

class NotificationServiceTest(TestCase):
    @patch('core.services.notification_service.send_mail')
    def test_send_adoption_status_email(self, mock_send_mail):
        NotificationService.send_adoption_status_email('test@test.com', 'APPROVED', 'Барсік')
        mock_send_mail.assert_called_once()