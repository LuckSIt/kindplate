# Система аутентификации и авторизации KindPlate

## Обзор

Проект использует гибридную систему аутентификации:
- **Cookie-session** (httpOnly) для веб-приложения
- **JWT токены (JOSE)** для API и мобильных приложений

## Безопасность

### 🔐 Хэширование паролей
- **bcrypt** с salt rounds = 12
- Автоматическая генерация соли для каждого пароля
- Регистрозависимое сравнение

### 🛡️ Rate Limiting
- **Вход**: 5 попыток за 15 минут
- **Регистрация**: 3 попытки за 1 час
- Защита от брутфорса и DDoS атак

### 🔑 JWT Токены
- **Access Token**: 15 минут (для API запросов)
- **Refresh Token**: 7 дней (для обновления access token)
- Алгоритм подписи: HS256
- Issuer: `kindplate-api`
- Audience: `kindplate-client`

## API Endpoints

### Регистрация
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Иван Петров",
  "email": "ivan@example.com",
  "password": "SecurePassword123",
  "is_business": false,
  "address": "Optional for business",
  "coords": [59.9343, 30.3351]
}

Response: 201 Created
{
  "success": true,
  "message": "Пользователь успешно зарегистрирован"
}
```

### Вход
```http
POST /auth/login
Content-Type: application/json

{
  "email": "ivan@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Вход выполнен успешно",
  "user": {
    "id": 1,
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "is_business": false
  }
}
```

### Выход
```http
GET /auth/logout

Response: 200 OK
{
  "success": true,
  "message": "Выход выполнен успешно"
}
```

### Получить текущего пользователя
```http
GET /auth/me

Response: 200 OK
{
  "user": {
    "id": 1,
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "is_business": false,
    "phone": "+7 999 123 45 67",
    "rating": 4.5,
    "total_reviews": 10
  },
  "success": true
}
```

### Получить JWT токены
```http
POST /auth/tokens

Response: 200 OK
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Обновить access token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

## Guards (Middleware)

### requireAuth
Проверяет, что пользователь аутентифицирован (имеет активную сессию).

```javascript
const { requireAuth } = require('./lib/guards');

app.get('/protected', requireAuth, (req, res) => {
  // req.session.userId доступен
});
```

### requireBusiness
Проверяет, что пользователь является бизнесом.

```javascript
const { requireBusiness } = require('./lib/guards');

app.post('/business/offers', requireBusiness, (req, res) => {
  // req.session.isBusiness === true
});
```

### requireCustomer
Проверяет, что пользователь является обычным клиентом (не бизнес).

```javascript
const { requireCustomer } = require('./lib/guards');

app.get('/orders', requireCustomer, (req, res) => {
  // req.session.isBusiness === false
});
```

### optionalAuth
Опциональная аутентификация (не выбрасывает ошибку).

```javascript
const { optionalAuth } = require('./lib/guards');

app.get('/offers', optionalAuth, (req, res) => {
  if (req.isAuthenticated) {
    // Пользователь авторизован
    // req.userId доступен
  }
});
```

## JWT Middleware

### authenticateJWT
Проверяет JWT токен из заголовка `Authorization: Bearer <token>`.

```javascript
const { authenticateJWT } = require('./lib/jwtMiddleware');

app.get('/api/profile', authenticateJWT, (req, res) => {
  // req.userId, req.userEmail, req.isBusiness доступны
});
```

### optionalJWT
Опциональная JWT аутентификация.

```javascript
const { optionalJWT } = require('./lib/jwtMiddleware');

app.get('/api/offers', optionalJWT, (req, res) => {
  if (req.isAuthenticated) {
    // JWT токен валиден
  }
});
```

## Профиль пользователя

### Получить профиль
```http
GET /profile

Response: 200 OK
{
  "success": true,
  "profile": {
    "id": 1,
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+7 999 123 45 67",
    "is_business": false,
    "terms_accepted": true,
    "privacy_accepted": true,
    "created_at": "2024-01-01T12:00:00Z",
    "profile_updated_at": "2024-01-15T14:30:00Z"
  }
}
```

### Обновить профиль
```http
PUT /profile
Content-Type: application/json

{
  "name": "Иван Петров",
  "phone": "+7 999 123 45 67",
  "address": "Москва, ул. Ленина, 1"
}

Response: 200 OK
{
  "success": true,
  "message": "Профиль успешно обновлен",
  "profile": { ... }
}
```

### Изменить пароль
```http
POST /profile/change-password
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Пароль успешно изменен"
}
```

### Принять согласия
```http
POST /profile/accept-terms
Content-Type: application/json

{
  "terms": true,
  "privacy": true
}

Response: 200 OK
{
  "success": true,
  "message": "Согласия успешно сохранены"
}
```

### Удалить аккаунт
```http
DELETE /profile
Content-Type: application/json

{
  "password": "CurrentPassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Аккаунт успешно удален"
}
```

## Валидация

### Email
- Формат: `user@domain.com`
- Регулярное выражение: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Пароль
- Минимум: 6 символов
- Максимум: 100 символов
- Рекомендуется: буквы, цифры, спецсимволы

### Имя
- Минимум: 2 символа
- Максимум: 100 символов
- Обрезаются пробелы в начале/конце

### Телефон
- Опционально
- Минимум: 10 символов
- Максимум: 20 символов
- Разрешены: цифры, пробелы, +, -, (, )

## Тестирование

### Запуск тестов
```bash
cd backend
npm install
npm test
```

### Тесты включают:
- ✅ Bcrypt хэширование и верификация паролей
- ✅ Валидация email, пароля, имени, телефона
- ✅ Guards (requireAuth, requireBusiness, requireCustomer, optionalAuth)
- ✅ JWT токены (создание, верификация, декодирование)

### Покрытие кода
```bash
npm test -- --coverage
```

## Безопасность в production

### Обязательно:
1. Установить `JWT_SECRET` в `.env` (минимум 32 символа)
2. Установить `SECRET_KEY` для cookie-session
3. Использовать HTTPS для всех запросов
4. Настроить CORS для конкретных доменов
5. Использовать `httpOnly` и `secure` флаги для cookies
6. Логировать все попытки входа и ошибки аутентификации

### Рекомендации:
- Ротация JWT_SECRET каждые 90 дней
- Двухфакторная аутентификация (2FA)
- Email верификация при регистрации
- Сброс пароля через email
- Блокировка аккаунта после 10 неудачных попыток входа

## Примеры использования

### Frontend (Session-based)
```typescript
// Вход
const response = await axiosInstance.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Запросы автоматически включают cookie
const profile = await axiosInstance.get('/profile');
```

### Mobile App (JWT-based)
```typescript
// Вход и получение токенов
const loginResponse = await axios.post('/auth/login', { ... });
const tokensResponse = await axios.post('/auth/tokens');

const { accessToken, refreshToken } = tokensResponse.data;

// Сохранить токены в secure storage
await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Использовать в запросах
const profile = await axios.get('/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Обновить токен при истечении
if (response.status === 401) {
  const newTokens = await axios.post('/auth/refresh', {
    refreshToken
  });
  // Повторить запрос с новым токеном
}
```

## Ошибки

### 401 Unauthorized
- Пользователь не авторизован
- Токен невалиден или истек
- Требуется вход

### 403 Forbidden
- Недостаточно прав
- Попытка доступа к ресурсу другой роли

### 429 Too Many Requests
- Превышен лимит попыток входа
- Подождите и попробуйте снова

## Поддержка

Для вопросов по аутентификации обращайтесь к разработчику или создавайте issue в репозитории.




