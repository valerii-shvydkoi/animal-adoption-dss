from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiTypes, extend_schema
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from core.models import Pet
from core.serializers.user_serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Акаунт успішно створено. Будь ласка, перевірте свою пошту для активації акаунту.",
                    "email": user.email,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist, Exception):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            if user.is_active:
                return Response({"status": "already_active"}, status=status.HTTP_200_OK)
            return Response({"status": "valid"}, status=status.HTTP_200_OK)

        return Response(
            {"status": "invalid", "detail": "Посилання недійсне або застаріло."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @extend_schema(request=None, responses=OpenApiTypes.OBJECT)
    def post(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist, Exception):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            if user.is_active:
                return Response(
                    {"message": "Ваш акаунт вже активовано."}, status=status.HTTP_200_OK
                )

            user.is_active = True
            user.save()
            return Response(
                {
                    "message": "Пошту успішно підтверджено! Тепер ви можете увійти до системи."
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "detail": "Посилання для підтвердження недійсне або його термін дії минув."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses=OpenApiTypes.OBJECT,
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            user = User.objects.filter(email=email).first()

            if user:
                cache_key = f"pwd_reset_limit_{user.id}"
                if cache.get(cache_key):
                    return Response(
                        {
                            "detail": "Лист для відновлення пароля вже було надіслано щойно. Будь ласка, зачекайте 1 хвилину перед повторним запитом."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                frontend_url = getattr(
                    settings, "FRONTEND_URL", "http://localhost:5173"
                )
                reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"
                subject = "Відновлення пароля в Adoptify 🔒"
                message = (
                    f"Вітаємо! Ми отримали запит на відновлення пароля для вашого акаунту в Adoptify. 🛠\n\n"
                    f"Якщо ви дійсно хочете змінити пароль, будь ласка, перейдіть за цим безпечним посиланням:\n"
                    f"{reset_link}\n\n"
                    f"⏳ З міркувань безпеки це посилання буде дійсним лише протягом 1 години.\n\n"
                    f"Якщо ви не робили цього запиту, просто проігноруйте цей лист — ваш поточний пароль "
                    f"залишається в повній безпеці, а акаунт надійно захищений.\n\n"
                    f"З любов'ю,\n"
                    f"Команда Adoptify ❤️"
                )

                try:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    cache.set(cache_key, True, 60)
                    user.save()
                except Exception as e:
                    print(f"Помилка відправки листа для скидання пароля: {e}")

            return Response(
                {
                    "message": "Якщо такий email зареєстрований, ми відправили на нього інструкції з відновлення."
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist, Exception):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            return Response({"status": "valid"}, status=status.HTTP_200_OK)
        return Response({"status": "invalid"}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses=OpenApiTypes.OBJECT,
    )
    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist, Exception):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                new_password = serializer.validated_data["new_password"]
                user.set_password(new_password)
                user.is_active = True
                user.last_login = timezone.now()
                user.save()
                return Response(
                    {"message": "Пароль успішно змінено. Тепер ви можете увійти."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"detail": "Посилання недійсне або його термін дії минув."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SyncFavoritesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        fav_ids = list(request.user.favorites.values_list("id", flat=True))
        return Response({"favorites": fav_ids}, status=status.HTTP_200_OK)

    @extend_schema(request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        pet_ids = request.data.get("pet_ids", [])
        if isinstance(pet_ids, list):
            clean_ids = [int(x) for x in pet_ids if str(x).isdigit()]
            valid_pets = Pet.objects.filter(id__in=clean_ids)
            request.user.favorites.add(*valid_pets)
            all_favs = list(request.user.favorites.values_list("id", flat=True))
            return Response(
                {"message": "Синхронізовано", "favorites": all_favs},
                status=status.HTTP_200_OK,
            )

        return Response(
            {"detail": "Невірний формат даних pet_ids"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class AdminUserManagementView(APIView):
    """
    Ендпоінт для глобального перегляду та редагування користувачів з боку Адміна.
    """

    permission_classes = [IsAuthenticated]

    def check_admin_permission(self, request):
        user_role = getattr(request.user, "role", None)
        if user_role and str(user_role).upper() == "ADMIN":
            return True
        if request.user.is_superuser:
            return True
        return False

    def get(self, request):
        if not self.check_admin_permission(request):
            return Response(
                {"detail": "Доступ заборонено. Потрібні права адміністратора."},
                status=status.HTTP_403_FORBIDDEN,
            )

        all_users = User.objects.all().order_by("id")
        serializer = UserSerializer(all_users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk=None):
        if not self.check_admin_permission(request):
            return Response(
                {"detail": "Доступ заборонено. Потрібні права адміністратора."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not pk:
            return Response(
                {"detail": "Не вказано ID користувача."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "Користувача не знайдено."}, status=status.HTTP_404_NOT_FOUND
            )

        if target_user.id == request.user.id:
            if "is_active" in request.data or "role" in request.data:
                return Response(
                    {
                        "detail": "Ви не можете змінити власну роль або статус активності."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = UserSerializer(target_user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(AdminUserManagementView):
    http_method_names = ["get"]

    @extend_schema(
        operation_id="admin_users_list",
        responses=UserSerializer(many=True),
    )
    def get(self, request):
        return super().get(request)


class AdminUserDetailView(AdminUserManagementView):
    http_method_names = ["patch"]

    @extend_schema(
        operation_id="admin_user_partial_update",
        request=UserSerializer,
        responses=UserSerializer,
    )
    def patch(self, request, pk=None):
        return super().patch(request, pk=pk)
