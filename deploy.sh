#!/bin/bash
cd /root/kindplate
git pull
docker compose down
docker compose up -d --build
echo "✅ Готово! Проверьте http://45.132.50.45"

