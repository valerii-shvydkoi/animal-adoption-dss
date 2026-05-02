import pytest
from unittest.mock import patch
from rest_framework import status


@pytest.mark.django_db
class TestIntegrationEndpoints:

    # Перевірка доступності публічних та захищених маршрутів
    def test_endpoints_status_codes_and_permissions(self, api_client):
        assert api_client.get("/api/v1/health/").status_code == status.HTTP_200_OK
        assert api_client.get("/api/v1/pets/").status_code == status.HTTP_200_OK
        response = api_client.post("/api/v1/questionnaire/")
        assert response.status_code != status.HTTP_201_CREATED

    # Перевірка обробки валідної матриці AHP (CR < 0.1)
    @patch("core.views.v1.questionnaire.QuestionnaireInputSerializer.is_valid")
    def test_questionnaire_valid_cr(self, mock_is_valid, auth_client):
        mock_is_valid.return_value = True
        data = {"matrix": {"activity_vs_sociability": 3, "activity_vs_weight": 0.33}}
        response = auth_client.post("/api/v1/questionnaire/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "processing"

    # Перевірка відхилення невалідної матриці AHP (CR >= 0.1)
    @patch("core.views.v1.questionnaire.QuestionnaireInputSerializer.is_valid")
    def test_questionnaire_invalid_cr(self, mock_is_valid, auth_client):
        from rest_framework.exceptions import ValidationError

        mock_is_valid.side_effect = ValidationError("CR_TOO_HIGH")
        response = auth_client.post(
            "/api/v1/questionnaire/", {"matrix": {}}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Перевірка захисту створення заявки на адопцію для неавторизованих
    def test_adoption_request_requires_auth(self, api_client, pet):
        response = api_client.post("/api/v1/adoptions/", {"pet": pet.id})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Перевірка доступу до кабінету волонтера для звичайного користувача
    def test_volunteer_cabinet_requires_role(self, auth_client):
        response = auth_client.get("/api/v1/volunteer/cabinet/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # Перевірка ізоляції даних у кабінеті волонтера (тільки свій притулок)
    def test_volunteer_sees_only_own_shelter(self, auth_volunteer_client):
        response = auth_volunteer_client.get("/api/v1/volunteer/cabinet/")
        assert response.status_code == status.HTTP_200_OK

    # Перевірка каскадного скасування заявок при видаленні тварини
    def test_pet_deletion_cascades_to_adoptions(
        self, auth_volunteer_client, pet, adoption_request
    ):
        auth_volunteer_client.delete(f"/api/v1/pets/{pet.id}/")
        # Якщо об'єкт приховано Soft Delete, звичайний refresh_from_db видасть помилку
        with pytest.raises(Exception):
            adoption_request.refresh_from_db()

    # Перевірка захисту від дублювання заявок на волонтерство
    @patch("core.services.volunteer_request_service.VolunteerRequestService.create")
    def test_duplicate_volunteer_request(self, mock_create, auth_client, shelter):
        from rest_framework.exceptions import ValidationError

        mock_create.side_effect = [None, ValidationError("REQUEST_ALREADY_EXISTS")]
        auth_client.post("/api/v1/volunteer/requests/", {"shelter": shelter.id})
        response = auth_client.post(
            "/api/v1/volunteer/requests/", {"shelter": shelter.id}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Перевірка блокування IP після 10 невдалих спроб авторизації
    def test_login_throttling_limit(self, api_client, user):
        url = "/api/v1/auth/token/"
        for _ in range(10):
            api_client.post(url, {"email": user.email, "password": "wrong_password"})
        response = api_client.post(
            url, {"email": user.email, "password": "wrong_password"}
        )
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    # Перевірка захисту від Race Condition при бронюванні тварини
    @patch("core.services.adoption_service.AdoptionService.create_request")
    def test_race_condition_protection_on_adoption(self, mock_create, auth_client, pet):
        response = auth_client.post(
            "/api/v1/adoptions/", {"pet": pet.id}, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
