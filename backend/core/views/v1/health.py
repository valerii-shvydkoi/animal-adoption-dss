from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    db_ok = True
    try:
        connection.ensure_connection()
    except Exception:
        db_ok = False

    return Response({
        "status": "ok",
        "db": "ok" if db_ok else "down",
        "version": "1.0.0"
    })