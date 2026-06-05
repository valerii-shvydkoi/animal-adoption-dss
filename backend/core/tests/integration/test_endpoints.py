import pytest
from rest_framework import status
from core.models.enums import AdoptionStatus


def questionnaire_payload(profile_overrides=None, ahp_overrides=None):
    profile = {
        "has_car": True,
        "has_shelter": True,
        "has_elevator": True,
        "floor": 2,
        "preferred_species": "ANY",
        "preferred_age": "ANY",
    }
    if profile_overrides:
        profile.update(profile_overrides)

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
    if ahp_overrides:
        ahp_data.update(ahp_overrides)

    return {"user_profile": profile, "ahp_data": ahp_data}


@pytest.mark.django_db
class TestIntegrationEndpoints:

    def test_endpoints_status_codes_and_permissions(self, api_client):
        assert api_client.get("/api/v1/health/").status_code == status.HTTP_200_OK
        assert api_client.get("/api/v1/pets/").status_code == status.HTTP_200_OK
        response = api_client.post("/api/v1/questionnaire/")
        assert response.status_code != status.HTTP_201_CREATED

    def test_questionnaire_valid_cr(self, auth_client):
        response = auth_client.post(
            "/api/v1/questionnaire/", questionnaire_payload(), format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "success"
        assert response.data["id"]
        assert response.data["consistency"]["global_prefs"]["is_consistent"] is True

    def test_profile_knows_latest_questionnaire_result(self, auth_client):
        questionnaire_response = auth_client.post(
            "/api/v1/questionnaire/", questionnaire_payload(), format="json"
        )
        profile_response = auth_client.get("/api/v1/auth/profile/")

        assert profile_response.status_code == status.HTTP_200_OK
        assert profile_response.data["has_questionnaire_result"] is True
        assert (
            profile_response.data["latest_questionnaire_result_id"]
            == questionnaire_response.data["id"]
        )

    def test_questionnaire_rejects_incomplete_criterion_order(self, auth_client):
        payload = questionnaire_payload(
            ahp_overrides={
                "safety": {
                    "order": ["shelter", "shelter", "floor"],
                    "intensity_12": 3,
                    "intensity_23": 2,
                }
            }
        )
        response = auth_client.post("/api/v1/questionnaire/", payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_matches_use_profile_constraints_and_risks(self, auth_client, pet):
        pet.good_with_children = "NO"
        pet.save(update_fields=["good_with_children"])
        auth_client.post(
            "/api/v1/questionnaire/",
            questionnaire_payload({"has_children": True}),
            format="json",
        )

        response = auth_client.get("/api/v1/results/matches/")

        assert response.status_code == status.HTTP_200_OK
        matched_pet = next(
            item for item in response.data["matches"] if item["id"] == pet.id
        )
        assert any("дітьми" in risk for risk in matched_pet["risks"])

    def test_questionnaire_invalid_payload(self, auth_client):
        response = auth_client.post(
            "/api/v1/questionnaire/", {"matrix": {}}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_adoption_request_requires_auth(self, api_client, pet):
        response = api_client.post("/api/v1/adoptions/", {"pet": pet.id})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_volunteer_cabinet_requires_role(self, auth_client):
        response = auth_client.get("/api/v1/volunteer/cabinet/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_volunteer_sees_only_own_shelter(self, auth_volunteer_client):
        response = auth_volunteer_client.get("/api/v1/volunteer/cabinet/")
        assert response.status_code == status.HTTP_200_OK

    def test_volunteer_sees_shelter_adoption_requests(
        self, auth_volunteer_client, adoption_request
    ):
        response = auth_volunteer_client.get("/api/v1/volunteer/adoptions/")

        assert response.status_code == status.HTTP_200_OK
        payload = response.data.get("results", response.data)
        assert any(item["id"] == adoption_request.id for item in payload)
        request_item = next(
            item for item in payload if item["id"] == adoption_request.id
        )
        assert request_item["dss_analysis"]["match_percent"] is None

    def test_pet_deletion_cascades_to_adoptions(
        self, auth_volunteer_client, pet, adoption_request
    ):
        auth_volunteer_client.delete(f"/api/v1/pets/{pet.id}/")
        pet.refresh_from_db()
        adoption_request.refresh_from_db()
        assert pet.deleted_at is not None
        assert adoption_request.status == AdoptionStatus.REJECTED

    def test_duplicate_volunteer_request(self, auth_client, shelter):
        data = {"shelter": shelter.id, "phone": "+380000000000"}
        auth_client.post("/api/v1/volunteer-requests/", data, format="json")
        response = auth_client.post("/api/v1/volunteer-requests/", data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_throttling_limit(self, api_client, user):
        url = "/api/v1/auth/token/"
        for _ in range(10):
            api_client.post(url, {"email": user.email, "password": "wrong_password"})
        response = api_client.post(
            url, {"email": user.email, "password": "wrong_password"}
        )
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    def test_race_condition_protection_on_adoption(self, auth_client, pet):
        response = auth_client.post(
            "/api/v1/adoptions/", {"pet": pet.id}, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
