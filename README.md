# 🍽️ KindPlate - Спасаем еду от выбрасывания

**KindPlate** — платформа для продажи готовой еды с истекающим сроком годности по сниженным ценам. Помогаем бизнесам сократить потери, а покупателям — экономить и заботиться об экологии.

---

## 🌟 Возможности

### Для покупателей
- 🗺️ Интерактивная карта с заведениями
- 🔍 Поиск офферов в реальном времени
- ⭐ Избранное и отзывы
- 📱 PWA - работает как мобильное приложение
- 🌐 Маршруты до заведения (Yandex Maps/Navigator)

### Для бизнеса
- 📊 Панель управления офферами
- 📈 Статистика продаж и заказов
- 🏆 Система "Лучшие у нас" (quality badge)
- 📸 Загрузка фотографий блюд
- ⏰ Управление временем самовывоза

### Для администратора
- 👥 Управление бизнесами
- 📊 Статистика платформы
- 🔐 Контроль регистрации бизнесов
- 🗑️ Удаление бизнесов

---

## 🛠️ Технологии

### Frontend
- **React 19** + **TypeScript**
- **TanStack Router** (file-based routing)
- **TanStack Query** (data fetching)
- **Tailwind CSS** (styling)
- **Vite** (build tool)
- **PWA** (Progressive Web App)
- **Yandex Maps API**

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (database)
- **JOSE** (JWT tokens)
- **Bcrypt** (password hashing)
- **Multer** + **Sharp** (image processing)
- **Helmet** + Security middleware

---

## 📦 Установка

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/kplate.git
cd kplate
```

### 2. Backend

```bash
cd backend
npm install

# Создайте .env файл
cp .env.example .env

# Отредактируйте .env с вашими данными
nano .env
```

**.env пример:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=kindplate

PORT=5000
SECRET_KEY=your-very-long-random-secret-key-min-32-chars
NODE_ENV=development
```

```bash
# Создайте базу данных
createdb kindplate

# Выполните миграции
node migrate-roles.js
node migrate-quality-badge.js
node migrate-reviews.js

# Запустите сервер
npm run dev
```

### 3. Frontend

```bash
cd ../frontend
npm install

# Создайте .env файл
cp .env.example .env

# Отредактируйте .env
nano .env
```

**.env пример:**
```env
VITE_API_URL=http://localhost:5000
VITE_YANDEX_MAPS_API_KEY=your-yandex-maps-api-key
```

```bash
# Запустите dev сервер
npm run dev
```

---

## 🚀 Деплой

Подробные инструкции по развертыванию на Railway (Backend) и Vercel (Frontend) см. в [DEPLOYMENT.md](./DEPLOYMENT.md)

**Быстрый старт:**

1. **Backend на Railway:**
   - Подключите GitHub репозиторий
   - Добавьте PostgreSQL
   - Установите переменные окружения
   - Выполните миграции

2. **Frontend на Vercel:**
   - Импортируйте проект
   - Установите `VITE_API_URL`
   - Deploy

---

## 👤 Первый запуск

После установки создайте администратора:

```bash
cd backend
node migrate-roles.js
```

**Учетные данные администратора:**
- Email: `admin@kindplate.ru`
- Пароль: `admin123`

⚠️ **Смените пароль после первого входа!**

---

## 📖 Документация

- [ROLE_SYSTEM.md](./ROLE_SYSTEM.md) - Система ролей и прав доступа
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Руководство по деплою
- [PERFORMANCE_IMPLEMENTATION.md](./PERFORMANCE_IMPLEMENTATION.md) - Оптимизации производительности
- [WEB_OPTIMIZATIONS.md](./WEB_OPTIMIZATIONS.md) - Web-оптимизации
- [backend/SECURITY.md](./backend/SECURITY.md) - Меры безопасности

---

## 🏗️ Структура проекта

```
kplate-master/
├── backend/
│   ├── src/
│   │   ├── index.js           # Главный файл сервера
│   │   ├── lib/               # Библиотеки (auth, db, guards)
│   │   ├── routes/            # API роуты
│   │   ├── middleware/        # Middleware (security, validation)
│   │   └── jobs/              # Cron jobs
│   ├── uploads/               # Загруженные файлы
│   ├── migrate-*.js           # Миграции БД
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── routes/            # Страницы (file-based routing)
│   │   ├── components/        # React компоненты
│   │   ├── lib/               # Утилиты (auth, api, hooks)
│   │   └── main.tsx           # Точка входа
│   ├── public/                # Статические файлы
│   └── package.json
│
├── .gitignore
├── railway.json               # Railway конфигурация
├── vercel.json                # Vercel конфигурация
├── DEPLOYMENT.md              # Инструкции по деплою
└── README.md
```

---

## 🔐 Безопасность

- ✅ JWT токены с HTTP-only cookies
- ✅ Bcrypt хеширование паролей
- ✅ Rate limiting на auth endpoints
- ✅ Helmet security headers
- ✅ CORS политика
- ✅ XSS protection
- ✅ SQL injection protection
- ✅ File upload validation
- ✅ Zod schema validation

Подробнее в [backend/SECURITY.md](./backend/SECURITY.md)

---

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
npm test

# Frontend тесты
cd frontend
npm test
```

---

## 📱 PWA

Приложение работает как Progressive Web App:
- ✅ Офлайн-режим
- ✅ Установка на домашний экран
- ✅ Push-уведомления (планируется)
- ✅ Кеширование изображений
- ✅ Background sync (планируется)

---

## 🤝 Участие в разработке

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект лицензирован под MIT License.

---

## 📞 Контакты

- **Telegram:** @kindplate_support
- **Email:** support@kindplate.ru

---

## 🙏 Благодарности

- [Yandex Maps API](https://yandex.ru/dev/maps/)
- [TanStack](https://tanstack.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Made with ❤️ for fighting food waste**

## Deploy (Амвера / Docker + Caddy)

1. Подготовка сервера

```
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker
```

2. Клонируйте репозиторий и создайте `.env` (рядом с `docker-compose.yml`):

```
DATABASE_URL=postgres://kind:plate@postgres:5432/kindplate?sslmode=disable
SECRET_KEY=<random_string>
FRONTEND_ORIGIN=https://app.kindplate.ru
VITE_BACKEND_BASE_URL=https://api.kindplate.ru
# VITE_VAPID_PUBLIC_KEY=<если используете web-push>
```

3. Отредактируйте `Caddyfile` — укажите реальные домены и почту в секции `{ email ... }`.

4. Запуск:

```
docker compose build
docker compose up -d
```

5. (опц.) Инициализация БД:

```
docker compose exec -T postgres psql -U kind -d kindplate < backend/init.sql
```

Логи: `docker compose logs -f backend|frontend|caddy`.
