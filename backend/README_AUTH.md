# 🔐 Система аутентификации KindPlate

## ✅ Что реализовано

### Backend
- ✅ **JOSE (JWT)** токены для API
- ✅ **Cookie-session** с httpOnly для веб-приложения
- ✅ **Bcrypt** хэширование паролей (salt rounds = 12)
- ✅ **Rate-limit** защита от брутфорса
- ✅ **Guards** middleware (requireAuth, requireBusiness, requireCustomer, optionalAuth)
- ✅ **Profile API** (GET/PUT /profile, изменение пароля, согласия)
- ✅ **Vitest unit-тесты** (54 теста, все прошли ✓)

### Frontend
- ✅ Страница профиля с формой редактирования
- ✅ Изменение пароля через диалог
- ✅ Отображение согласий (оферта, ПДн)
- ✅ Удаление аккаунта с подтверждением
- ✅ React Hook Form + Zod валидация
- ✅ TanStack Query для управления состоянием

## 🚀 Быстрый старт

### 1. Миграция БД
```bash
cd backend
node migrate-profile.js
```

### 2. Запуск тестов
```bash
cd backend
npm test
```

### 3. Запуск серверов
```bash
# Backend (Terminal 1)
cd backend
node src/index.js

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 📋 API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `GET /auth/logout` - Выход
- `GET /auth/me` - Текущий пользователь
- `POST /auth/tokens` - Получить JWT токены
- `POST /auth/refresh` - Обновить токен

### Профиль
- `GET /profile` - Получить профиль
- `PUT /profile` - Обновить профиль
- `POST /profile/change-password` - Изменить пароль
- `POST /profile/accept-terms` - Принять согласия
- `DELETE /profile` - Удалить аккаунт

## 🔒 Безопасность

### Rate Limiting
- **Login**: 5 попыток / 15 минут
- **Register**: 3 попытки / 1 час

### JWT Токены
- **Access Token**: 15 минут
- **Refresh Token**: 7 дней
- **Алгоритм**: HS256

### Bcrypt
- **Salt rounds**: 12
- **Автоматическая генерация** соли

## 🧪 Тестирование

### Результаты тестов
```
✓ tests/bcrypt.test.js      (8 tests)  ✓
✓ tests/validation.test.js  (15 tests) ✓
✓ tests/guards.test.js      (15 tests) ✓
✓ tests/jwt.test.js         (16 tests) ✓

Total: 54 tests passed
```

### Покрытие
- Bcrypt хэширование и верификация
- Email, пароль, имя, телефон валидация
- Guards (все типы)
- JWT создание, верификация, декодирование

## 📱 Использование

### Frontend (Session-based)
```typescript
// Вход
await axiosInstance.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Получить профиль
const { data } = await axiosInstance.get('/profile');
```

### Mobile App (JWT-based)
```typescript
// Получить токены
const { accessToken, refreshToken } = await getTokens();

// API запрос
const response = await axios.get('/profile', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 🛡️ Guards

### requireAuth
```javascript
app.get('/protected', requireAuth, (req, res) => {
  // req.session.userId доступен
});
```

### requireBusiness
```javascript
app.post('/business/offers', requireBusiness, (req, res) => {
  // Только для бизнеса
});
```

### requireCustomer
```javascript
app.get('/orders', requireCustomer, (req, res) => {
  // Только для клиентов
});
```

## 📖 Полная документация

См. `backend/docs/AUTHENTICATION.md` для подробной документации.

## 🎯 Следующие шаги

1. ✅ Аутентификация - **Готово**
2. ✅ Профиль - **Готово**
3. ✅ Тесты - **Готово**
4. 🔄 Интеграция с frontend
5. 🔄 Email верификация (опционально)
6. 🔄 2FA (опционально)

## 🐛 Известные проблемы

Нет известных проблем. Все тесты проходят успешно.

## 📞 Поддержка

Для вопросов создавайте issue в репозитории.




