# 🚀 Деплой KindPlate

Руководство по развертыванию приложения на Railway (Backend) и Vercel (Frontend).

---

## 📋 Предварительные требования

1. Аккаунт на [Railway.app](https://railway.app)
2. Аккаунт на [Vercel.com](https://vercel.com)
3. PostgreSQL база данных (можно создать на Railway)
4. GitHub репозиторий с кодом

---

## 🔧 Backend на Railway

### 1. Создание проекта

1. Перейдите на [Railway.app](https://railway.app)
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий

### 2. Добавление PostgreSQL

1. В проекте нажмите "New" → "Database" → "Add PostgreSQL"
2. Railway автоматически создаст базу данных и переменные окружения

### 3. Настройка переменных окружения

В настройках сервиса добавьте следующие переменные:

```env
# Database (автоматически добавляется Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# Или отдельные переменные
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Server
PORT=5000
NODE_ENV=production

# Security
SECRET_KEY=your-very-long-random-secret-key-min-32-chars

# CORS (URL вашего фронтенда на Vercel)
FRONTEND_URL=https://your-app.vercel.app
```

### 4. Настройка сборки

Railway автоматически определит настройки из `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && npm start"
  }
}
```

### 5. Миграции базы данных

После первого деплоя выполните миграции через Railway CLI или Shell:

```bash
# Подключитесь к проекту
railway link

# Выполните миграции
railway run node backend/migrate-roles.js
railway run node backend/migrate-quality-badge.js
railway run node backend/migrate-reviews.js
```

Или через Railway Shell в веб-интерфейсе:
1. Откройте ваш сервис
2. Нажмите на три точки → "Shell"
3. Выполните команды миграции

---

## 🎨 Frontend на Vercel

### 1. Импорт проекта

1. Перейдите на [Vercel.com](https://vercel.com)
2. Нажмите "Add New..." → "Project"
3. Импортируйте ваш GitHub репозиторий

### 2. Настройка сборки

Vercel автоматически определит настройки из `vercel.json`:

**Root Directory:** оставьте пустым (корень проекта)

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```bash
npm install
```

### 3. Переменные окружения

Добавьте в настройках проекта:

```env
VITE_API_URL=https://your-backend.railway.app
```

### 4. Deploy

1. Нажмите "Deploy"
2. Дождитесь завершения сборки
3. Получите URL вашего приложения

---

## 🔐 Обновление CORS на Backend

После получения URL фронтенда на Vercel, обновите переменную `FRONTEND_URL` на Railway:

```env
FRONTEND_URL=https://your-app.vercel.app
```

И обновите код в `backend/src/index.js`:

```javascript
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL // URL с Vercel
];
```

---

## 🗃️ Начальные данные

После развертывания создайте администратора:

1. Подключитесь к Railway Shell
2. Выполните:
```bash
node backend/migrate-roles.js
```

Это создаст администратора:
- **Email:** admin@kindplate.ru
- **Пароль:** admin123

⚠️ **ВАЖНО:** Смените пароль администратора после первого входа!

---

## 📊 Мониторинг

### Railway
- Логи: вкладка "Deployments" → выберите деплой → "View Logs"
- Метрики: вкладка "Metrics"

### Vercel
- Логи: вкладка "Deployments" → выберите деплой → "View Function Logs"
- Analytics: вкладка "Analytics"

---

## 🔄 Обновление приложения

### Автоматический деплой

Railway и Vercel автоматически деплоят при push в main/master ветку.

### Ручной деплой

**Railway:**
1. Перейдите в проект
2. Нажмите "Deployments"
3. Нажмите "Deploy"

**Vercel:**
1. Перейдите в проект
2. Нажмите "Deployments"
3. Выберите ветку и нажмите "Deploy"

---

## 🐛 Troubleshooting

### Backend не запускается

1. Проверьте логи на Railway
2. Убедитесь, что все переменные окружения установлены
3. Проверьте подключение к базе данных

### Frontend не подключается к Backend

1. Проверьте `VITE_API_URL` в настройках Vercel
2. Проверьте CORS настройки на Backend
3. Убедитесь, что Backend доступен по указанному URL

### 404 ошибки на фронтенде

1. Убедитесь, что в `vercel.json` настроены rewrites
2. Проверьте, что `outputDirectory` указан правильно

### База данных недоступна

1. Проверьте `DATABASE_URL` или отдельные переменные БД
2. Убедитесь, что PostgreSQL сервис запущен на Railway
3. Проверьте логи подключения к БД

---

## 📝 Чеклист деплоя

- [ ] Backend развернут на Railway
- [ ] PostgreSQL создана и подключена
- [ ] Все переменные окружения установлены на Railway
- [ ] Миграции выполнены
- [ ] Frontend развернут на Vercel
- [ ] `VITE_API_URL` установлен на Vercel
- [ ] CORS обновлён с URL Vercel
- [ ] Администратор создан и пароль изменён
- [ ] Приложение доступно и работает
- [ ] SSL сертификаты работают (автоматически)

---

## 🎉 Готово!

Ваше приложение KindPlate развернуто и готово к использованию!

**Backend:** https://your-backend.railway.app  
**Frontend:** https://your-app.vercel.app

---

## 📚 Дополнительные ресурсы

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Environment Variables](https://docs.railway.app/develop/variables)

