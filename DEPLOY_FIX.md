# 🔧 Исправление проблемы с деплоем

## Проблема
Файлы миграций и новые файлы не были закоммичены в git, поэтому они отсутствуют на сервере.

## Решение

### 1. Добавьте файлы в git и запушьте

**На вашем локальном компьютере выполните:**

```bash
# Добавить все новые файлы
git add backend/migrate-reviews-moderation.js
git add backend/migrate-quality-badges.js
git add backend/add_reviews_moderation.sql
git add backend/add_quality_badges.sql
git add backend/src/middleware/review-photos-upload.js
git add backend/src/jobs/quality-badges.js
git add frontend/src/components/ui/quality-badge.tsx

# Добавить измененные файлы
git add backend/package.json
git add backend/src/routes/reviews.js
git add backend/src/routes/customer.js
git add backend/src/index.js
git add frontend/src/components/ui/review-form.tsx
git add frontend/src/components/ui/reviews-list.tsx
git add frontend/src/components/ui/offers-list.tsx
git add frontend/src/components/ui/vendor-header.tsx
git add frontend/src/components/pages/vendor-page.tsx
git add frontend/src/lib/schemas/review.ts
git add frontend/src/lib/types.ts

# Создать коммит
git commit -m "feat: добавлена система модерации отзывов с фото и бейджи качества"

# Запушить на сервер
git push origin main
```

### 2. На сервере получите изменения

```bash
# Подключитесь к серверу
ssh user@your-server-ip

# Перейдите в директорию проекта
cd ~/kindplate
# или
cd /root/kindplate

# Получите изменения из git
git pull origin main

# Проверьте, что файлы появились
ls -la backend/migrate-reviews-moderation.js
ls -la backend/migrate-quality-badges.js
ls -la backend/add_reviews_moderation.sql
ls -la backend/add_quality_badges.sql
```

### 3. Продолжите деплой

После того как файлы появятся на сервере, выполните:

```bash
cd backend

# Установите sharp (если еще не установлен)
npm install sharp

# Создайте директорию для загрузок
mkdir -p uploads/reviews
chmod 755 uploads/reviews

# Запустите миграции
node migrate-reviews-moderation.js
node migrate-quality-badges.js

# Перезапустите backend
cd ..
docker-compose restart backend
# или
docker-compose up -d --build backend
```

---

## Альтернативный вариант: Ручное копирование файлов

Если git не работает, можете скопировать файлы вручную через SCP:

```bash
# С вашего локального компьютера
scp backend/migrate-reviews-moderation.js user@server:/root/kindplate/backend/
scp backend/migrate-quality-badges.js user@server:/root/kindplate/backend/
scp backend/add_reviews_moderation.sql user@server:/root/kindplate/backend/
scp backend/add_quality_badges.sql user@server:/root/kindplate/backend/
scp -r backend/src/middleware/review-photos-upload.js user@server:/root/kindplate/backend/src/middleware/
scp -r backend/src/jobs/quality-badges.js user@server:/root/kindplate/backend/src/jobs/
scp -r frontend/src/components/ui/quality-badge.tsx user@server:/root/kindplate/frontend/src/components/ui/
```

---

## Быстрая команда для проверки всех файлов на сервере

```bash
# На сервере выполните:
cd ~/kindplate

echo "Проверка файлов миграций:"
ls -lh backend/migrate-reviews-moderation.js backend/migrate-quality-badges.js 2>&1

echo "Проверка SQL файлов:"
ls -lh backend/add_reviews_moderation.sql backend/add_quality_badges.sql 2>&1

echo "Проверка новых файлов backend:"
ls -lh backend/src/middleware/review-photos-upload.js 2>&1
ls -lh backend/src/jobs/quality-badges.js 2>&1

echo "Проверка нового компонента frontend:"
ls -lh frontend/src/components/ui/quality-badge.tsx 2>&1
```

