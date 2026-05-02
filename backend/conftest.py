import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from core.models import Shelter, Pet, Volunteer, AdoptionRequest, RequestStatus
from core.models.enums import UserRole

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="user@test.com", password="password123", role="user"
    )


@pytest.fixture
def shelter(db):
    return Shelter.objects.create(
        name="Test shelter", address="м. Київ, вул. Тестова", phone="+380000000000"
    )


@pytest.fixture
def volunteer_user(db, shelter):
    v_user = User.objects.create_user(
        email="volunteer@test.com", password="password123", role=UserRole.VOLUNTEER
    )
    Volunteer.objects.create(user=v_user, shelter=shelter)
    return v_user


@pytest.fixture
def pet(db, shelter):
    return Pet.objects.create(
        name="Рекс",
        shelter=shelter,
        activity_level=5,
        sociability=5,
        stress_resistance=5,
        weight=10.0,
    )


@pytest.fixture
def adoption_request(db, user, pet):
    return AdoptionRequest.objects.create(
        user=user, pet=pet, status=RequestStatus.PENDING
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def auth_volunteer_client(api_client, volunteer_user):
    api_client.force_authenticate(user=volunteer_user)
    return api_client
