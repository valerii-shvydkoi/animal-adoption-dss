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
        email="user@test.com", password="password123", role=UserRole.USER
    )


@pytest.fixture
def shelter_owner(db):
    return User.objects.create_user(
        email="shelter-owner@test.com",
        password="password123",
        role=UserRole.SHELTER_MANAGER,
    )


@pytest.fixture
def shelter(db, shelter_owner):
    return Shelter.objects.create(
        owner=shelter_owner,
        name="Test shelter",
        region="Київська",
        city="Київ",
        address="м. Київ, вул. Тестова",
        phone="+380000000000",
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
        age_months=24,
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
