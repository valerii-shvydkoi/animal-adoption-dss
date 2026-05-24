from rest_framework import viewsets, permissions, filters, status as rest_status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import PermissionDenied
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from core.models import Pet, QuestionnaireResult
from core.serializers.pet_serializers import PetSerializer
from core.services.dss_matching_service import DSSMatchingService
from django.apps import apps


class PetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema_view(
    list=extend_schema(
        summary="Отримати список тварин",
        description="Повертає список доступних тварин з пагінацією та фільтрами.",
        auth=[],
        parameters=[
            OpenApiParameter(
                name="species",
                description="Вид тварини (DOG/CAT)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="gender",
                description="Стать (MALE/FEMALE)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="search",
                description="Пошук за ім'ям тварини",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description="Сортування (наприклад: -created_at, age_months, -weight, -compatibility_score)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="age_category",
                description="Вікова категорія (BABY, ADULT, SENIOR)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="oblast",
                description="Область перебування",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="city", description="Місто перебування", required=False, type=str
            ),
            OpenApiParameter(
                name="size_category",
                description="Категорія розміру",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="energy_level",
                description="Рівень енергії",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="good_with_children",
                description="Сумісність з дітьми (YES/NO/UNKNOWN)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="good_with_cats",
                description="Сумісність з котами (YES/NO/UNKNOWN)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="good_with_dogs",
                description="Сумісність з собаками (YES/NO/UNKNOWN)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="urgency_status",
                description="Кризовий статус (REGULAR/EVACUATION/MEDICAL)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="is_sterilized",
                description="Статус стерилізації (true/false)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="managed",
                description="Режим управління притулку (true)",
                required=False,
                type=str,
            ),
        ],
    ),
    locations=extend_schema(
        summary="Отримати дерево доступних областей та міст", auth=[]
    ),
    retrieve=extend_schema(summary="Отримати деталі тварини", auth=[]),
    create=extend_schema(summary="Додати нову тварину"),
    update=extend_schema(summary="Повністю оновити дані тварини"),
    partial_update=extend_schema(summary="Частково оновити дані тварини"),
    destroy=extend_schema(summary="Видалити тварину (Soft delete)"),
)
class PetViewSet(viewsets.ModelViewSet):
    queryset = (
        Pet.objects.filter(is_available=True)
        .select_related("shelter", "created_by")
        .order_by("-created_at")
    )
    serializer_class = PetSerializer
    pagination_class = PetPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["created_at", "age_months", "weight"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "batch", "locations"]:
            return [permissions.AllowAny()]
        if self.action == "favorite":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def _get_user_shelter(self, user):
        try:
            Shelter = apps.get_model("core", "Shelter")
            shelter = Shelter.objects.filter(owner=user).first()
            if not shelter:
                Volunteer = apps.get_model("core", "Volunteer")
                volunteer = (
                    Volunteer.objects.filter(user=user)
                    .select_related("shelter")
                    .first()
                )
                if volunteer:
                    shelter = volunteer.shelter
            return shelter
        except LookupError:
            return None

    def get_queryset(self):
        is_managed = self.request.query_params.get(
            "managed"
        ) == "true" or self.action in ["update", "partial_update", "destroy"]

        if is_managed and self.request.user.is_authenticated:
            user = self.request.user
            shelter = self._get_user_shelter(user)

            if shelter:
                queryset = (
                    Pet.objects.filter(shelter=shelter)
                    .select_related("shelter", "created_by")
                    .order_by("-created_at")
                )
            else:
                queryset = Pet.objects.none()
        else:
            queryset = (
                Pet.objects.filter(is_available=True)
                .select_related("shelter", "created_by")
                .order_by("-created_at")
            )

        if self.action == "batch":
            return queryset

        species = self.request.query_params.get("species")
        gender = self.request.query_params.get("gender")
        age_category = self.request.query_params.get("age_category")
        oblast = self.request.query_params.get("oblast")
        city = self.request.query_params.get("city")
        size_category = self.request.query_params.get("size_category")
        energy_level = self.request.query_params.get("energy_level")
        good_with_children = self.request.query_params.get("good_with_children")
        good_with_cats = self.request.query_params.get("good_with_cats")
        good_with_dogs = self.request.query_params.get("good_with_dogs")
        urgency_status = self.request.query_params.get("urgency_status")
        is_sterilized = self.request.query_params.get("is_sterilized")

        if species and species.strip():
            queryset = queryset.filter(species=species.strip().upper())

        if gender and gender.strip():
            queryset = queryset.filter(gender=gender.strip().upper())

        if age_category and age_category.strip():
            age_category = age_category.strip().upper()
            if age_category == "BABY":
                queryset = queryset.filter(age_months__lte=6)
            elif age_category == "ADULT":
                queryset = queryset.filter(age_months__gt=6, age_months__lte=60)
            elif age_category == "SENIOR":
                queryset = queryset.filter(age_months__gt=60)

        if oblast and oblast.strip():
            queryset = queryset.filter(oblast__iexact=oblast.strip())

        if city and city.strip():
            queryset = queryset.filter(city__iexact=city.strip())

        if size_category and size_category.strip():
            size_value = size_category.strip().upper()
            if size_value == "SMALL":
                queryset = queryset.filter(weight__lte=10)
            elif size_value == "MEDIUM":
                queryset = queryset.filter(weight__gt=10, weight__lte=25)
            elif size_value == "LARGE":
                queryset = queryset.filter(weight__gt=25)

        if energy_level and energy_level.strip():
            queryset = queryset.filter(energy_level__iexact=energy_level.strip())

        if good_with_children and good_with_children.strip():
            val = good_with_children.strip().upper()
            if val in ["YES", "TRUE"]:
                queryset = queryset.filter(good_with_children="YES")
            elif val in ["NO", "FALSE"]:
                queryset = queryset.filter(good_with_children="NO")
            else:
                queryset = queryset.filter(good_with_children=val)

        if good_with_cats and good_with_cats.strip():
            val = good_with_cats.strip().upper()
            if val in ["YES", "TRUE"]:
                queryset = queryset.filter(good_with_cats="YES")
            elif val in ["NO", "FALSE"]:
                queryset = queryset.filter(good_with_cats="NO")
            else:
                queryset = queryset.filter(good_with_cats=val)

        if good_with_dogs and good_with_dogs.strip():
            val = good_with_dogs.strip().upper()
            if val in ["YES", "TRUE"]:
                queryset = queryset.filter(good_with_dogs="YES")
            elif val in ["NO", "FALSE"]:
                queryset = queryset.filter(good_with_dogs="NO")
            else:
                queryset = queryset.filter(good_with_dogs=val)

        if urgency_status and urgency_status.strip():
            status_val = urgency_status.strip().upper()
            if status_val == "HIGH":
                status_val = "EVACUATION"
            elif status_val in ["MEDIUM", "LOW"]:
                status_val = "REGULAR"
            if status_val in ["REGULAR", "EVACUATION", "MEDICAL"]:
                queryset = queryset.filter(urgency_status=status_val)

        if is_sterilized and is_sterilized.strip():
            val = is_sterilized.strip().lower()
            if val in ["true", "yes", "1"]:
                queryset = queryset.filter(is_sterilized="true")
            elif val in ["false", "no", "0"]:
                queryset = queryset.filter(is_sterilized="false")

        return queryset

    def perform_create(self, serializer):
        shelter = self._get_user_shelter(self.request.user)
        if not shelter:
            raise PermissionDenied(
                "Ви повинні бути власником або волонтером притулку, щоб додавати тварин."
            )
        serializer.save(shelter=shelter, created_by=self.request.user)

    def filter_queryset(self, queryset):
        if self.action not in ["list", "batch"]:
            return super().filter_queryset(queryset)

        queryset = super().filter_queryset(queryset)
        ordering = self.request.query_params.get("ordering", "")

        if self.request.user.is_authenticated:
            q_result = (
                QuestionnaireResult.objects.filter(
                    questionnaire__user=self.request.user
                )
                .order_by("-created_at")
                .first()
            )

            if (
                q_result
                and q_result.snapshot_data
                and "weights" in q_result.snapshot_data
            ):
                weights = q_result.snapshot_data["weights"]
                preferred_species = q_result.snapshot_data.get(
                    "preferred_species", "ANY"
                )
                preferred_age = q_result.snapshot_data.get("preferred_age", "ANY")
                user_profile = getattr(self.request.user, "profile", None)

                pets_list = list(queryset)
                for p in pets_list:
                    match = DSSMatchingService.calculate_match(
                        user_weights=weights,
                        pet=p,
                        user_profile=user_profile,
                        preferred_species=preferred_species,
                        preferred_age=preferred_age,
                    )
                    score = (
                        match["match_percent"]
                        if match
                        else DSSMatchingService.MIN_MATCH_PERCENT
                    )
                    p.temp_score = score
                    p.compatibility_score = score

                if ordering == "-compatibility_score":
                    pets_list.sort(key=lambda x: x.temp_score, reverse=True)

                return pets_list

        return queryset

    def get_object(self):
        obj = super().get_object()
        if self.request.user.is_authenticated:
            q_result = (
                QuestionnaireResult.objects.filter(
                    questionnaire__user=self.request.user
                )
                .order_by("-created_at")
                .first()
            )
            if (
                q_result
                and q_result.snapshot_data
                and "weights" in q_result.snapshot_data
            ):
                weights = q_result.snapshot_data["weights"]
                preferred_species = q_result.snapshot_data.get(
                    "preferred_species", "ANY"
                )
                preferred_age = q_result.snapshot_data.get("preferred_age", "ANY")
                user_profile = getattr(self.request.user, "profile", None)

                match = DSSMatchingService.calculate_match(
                    user_weights=weights,
                    pet=obj,
                    user_profile=user_profile,
                    preferred_species=preferred_species,
                    preferred_age=preferred_age,
                )
                obj.compatibility_score = (
                    match["match_percent"]
                    if match
                    else DSSMatchingService.MIN_MATCH_PERCENT
                )
        return obj

    @action(detail=False, methods=["get"])
    def batch(self, request):
        ids_param = request.query_params.get("ids", "")
        if not ids_param:
            return Response([])

        id_list = [int(x) for x in ids_param.split(",") if x.isdigit()]
        pets = self.get_queryset().filter(id__in=id_list)
        pets = self.filter_queryset(pets)

        page = self.paginate_queryset(pets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(pets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def locations(self, request):
        active_pets = Pet.objects.filter(is_available=True)
        location_tree = {}

        for pet in active_pets:
            if pet.oblast:
                if pet.oblast not in location_tree:
                    location_tree[pet.oblast] = set()
                if pet.city:
                    location_tree[pet.oblast].add(pet.city)

        clean_tree = {
            oblast: sorted(list(cities)) for oblast, cities in location_tree.items()
        }
        return Response(clean_tree)

    @action(detail=True, methods=["post"])
    def favorite(self, request, pk=None):
        pet = self.get_object()
        user = request.user

        if pet in user.favorites.all():
            user.favorites.remove(pet)
            return Response(
                {"detail": "Тварину видалено з обраного.", "is_favorite": False},
                status=rest_status.HTTP_200_OK,
            )
        else:
            user.favorites.add(pet)
            return Response(
                {"detail": "Тварину додано до обраного.", "is_favorite": True},
                status=rest_status.HTTP_200_OK,
            )
