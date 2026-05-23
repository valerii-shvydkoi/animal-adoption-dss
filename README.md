# Adoptify

Adoptify — вебзастосунок підтримки прийняття рішень для адаптації та адопції тварин в умовах кризових ситуацій. Проєкт реалізує дипломну тему: каталог тварин, AHP-анкету, пояснюваний підбір, заявки на адопцію, волонтерський кабінет, кабінет притулку, адміністративну верифікацію та PWA-режим.

## Ролі

- Гість: перегляд каталогу, фільтрів і деталей тварин.
- Користувач: профіль, AHP-анкета, результати підбору, заявки на адопцію, обране.
- Волонтер: тварини власного притулку, заявки на адопцію, зміна статусів.
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

## Демо-дані для захисту

Після запуску контейнерів можна повністю очистити й наповнити базу узгодженими демо-даними:

```bash
docker compose exec backend python manage.py seed_demo --reset
```

Сценарій показу на одному ноутбуці та демо-акаунти описані в `docs/demo-scenario.md`.

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

## Дипломна відповідність

Ключові матеріали винесені в `docs/`:

- `docs/requirements-matrix.md` — відповідність UC1-UC17 реалізації.
- `docs/wireframes.md` — структура WF1-WF12 у термінах сторінок застосунку.
- `docs/project-audit.md` — технічний аудит, ризики та правила підтримки.
- `docs/git-workflow.md` — рекомендований remote, гілки та правила комітів.
- `docs/demo-scenario.md` — ролі, демо-акаунти та порядок демонстрації.

## Безпека й production-режим

- JWT і персональні дані не кешуються service worker.
- Swagger вмикається через `API_DOCS_ENABLED`; у production його потрібно вимикати або закривати доступом.
- `.env.example` не містить реальних секретів. Реальний `.env` не комітиться.
- Для публічного розгортання потрібно задати `DEBUG=False`, власний `SECRET_KEY`, `ALLOWED_HOSTS`, поштові змінні та HTTPS на reverse proxy.
