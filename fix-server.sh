#!/bin/bash
echo "🔍 Диагностика сервера KindPlate..."

cd /root/kindplate || exit 1

echo ""
echo "1️⃣ Проверка статуса контейнеров:"
docker ps -a

echo ""
echo "2️⃣ Проверка логов frontend:"
docker compose logs --tail=20 frontend

echo ""
echo "3️⃣ Проверка логов backend:"
docker compose logs --tail=20 backend

echo ""
echo "4️⃣ Проверка открытых портов:"
netstat -tulpn | grep -E ':(80|5000)'

echo ""
echo "5️⃣ Проверка файрвола:"
ufw status || iptables -L -n | grep -E '(80|5000)' || echo "Файрвол не настроен"

echo ""
echo "6️⃣ Обновление проекта и перезапуск:"
git pull
docker compose down
docker compose up -d --build

echo ""
echo "✅ Перезапуск выполнен. Ждите 30 секунд и проверьте:"
echo "   - http://45.132.50.45"
echo "   - http://45.132.50.45:5000"

