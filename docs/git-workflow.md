# Git workflow для дипломного проєкту

Репозиторій має зберігати історію як інженерний щоденник розроблення СППР, а не як випадковий архів файлів.

## Remote

Основний `origin` має вказувати на репозиторій `valerii-shvydkoi/animal-adoption-dss.git`, який відповідає назві та предметній області дипломної роботи.

Перевірка remote:

```bash
git remote -v
```

Очікуване значення:

```bash
origin  https://github.com/valerii-shvydkoi/animal-adoption-dss.git
```

## Гілки

У проєкті використовується спрощена стратегія розгалуження з гілками `main`, `dev`, `feature/*` і `hotfix/*`.

- `main` — стабільна гілка з кодом, придатним для production-розгортання.
- `dev` — інтеграційна гілка для об'єднання змін backend, frontend, Docker-конфігурації, тестів, Swagger-документації та CI.
- `feature/*` — тимчасові гілки для окремих функціональних задач: AHP-розрахунку, фільтрації тварин, статусів заявок, API-ендпоінтів, сторінок каталогу або кабінетів ролей.
- `hotfix/*` — тимчасові гілки для критичних виправлень у стабільній версії з подальшим перенесенням у `main` і `dev`.

Поточний набір демонстраційних гілок:

- `feature/backend-core` — базові моделі, REST API, permissions, адмін-панель і тести серверної частини.
- `feature/ahp-dss-matching` — AHP/DSS-алгоритм підбору, ваги критеріїв і пояснення результатів.
- `feature/adoption-workflow` — заявки на адаптацію, статуси, транзакційність і перевірки власності результату анкети.
- `feature/role-cabinets` — кабінети волонтера, менеджера притулку та адміністратора.
- `feature/pwa-production` — PWA-ресурси, Docker, nginx і production-збірка frontend.
- `feature/diploma-alignment` — документація, матриця відповідності, wireframes і синхронізація з додатками.
- `hotfix/final-demo-polish` — фінальні виправлення демонстраційного сценарію перед захистом.

## Коміти

Формат:

```text
type(scope): короткий опис українською або англійською
```

Приклади:

- `feat(ahp): normalize questionnaire weights and expose result id`
- `fix(favorites): transfer guest favorites after login`
- `docs(diploma): update requirements matrix and wireframes`
- `test(dss): cover profile-aware matching risks`

## Перед комітом

```bash
cd backend
.venv\Scripts\python.exe -m pytest
```

```bash
cd frontend
npm run lint
npm run build
```

Комітити варто тільки після зелених тестів і збірки. Реальний `.env`, локальні бази, `media/`, `.venv/`, `node_modules/`, `dist/` і кеші не мають потрапляти в Git.
