# Инструкция по деплою изменений на продакшен

## Проблема
Изменения в `frontend/src/routes/__root.tsx` были сделаны, но не применились на https://app-kindplate.ru/home из-за кэширования.

## Решение

### 1. Пересборка фронтенда
Зайдите на сервер и выполните:

```bash
cd /path/to/kindplate
cd frontend
npm run build
```

### 2. Перезапуск контейнера (если используется Docker)
```bash
docker compose down
docker compose up -d --build frontend
```

### 3. Очистка кэша Caddy/Nginx
Если используется Caddy с кэшированием:
```bash
# Перезапуск Caddy
docker compose restart caddy
```

### 4. Очистка кэша браузера
После деплоя попросите пользователей:
- Нажать Ctrl+Shift+R (Windows/Linux) или Cmd+Shift+R (Mac) для hard reload
- Или очистить кэш в настройках браузера

## Что было исправлено

### Компонент MobileOnly
**Было:**
```typescript
setIsMobile(width < 768 && isPortrait);
```

**Стало:**
```typescript
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isNarrowScreen = width <= 768;

setIsMobile(isMobileDevice || isNarrowScreen);
```

**Почему:**
- Старая логика требовала одновременно узкий экран И портретную ориентацию
- Это блокировало доступ с десктопов даже при узкой ширине окна
- Новая логика разрешает доступ если:
  - Обнаружено мобильное устройство (по user agent)
  - ИЛИ ширина экрана ≤ 768px (независимо от ориентации)

## Другие найденные проблемы

### На лендинге (/)
- **Опечатка**: "Ответы на ворпосы" → должно быть "Ответы на вопросы"
  - Файл: `frontend/src/components/pages/LandingPage.tsx`
  - Строка ~468

## Проверка после деплоя

1. Откройте https://app-kindplate.ru/home
2. Страница должна загрузиться (без сообщения "Доступно только на мобильных")
3. Проверьте, что карта отображается
4. Проверьте нижнюю навигацию (Карта, Список, Профиль)

## Команды для быстрого деплоя

```bash
# Полный деплой с пересборкой
cd /path/to/kindplate
git pull
docker compose down
docker compose up -d --build

# Или только фронтенд
docker compose up -d --build frontend
docker compose restart caddy
```

