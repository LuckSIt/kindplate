# Запуск KindPlate в Docker (Postgres, Redis, MinIO, Backend, Frontend, Caddy)

## Быстрый старт

1. Создайте в корне проекта файл `.env` (или экспортируйте переменные):

```bash
# Обязательные
SECRET_KEY=ваш_длинный_секрет_для_сессий
JWT_SECRET=ваш_jwt_секрет

# Опционально (есть значения по умолчанию)
FRONTEND_ORIGIN=https://app-kindplate.ru
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
S3_BUCKET=kindplate
VITE_VAPID_PUBLIC_KEY=   # для push-уведомлений
```

2. Запуск всех сервисов:

```bash
docker compose up -d --build
```

После старта:
- **Приложение** — через Caddy (порты 80/443 или как настроено в Caddyfile).
- **MinIO Console** — http://localhost:9001 (логин/пароль из `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`).

Бакет `kindplate` создаётся автоматически при первом запуске бэкенда. Все загруженные фото (офферы, логотипы, отзывы) сохраняются в MinIO и не пропадают после перезапуска контейнеров.

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `SECRET_KEY` | Секрет для сессий | — |
| `JWT_SECRET` | Секрет для JWT | — |
| `FRONTEND_ORIGIN` | Origin фронтенда (CORS) | `https://app-kindplate.ru` |
| `MINIO_ROOT_USER` | Логин MinIO | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | Пароль MinIO | `minioadmin` |
| `S3_BUCKET` | Имя бакета для загрузок | `kindplate` |

Бэкенд подключается к Postgres и Redis по внутренним именам контейнеров (`postgres`, `redis`), к MinIO — по имени `minio` и порту 9000. Отдельно задавать `DB_HOST`, `REDIS_URL`, `S3_ENDPOINT` в `.env` не нужно при запуске через `docker compose`.

## Только MinIO (бэкенд с хоста)

Если бэкенд запускаете локально (`npm run dev`), а MinIO — в Docker:

```bash
docker compose up -d postgres redis minio
```

В `.env` бэкенда добавьте:

```bash
S3_BUCKET=kindplate
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
```

Консоль MinIO: http://localhost:9001.
