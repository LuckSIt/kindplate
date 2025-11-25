# KindPlate Backend API

RESTful API для веб-приложения KindPlate (аналог ResQ Club) на Node.js + Express + PostgreSQL.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Настройка базы данных

Создайте файл `.env` на основе `env-example.txt`:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=kindplate
PORT=5000
SESSION_SECRET=your_secret_here
```

### 3. Пересоздание БД с тестовыми данными
```bash
npm run db:recreate
```

Это создаст:
- 1 клиента: `customer@test.com` / `123456`
- 3 партнёра: `partner1@test.com`, `partner2@test.com`, `partner3@test.com` / `123456`
- 6 тестовых предложений

### 4. Запуск сервера
```bash
# Development
npm run dev

# Production
npm start
```

API будет доступен на `http://localhost:5000`

---

## 📋 API Endpoints

### Аутентификация

#### POST `/api/auth/register`
Регистрация нового пользователя (клиент или партнёр)

**Request:**
```json
{
  "name": "Иван Петров",
  "email": "ivan@example.com",
  "phone": "+79991234567",
  "password": "password123",
  "role": "user",
  "partnerData": {
    "businessName": "Кафе Уют",
    "address": "Невский пр., 1",
    "latitude": 59.934280,
    "longitude": 30.346620,
    "description": "Описание",
    "categories": ["cafe", "restaurant"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "role": "user"
  }
}
```

#### POST `/api/auth/login`
Вход в систему

**Request:**
```json
{
  "emailOrPhone": "ivan@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/logout`
Выход из системы

#### GET `/api/auth/me`
Получить текущего пользователя

---

### Партнёры

#### GET `/api/partners`
Список всех партнёров (публичный)

**Query params:**
- `lat`, `lng` - координаты для сортировки по расстоянию
- `category` - фильтр по категории
- `q` - поиск по названию
- `page`, `limit` - пагинация

#### GET `/api/partners/:id`
Детали партнёра (публичный)

#### GET `/api/partners/me`
Профиль текущего партнёра (требует авторизацию)

#### PATCH `/api/partners/me`
Обновить профиль партнёра

---

### Предложения (Offers)

#### GET `/api/offers`
Список всех активных предложений (публичный)

**Query params:**
- `lat`, `lng`, `radius` - гео-фильтр
- `category` - фильтр по категории партнёра
- `q` - поиск по названию
- `sort` - сортировка: `distance`, `price`, `created_at`
- `page`, `limit` - пагинация

#### GET `/api/offers/:id`
Детали предложения (публичный)

#### GET `/api/offers/partner/:partnerId`
Предложения конкретного партнёра (публичный)

#### GET `/api/offers/mine`
Предложения текущего партнёра (требует авторизацию партнёра)

#### POST `/api/offers`
Создать новое предложение (партнёр)

**Request:**
```json
{
  "title": "Салат Цезарь",
  "description": "Свежий салат с курицей",
  "price_cents": 15000,
  "original_price_cents": 35000,
  "quantity_total": 5,
  "quantity_left": 5,
  "available_from": "2024-01-20T10:00:00Z",
  "available_to": "2024-01-20T18:00:00Z",
  "images": ["https://..."],
  "tags": ["salad", "chicken"]
}
```

#### PATCH `/api/offers/:id`
Обновить предложение (партнёр)

#### DELETE `/api/offers/:id`
Удалить предложение (партнёр)

---

### Заказы (Orders)

#### GET `/api/orders`
Список заказов (клиент видит свои, партнёр — входящие)

#### GET `/api/orders/:id`
Детали заказа

#### POST `/api/orders`
Создать заказ (клиент)

**Request:**
```json
{
  "partner_id": "uuid",
  "items": [
    {
      "offer_id": "uuid",
      "quantity": 1,
      "price_cents": 15000,
      "title": "Салат Цезарь"
    }
  ],
  "pickup_time": "2024-01-20T18:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "pickup_code": "123456",
    "total_cents": 15000,
    "status": "NEW",
    ...
  },
  "payment_url": "https://yookassa.ru/..."
}
```

#### PATCH `/api/orders/:id/status`
Изменить статус заказа (партнёр)

**Request:**
```json
{
  "status": "CONFIRMED"
}
```

Статусы: `NEW`, `CONFIRMED`, `READY_FOR_PICKUP`, `PICKED_UP`, `CANCELLED`, `REFUNDED`

#### POST `/api/orders/:id/verify-pickup`
Подтвердить получение заказа по коду (партнёр)

**Request:**
```json
{
  "pickup_code": "123456"
}
```

#### PATCH `/api/orders/:id/cancel`
Отменить заказ (клиент)

---

### Платежи (Payments)

#### POST `/api/payments/create`
Создать платёж через YooKassa (клиент)

**Request:**
```json
{
  "order_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "payment_url": "https://yookassa.ru/...",
  "payment_id": "yookassa_payment_id"
}
```

#### POST `/api/payments/webhook`
Webhook от YooKassa (обрабатывает события платежей)

#### POST `/api/payments/refund`
Запросить возврат (клиент)

**Request:**
```json
{
  "order_id": "uuid",
  "reason": "Причина возврата"
}
```

---

## 🗄️ База данных

### Основные таблицы:
- `users` - пользователи (клиенты и партнёры)
- `partners` - профили партнёров
- `offers` - предложения
- `orders` - заказы
- `payments` - платежи
- `favorites` - избранные партнёры
- `reviews` - отзывы

Полная схема в `init.sql`.

---

## 🔧 Разработка

### Scripts:
```bash
npm run dev          # Запуск с nodemon
npm start            # Production запуск
npm run db:recreate  # Пересоздать БД
```

### Логирование:
Все ошибки логируются в консоль с префиксом endpoint'а.

### Тестирование API:
Используйте Postman, Insomnia или curl:

```bash
# Health check
curl http://localhost:5000/health

# Регистрация
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","role":"user"}'
```

---

## 🔒 Безопасность

- Пароли хэшируются с bcrypt
- Сессии на cookie-session
- CORS настроен для frontend
- Webhook от YooKassa проверяется по подписи
- SQL injection защита через параметризованные запросы

---

## 🚀 Production

### Environment variables:
Все переменные окружения должны быть настроены в `.env`:
- `DB_*` - подключение к БД
- `YOOKASSA_*` - настройки YooKassa
- `SESSION_SECRET` - секрет для сессий
- `FRONTEND_URL` - URL фронтенда для CORS

### Рекомендации:
- Используйте PostgreSQL 14+
- Настройте backup БД (pg_dump ежедневно)
- Используйте reverse proxy (nginx)
- Включите HTTPS
- Настройте мониторинг (Sentry, Prometheus)

---

## 📦 Зависимости

- `express` - веб-фреймворк
- `pg` - PostgreSQL клиент
- `bcrypt` - хэширование паролей
- `cookie-session` - сессии
- `cors` - CORS middleware
- `axios` - HTTP клиент для YooKassa
- `uuid` - генерация UUID
- `dotenv` - переменные окружения

---

## 📄 Лицензия

ISC

---

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте `.env` файл
2. Убедитесь, что PostgreSQL запущен
3. Проверьте логи сервера
4. Запустите `npm run db:recreate` для чистой БД



