#!/bin/bash
set -e
cd /root/kindplate

echo "📥 Обновляю код из Git..."
# Принудительно отбрасываем все локальные изменения
git reset --hard HEAD
git clean -fd
# Принудительно обновляем из репозитория
git fetch origin main
git reset --hard origin/main

echo "🛑 Останавливаю контейнеры..."
docker compose down

echo "🔨 Пересобираю образы (без кэша)..."
docker compose build --no-cache

echo "🚀 Запускаю контейнеры..."
docker compose up -d

echo "⏳ Жду 5 секунд..."
sleep 5

echo "📊 Статус контейнеров:"
docker compose ps

echo ""
echo "✅ Готово!"
echo "🌐 Откройте: https://app-kindplate.tw1.ru"
echo "📝 Логи Caddy: docker compose logs -f caddy"

