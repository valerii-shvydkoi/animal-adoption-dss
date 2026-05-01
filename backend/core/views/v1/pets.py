from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema_view, extend_schema
from core.models import Pet
from core.serializers.pet_serializers import PetSerializer


@extend_schema_view(
    list=extend_schema(
        summary="Отримати список тварин",
        description="Повертає список доступних тварин з пагінацією.",
        auth=[],
    ),
    retrieve=extend_schema(
        summary="Отримати деталі тварини",
        auth=[],
    ),
    create=extend_schema(summary="Додати нову тварину"),
    update=extend_schema(summary="Повністю оновити дані тварини"),
    partial_update=extend_schema(summary="Частково оновити дані тварини"),
    destroy=extend_schema(summary="Видалити тварину (Soft delete)"),
)
class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all().order_by("-created_at")
    serializer_class = PetSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
