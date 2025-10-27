# 🔧 Настройка Git и GitHub

## Инициализация Git репозитория

```bash
# Инициализируйте git (если ещё не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit: KindPlate platform with role system"
```

## Создание репозитория на GitHub

1. Перейдите на [GitHub.com](https://github.com)
2. Нажмите "New repository"
3. Заполните:
   - **Name:** `kindplate` (или ваше название)
   - **Description:** "Food waste reduction platform - спасаем еду от выбрасывания"
   - **Public/Private:** выберите по желанию
   - **НЕ ДОБАВЛЯЙТЕ** README, .gitignore или license (они уже есть)

4. Нажмите "Create repository"

## Подключение к GitHub

```bash
# Добавьте remote
git remote add origin https://github.com/yourusername/kindplate.git

# Или с SSH (рекомендуется)
git remote add origin git@github.com:yourusername/kindplate.git

# Проверьте подключение
git remote -v

# Push на GitHub
git branch -M main
git push -u origin main
```

## Защита .env файлов

⚠️ **ВАЖНО:** Убедитесь, что `.env` файлы НЕ попадают в Git!

Проверьте `.gitignore`:
```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

Если `.env` уже в Git, удалите его:
```bash
git rm --cached backend/.env
git rm --cached frontend/.env
git commit -m "Remove .env files from tracking"
```

## Создайте .env.example файлы

**backend/.env.example:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=kindplate
PORT=5000
SECRET_KEY=your-very-long-random-secret-key-min-32-characters
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**frontend/.env.example:**
```env
VITE_API_URL=http://localhost:5000
VITE_YANDEX_MAPS_API_KEY=your-yandex-maps-api-key
```

Затем добавьте их в Git:
```bash
git add backend/.env.example frontend/.env.example
git commit -m "Add .env.example files"
git push
```

## Структура коммитов

Используйте осмысленные сообщения коммитов:

```bash
# Новая функциональность
git commit -m "feat: add admin panel for business management"

# Исправление ошибок
git commit -m "fix: resolve order creation 400 error"

# Документация
git commit -m "docs: add deployment guide"

# Стиль/форматирование
git commit -m "style: fix TypeScript linting errors"

# Рефакторинг
git commit -m "refactor: simplify OptimizedImage component"
```

## Ветки для разработки

```bash
# Создайте ветку для разработки
git checkout -b develop

# Создайте feature ветку
git checkout -b feature/payment-integration

# После завершения работы
git checkout develop
git merge feature/payment-integration

# Push на GitHub
git push origin develop
```

## GitHub Actions (CI/CD)

Создайте `.github/workflows/deploy.yml` для автоматического деплоя:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Railway
        run: echo "Deploy backend to Railway"
      
      - name: Deploy to Vercel
        run: echo "Deploy frontend to Vercel"
```

## README бейджи

Добавьте в README.md:

```markdown
![Build Status](https://github.com/yourusername/kindplate/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
```

## Готово! 🎉

Теперь ваш проект готов к деплою на Railway и Vercel!

