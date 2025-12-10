# Скрипт автоматической настройки KindPlate
Write-Host "Настройка проекта KindPlate..." -ForegroundColor Cyan
Write-Host ""

# Проверка Node.js
Write-Host "Проверка Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "OK: Node.js установлен: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "ОШИБКА: Node.js не найден" -ForegroundColor Red
    exit 1
}

# Проверка PostgreSQL
Write-Host ""
Write-Host "Проверка PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $pgService -and -not $psqlPath) {
    Write-Host "ОШИБКА: PostgreSQL не найден" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите PostgreSQL:" -ForegroundColor Yellow
    Write-Host "  winget install --id PostgreSQL.PostgreSQL.16" -ForegroundColor Gray
    Write-Host "  или скачайте с https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    exit 1
}

Write-Host "OK: PostgreSQL найден" -ForegroundColor Green

# Проверка подключения и создание БД
Write-Host "Проверка подключения..." -ForegroundColor Yellow
$env:PGPASSWORD = "12345678"

# Создание базы данных
Write-Host "Создание базы данных..." -ForegroundColor Yellow
$dbCheck = psql -U postgres -h localhost -lqt 2>&1 | Select-String -Pattern "kindplate"
if (-not $dbCheck) {
    psql -U postgres -h localhost -c "CREATE DATABASE kindplate;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: База данных создана" -ForegroundColor Green
    }
} else {
    Write-Host "OK: База данных уже существует" -ForegroundColor Green
}

# Инициализация БД
Write-Host ""
Write-Host "Инициализация базы данных..." -ForegroundColor Yellow
Push-Location backend
node recreate-kindplate-db.js
Pop-Location

# Проверка .env файлов
Write-Host ""
Write-Host "Проверка конфигурационных файлов..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\env-example.txt" "backend\.env"
    Write-Host "OK: Создан backend/.env" -ForegroundColor Green
} else {
    Write-Host "OK: backend/.env существует" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\env.example" "frontend\.env"
    Write-Host "OK: Создан frontend/.env" -ForegroundColor Green
} else {
    Write-Host "OK: frontend/.env существует" -ForegroundColor Green
}

Write-Host ""
Write-Host "Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "Для запуска:" -ForegroundColor Cyan
Write-Host "  Терминал 1: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "  Терминал 2: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Админ: admin@kindplate.ru / admin123" -ForegroundColor Cyan
