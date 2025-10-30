# Инструкция по развертыванию на TimeWeb VPS

## Предварительные требования

1. **DNS настройка** (обязательно!):
   - A-запись: `app-kindplate.tw1.ru` → `45.132.50.45`
   - A-запись: `api-kindplate.tw1.ru` → `45.132.50.45`
   - Подождите 5-10 минут после создания записей для распространения DNS

2. **На сервере должны быть установлены**:
   - Docker
   - Docker Compose
   - Git

## Шаги развертывания

### 1. Подключитесь к серверу по SSH
```bash
ssh root@45.132.50.45
```

### 2. Перейдите в директорию проекта
```bash
cd /root/kindplate
```

### 3. Обновите код из репозитория
```bash
git pull origin main
```

### 4. Создайте файл .env (если его нет)
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://kind:plate@postgres:5432/kindplate
SECRET_KEY=$(openssl rand -base64 32)
FRONTEND_ORIGIN=https://app-kindplate.tw1.ru
VITE_BACKEND_BASE_URL=https://api-kindplate.tw1.ru
VITE_VAPID_PUBLIC_KEY=
EOF
```

### 5. Остановите старые контейнеры
```bash
docker compose down
```

### 6. Пересоберите образы с чистым кешем
```bash
docker compose build --no-cache
```

### 7. Запустите все сервисы
```bash
docker compose up -d
```

### 8. Проверьте статус контейнеров
```bash
docker compose ps
docker compose logs -f --tail=100
```

Все сервисы должны быть в статусе "Up". Нажмите Ctrl+C для выхода из логов.

### 9. Проверьте работу

**Через 2-3 минуты** (время на получение SSL-сертификатов от Let's Encrypt):

1. Откройте в браузере (Инкогнито):
   - https://app-kindplate.tw1.ru

2. В консоли браузера (F12 → Network) проверьте:
   - Запросы должны идти на `https://api-kindplate.tw1.ru/...`
   - Все запросы должны быть успешными (статус 200)
   - Нет ошибок `ERR_NAME_NOT_RESOLVED` или `ERR_TUNNEL_CONNECTION_FAILED`

3. Проверьте SSL-сертификаты:
   - В адресной строке браузера должен быть замок 🔒
   - Сертификаты выданы Let's Encrypt

## Проверка конфигурации

### Проверить, что фронтенд собран с правильным API URL:
```bash
docker compose exec frontend sh -c "grep -r 'api-kindplate.tw1.ru' /usr/share/nginx/html | head -n 5"
```

Должны быть результаты с `api-kindplate.tw1.ru`.

### Проверить логи Caddy для диагностики SSL:
```bash
docker compose logs caddy -f
```

### Проверить, что backend отвечает:
```bash
curl -v http://localhost:5000/health 2>&1 | grep -E '(HTTP|health)'
```

### Проверить, что DNS настроен правильно:
```bash
nslookup app-kindplate.tw1.ru
nslookup api-kindplate.tw1.ru
```

Оба домена должны указывать на `45.132.50.45`.

## Устранение проблем

### Если сайт не открывается:

1. **DNS не настроен**:
   - Проверьте A-записи в панели TimeWeb
   - Подождите 5-10 минут после создания
   - Проверьте через `nslookup` или https://dnschecker.org

2. **Caddy не может получить сертификат**:
   ```bash
   docker compose logs caddy | grep -i error
   ```
   - Убедитесь, что порты 80 и 443 открыты
   - Проверьте firewall: `ufw status`
   - Если нужно, откройте порты:
     ```bash
     ufw allow 80/tcp
     ufw allow 443/tcp
     ```

3. **Frontend показывает старую версию**:
   - Очистите кеш браузера (Ctrl+Shift+Del)
   - Откройте в режиме инкогнито
   - Добавьте `?nocache=$(date +%s)` к URL

4. **Backend не отвечает**:
   ```bash
   docker compose logs backend -f
   docker compose exec backend sh -c 'curl -v http://localhost:5000/health'
   ```

5. **База данных не подключается**:
   ```bash
   docker compose logs postgres -f
   docker compose exec postgres psql -U kind -d kindplate -c '\dt'
   ```

## Быстрый перезапуск

Если нужно быстро перезапустить приложение:

```bash
cd /root/kindplate
git pull origin main
docker compose down
docker compose up -d --build
```

## Очистка и полная переустановка

⚠️ **Внимание**: Это удалит все данные из базы!

```bash
cd /root/kindplate
docker compose down -v
docker system prune -af --volumes
git pull origin main
docker compose up -d --build
```

## Мониторинг

### Просмотр всех логов:
```bash
docker compose logs -f
```

### Просмотр логов конкретного сервиса:
```bash
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f caddy
docker compose logs -f postgres
```

### Использование ресурсов:
```bash
docker stats
```

### Размер образов и контейнеров:
```bash
docker system df
```

