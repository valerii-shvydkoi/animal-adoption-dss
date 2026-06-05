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

- `main` — стабільна версія для демонстрації та захисту.
- `dev` — інтеграція поточних фіч перед стабілізацією.
- `feature/ahp-dss-matching` — зміни алгоритму AHP/DSS.
- `feature/adoption-workflow` — заявки, статуси, транзакційність.
- `feature/role-cabinets` — волонтер, менеджер притулку, адміністратор.
- `feature/pwa-production` — PWA, Docker, nginx, production-налаштування.
- `docs/diploma-alignment` — документація, матриця відповідності, wireframes.
- `release/diploma-ready` — фінальний зріз для демонстрації системи.

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
