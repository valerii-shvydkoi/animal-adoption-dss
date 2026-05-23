from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import extend_schema

from core.models.volunteer_request import VolunteerRequest
from core.serializers.volunteer_request_serializers import VolunteerRequestSerializer


class MyVolunteerStatusView(APIView):
    """
    Ендпоінт для особистого кабінету користувача/волонтера.
    Повертає статус його поточної заявки на волонтерство.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Volunteer Status"],
        summary="Отримати статус моєї заявки на волонтерство",
        responses={200: VolunteerRequestSerializer, 404: dict},
    )
    def get(self, request):
        try:

            volunteer_req = VolunteerRequest.objects.get(user=request.user)
            serializer = VolunteerRequestSerializer(volunteer_req)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except VolunteerRequest.DoesNotExist:

            return Response(
                {"detail": "Ви ще не надсилали анкету волонтера."},
                status=status.HTTP_404_NOT_FOUND,
            )
