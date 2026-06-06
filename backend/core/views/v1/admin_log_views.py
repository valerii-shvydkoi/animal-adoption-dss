import os
import re
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from drf_spectacular.utils import extend_schema


@extend_schema(tags=["Журнал адміністратора"])
class AdminLogView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Переглянути журнал backend",
        description="Повертає останні записи локального файлу app.log.",
    )
    def get(self, request):

        log_path = getattr(
            settings, "LOG_FILE_PATH", os.path.join(settings.BASE_DIR.parent, "app.log")
        )

        if not os.path.exists(log_path):
            return Response(
                {"detail": f"Файл app.log відсутній за шляхом: {log_path}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        parsed_logs = []
        try:
            with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()[-300:]

                log_pattern = re.compile(
                    r"^\[(?P<timestamp>.*?)\]\s+(?P<level>\w+)\s+\[(?P<source>.*?)\]\s+(?P<message>.*)$"
                )

                for index, line in enumerate(lines):
                    line = line.strip()
                    if not line:
                        continue

                    match = log_pattern.match(line)
                    if match:
                        parsed_logs.append(
                            {
                                "id": index,
                                "timestamp": match.group("timestamp"),
                                "level": match.group("level").upper(),
                                "source": match.group("source"),
                                "message": match.group("message"),
                            }
                        )
                    else:
                        if parsed_logs:
                            parsed_logs[-1]["message"] += f"\n{line}"
                        else:
                            parsed_logs.append(
                                {
                                    "id": index,
                                    "timestamp": "Система",
                                    "level": "INFO",
                                    "source": "system.raw",
                                    "message": line,
                                }
                            )

            parsed_logs.reverse()
            return Response(parsed_logs, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": f"Помилка читання лог-файлу: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@extend_schema(tags=["Журнал адміністратора"])
class AdminLogClearView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Очистити журнал backend",
        description="Очищає локальний файл app.log після перегляду адміністратором.",
    )
    def delete(self, request):
        log_path = getattr(
            settings, "LOG_FILE_PATH", os.path.join(settings.BASE_DIR.parent, "app.log")
        )

        if os.path.exists(log_path):
            try:
                with open(log_path, "w", encoding="utf-8") as f:
                    f.write("")
                return Response(
                    {"detail": "Журнал логів успішно очищено."},
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                return Response(
                    {"detail": f"Не вдалося очистити файл: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        return Response(
            {"detail": "Файл логів не знайдено."}, status=status.HTTP_404_NOT_FOUND
        )
