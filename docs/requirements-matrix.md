# Матриця відповідності дипломним вимогам

Документ звіряє реалізацію Adoptify з функціональними сценаріями UC1-UC17, описаними в дипломній роботі.

| UC   | Вимога диплома                                        | Реалізація в проєкті                                                                        | Стан        |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| UC1  | Пагінований каталог тварин з фільтрами                | `frontend/src/pages/Catalog.jsx`, `backend/core/views/v1/pets.py`                           | Реалізовано |
| UC2  | Реєстрація користувача                                | `frontend/src/pages/Register.jsx`, `backend/core/views/v1/user.py`                          | Реалізовано |
| UC3  | Login і refresh JWT                                   | `frontend/src/pages/Login.jsx`, `frontend/src/services/api.js`, `CustomTokenObtainPairView` | Реалізовано |
| UC4  | AHP-анкета з перевіркою CR                            | `frontend/src/pages/Questionnaire.jsx`, `backend/core/services/ahp_service.py`              | Реалізовано |
| UC5  | Збережені результати підбору                          | `frontend/src/pages/MyResults.jsx`, `backend/core/views/v1/results.py`                      | Реалізовано |
| UC6  | Подання заявки на адопцію                             | `frontend/src/pages/CreateRequest.jsx`, `backend/core/services/adoption_service.py`         | Реалізовано |
| UC7  | Перегляд власних заявок і статусів                    | `frontend/src/pages/MyRequests.jsx`, `AdoptionRequestViewSet`                               | Реалізовано |
| UC8  | Скасування pending-заявки                             | `PATCH /api/v1/adoptions/{id}/cancel/`                                                      | Реалізовано |
| UC9  | Подання заявки на волонтерство або притулок           | `frontend/src/pages/BecomeVolunteer.jsx`, `VolunteerRequestViewSet`                         | Реалізовано |
| UC10 | Перегляд статусу VolunteerRequest                     | `frontend/src/pages/VolunteerDashboard.jsx`, `MyVolunteerStatusView`                        | Реалізовано |
| UC11 | Додавання, редагування, деактивація тварини           | `frontend/src/pages/ShelterPetManager.jsx`, `PetViewSet`                                    | Реалізовано |
| UC12 | Позначення тварини як такої, що знайшла дім           | `VolunteerAdoptionViewSet.approve`, `is_available=False`                                    | Реалізовано |
| UC13 | Заявки притулку з пагінацією                          | `frontend/src/pages/VolunteerAdoptions.jsx`, DRF pagination                                 | Реалізовано |
| UC14 | Зміна статусу заявки притулком                        | `review`, `approve`, `reject` actions у `VolunteerAdoptionViewSet`                          | Реалізовано |
| UC15 | Статистика притулку                                   | `frontend/src/pages/ShelterDashboard.jsx`, `ShelterAnalyticsView`                           | Реалізовано |
| UC16 | Верифікація волонтера менеджером                      | `frontend/src/pages/ShelterApplications.jsx`, `ShelterViewSet.approve_member_request`       | Реалізовано |
| UC17 | Верифікація менеджера/нового притулку адміністратором | `frontend/src/pages/AdminShelters.jsx`, `VolunteerRequestViewSet.approve`                   | Реалізовано |

## Критичні правила бізнес-логіки

- Активними заявками на адопцію є `PENDING`, `REVIEWED`, `APPROVED`; `REJECTED` і `CANCELLED` не блокують повторну подачу.
- Скасувати користувач може лише заявку у статусі `PENDING`.
- Схвалення заявки виконується атомарно: тварина стає недоступною, інші pending/reviewed заявки на цю тварину відхиляються.
- Волонтер бачить заявки тільки для своїх тварин або тварин свого притулку.
- Менеджер притулку обробляє тільки заявки, пов'язані з його притулком.
- Адміністративні ендпоінти захищені роллю staff/superuser/admin.
- Гостьове обране переноситься в акаунт після входу та очищується з гостьового сховища після успішної синхронізації.
- Каталог сортується за `-compatibility_score` тільки якщо користувач уже має результат анкети.
- Сторінки результатів, деталей тварини та каталогу не виконують окремий frontend-розрахунок сумісності.

## Нефункціональні вимоги

- Пагінація: DRF `PageNumberPagination`, frontend-компоненти пагінації.
- Throttling: `anon=10/min`, `user=100/min`, `login=5/min`.
- PWA: service worker не кешує `/api/`.
- Soft delete: тварини логічно видаляються через `deleted_at`.
- API-документація: Swagger доступний у dev або через `API_DOCS_ENABLED`.
- Транзакційність: заявки на адопцію створюються та схвалюються через `transaction.atomic()`.
- AHP: backend валідує склад критеріїв і нормалізує фінальні ваги до суми `1.0`.
