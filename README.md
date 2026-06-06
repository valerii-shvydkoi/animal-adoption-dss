# Adoptify

Adoptify — вебзастосунок підтримки прийняття рішень для адаптації тварин в умовах кризових ситуацій. Система об'єднує каталог тварин, AHP-анкету, пояснюваний підбір, заявки на адаптацію, волонтерський кабінет, кабінет притулку, адміністративну верифікацію та PWA-режим.

## Ролі

- Гість: перегляд каталогу, фільтрів і деталей тварин.
- Користувач: профіль, AHP-анкета, результати підбору, заявки на адаптацію, обране.
- Волонтер: тварини власного притулку, заявки на адаптацію, зміна статусів.
- Менеджер притулку: тварини, команда, заявки кандидатів, статистика притулку.
- Адміністратор: користувачі, заявки на нові притулки, системна аналітика й логи.

## Технології

- Backend: Django, Django REST Framework, Simple JWT, drf-spectacular, PostgreSQL.
- Frontend: React, Vite, Axios, React Router, PWA service worker.
- Інфраструктура: Docker Compose, nginx для production-збірки фронтенду.
- Метод СППР: AHP з перевіркою узгодженості та поясненням результатів.

## Швидкий старт через Docker

1. Створити локальний `.env` на основі `.env.example`.
2. Запустити сервіси:

```bash
docker compose up --build
```

3. Відкрити:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/v1/`
- Swagger у dev-режимі: `http://localhost:8000/api/v1/schema/swagger-ui/`

## Демо-дані

Після запуску контейнерів можна повністю очистити й наповнити базу контрольованими демо-даними:

```bash
docker compose exec backend python manage.py seed_demo --reset
```

Контрольний сценарій ролей і демо-акаунти описані в `docs/demo-scenario.md`.

## Локальний запуск без Docker

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Для Vite-режиму backend має бути доступний на `http://127.0.0.1:8000`. Якщо працюєте без Docker для frontend, спочатку запустіть API:

```bash
docker compose up -d db backend
```

Після цього перевірте `http://localhost:8000/api/v1/health/` і відкривайте адресу, яку показав Vite. Якщо backend слухає інший порт або адресу, задайте проксі явно у PowerShell:

```powershell
$env:VITE_DEV_API_PROXY_TARGET = "http://127.0.0.1:8000"
npm run dev
```

## Перевірки якості

```bash
cd backend
.venv\Scripts\python.exe -m pytest
```

```bash
cd frontend
npm run lint
npm run build
```

## Проєктна документація

Ключові матеріали винесені в `docs/`:

- `docs/requirements-matrix.md` — відповідність UC1-UC17 реалізації.
- `docs/wireframes.md` — структура WF1-WF12 у термінах сторінок застосунку.
- `docs/git-workflow.md` — рекомендований remote, гілки та правила комітів.
- `docs/demo-scenario.md` — ролі, демо-акаунти та контрольний сценарій перевірки.

## Безпека й production-режим

- JWT і персональні дані не кешуються service worker.
- Swagger вмикається через `API_DOCS_ENABLED`; у production його потрібно вимикати або закривати доступом.
- `.env.example` не містить реальних секретів. Реальний `.env` не комітиться.
- Для публічного розгортання потрібно задати `DEBUG=False`, власний `SECRET_KEY`, `ALLOWED_HOSTS`, поштові змінні та HTTPS на reverse proxy.
