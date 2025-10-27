# 🚀 Быстрый старт - Деплой на GitHub, Railway и Vercel

## Шаг 1: Подготовка проекта ✅ (ГОТОВО)

- ✅ Удалены временные файлы
- ✅ Создан `.gitignore`
- ✅ Созданы конфигурации для Railway и Vercel
- ✅ Написана документация

## Шаг 2: Загрузка на GitHub

### 2.1 Инициализация Git (если нужно)

Откройте терминал в папке проекта и выполните:

```powershell
git init
```

### 2.2 Добавьте все файлы

```powershell
git add .
```

### 2.3 Создайте коммит

```powershell
git commit -m "Initial commit: KindPlate platform with admin system"
```

### 2.4 Создайте репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Название: `kindplate`
3. Описание: "Food waste reduction platform"
4. Public/Private - на ваш выбор
5. **НЕ ДОБАВЛЯЙТЕ** README, .gitignore, license
6. Нажмите "Create repository"

### 2.5 Подключите remote и загрузите код

Замените `yourusername` на ваш username:

```powershell
git remote add origin https://github.com/yourusername/kindplate.git
git branch -M main
git push -u origin main
```

## Шаг 3: Деплой Backend на Railway 🚂

### 3.1 Создайте проект

1. Перейдите на https://railway.app
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите репозиторий `kindplate`

### 3.2 Добавьте PostgreSQL

1. В проекте нажмите "New"
2. Выберите "Database" → "Add PostgreSQL"
3. Railway создаст БД и добавит переменные

### 3.3 Настройте переменные окружения

В настройках Backend сервиса добавьте:

```env
PORT=5000
NODE_ENV=production
SECRET_KEY=your-super-secret-key-at-least-32-characters-long
```

Railway автоматически добавит DATABASE_URL.

### 3.4 Настройки сборки (автоматически из railway.json)

- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`

### 3.5 Выполните миграции

После первого деплоя:

1. Откройте сервис на Railway
2. Нажмите три точки (⋮) → "Shell"
3. Выполните:

```bash
cd backend
node migrate-roles.js
node migrate-quality-badge.js
node migrate-reviews.js
```

### 3.6 Скопируйте URL Backend

В настройках сервиса скопируйте URL (например: `https://your-app.railway.app`)

## Шаг 4: Деплой Frontend на Vercel ▲

### 4.1 Импортируйте проект

1. Перейдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите "Add New..." → "Project"
4. Найдите репозиторий `kindplate`
5. Нажмите "Import"

### 4.2 Настройте проект

**Framework Preset:** Vite

**Root Directory:** Оставьте пустым

**Build Command:**
```
cd frontend && npm install && npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```
npm install
```

### 4.3 Добавьте переменные окружения

Нажмите "Environment Variables" и добавьте:

**Key:** `VITE_API_URL`
**Value:** `https://your-backend.railway.app` (URL с Railway)

### 4.4 Deploy

Нажмите "Deploy" и дождитесь завершения.

### 4.5 Скопируйте URL Frontend

После деплоя скопируйте URL (например: `https://your-app.vercel.app`)

## Шаг 5: Обновите CORS на Backend

### 5.1 Вернитесь на Railway

1. Откройте Backend сервис
2. Перейдите в "Variables"
3. Добавьте:

**Key:** `FRONTEND_URL`
**Value:** `https://your-app.vercel.app` (URL с Vercel)

### 5.2 Обновите код (опционально)

В `backend/src/index.js` убедитесь, что CORS настроен:

```javascript
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL // URL с Vercel
];
```

Railway автоматически перезапустит сервис.

## Шаг 6: Первый вход 🎉

### 6.1 Откройте приложение

Перейдите на ваш URL с Vercel: `https://your-app.vercel.app`

### 6.2 Войдите как администратор

Перейдите на страницу входа:
- Email: `admin@kindplate.ru`
- Пароль: `admin123`

### 6.3 Создайте тестовый бизнес

1. В панели администратора нажмите "+ Добавить бизнес"
2. Заполните форму
3. Создайте первый бизнес!

### 6.4 Смените пароль администратора

⚠️ **ВАЖНО:** Зайдите в настройки и смените пароль!

## 🎊 Готово!

Ваше приложение развернуто и работает!

**Backend:** https://your-backend.railway.app  
**Frontend:** https://your-app.vercel.app  
**Admin:** admin@kindplate.ru / admin123

---

## 📝 Чек-лист

- [ ] Код загружен на GitHub
- [ ] Backend развернут на Railway
- [ ] PostgreSQL создана
- [ ] Миграции выполнены
- [ ] Frontend развернут на Vercel
- [ ] CORS обновлён
- [ ] Вход работает
- [ ] Пароль администратора изменён

---

## 🐛 Если что-то не работает

### Проблема: Frontend не подключается к Backend

**Решение:**
1. Проверьте `VITE_API_URL` на Vercel
2. Проверьте `FRONTEND_URL` на Railway
3. Проверьте, что Backend доступен по URL

### Проблема: 500 ошибка на Backend

**Решение:**
1. Откройте логи на Railway (Deployments → View Logs)
2. Проверьте подключение к БД
3. Убедитесь, что все миграции выполнены

### Проблема: 404 на фронтенде при обновлении страницы

**Решение:**
Проверьте `vercel.json` - должны быть rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📚 Дополнительная документация

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Подробное руководство
- [ROLE_SYSTEM.md](./ROLE_SYSTEM.md) - Система ролей
- [README.md](./README.md) - Общая информация

---

**Удачи! 🚀**

