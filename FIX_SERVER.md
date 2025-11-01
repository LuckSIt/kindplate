# Инструкция по исправлению сервера

## Проблема
На сервере старая версия файлов, из-за чего Caddy не запускается.

## Решение - выполните эти команды на сервере:

```bash
cd /root/kindplate

# 1. Принудительно обновляем все файлы
git reset --hard HEAD
git clean -fd
git fetch origin main
git reset --hard origin/main

# 2. Проверяем, что docker-compose.yml обновился (должен быть без "version")
grep -n "version:" docker-compose.yml || echo "✅ version удалён"

# 3. Проверяем, что есть сервис caddy
grep -A 10 "caddy:" docker-compose.yml || echo "❌ Caddy не найден!"

# 4. Останавливаем старые контейнеры
docker compose down

# 5. Пересобираем БЕЗ кэша
docker compose build --no-cache

# 6. Запускаем
docker compose up -d

# 7. Ждём 5 секунд
sleep 5

# 8. Проверяем статус (должен быть сервис caddy)
docker compose ps

# 9. Проверяем логи Caddy
docker compose logs caddy
```

## Если всё прошло успешно:
- Откройте: **https://app-kindplate.tw1.ru**
- DNS для `app-kindplate.tw1.ru` нужно настроить в панели TimeWeb

