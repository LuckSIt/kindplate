const { Pool, Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || '12345678',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres' // Подключаемся к системной БД для создания kindplate
};

async function setupDatabase() {
    console.log('🔍 Проверка подключения к PostgreSQL...\n');
    
    const adminClient = new Client(config);
    
    try {
        await adminClient.connect();
        console.log('✅ Подключение к PostgreSQL успешно\n');
        
        // Проверяем существование БД
        const dbCheck = await adminClient.query(
            "SELECT 1 FROM pg_database WHERE datname = 'kindplate'"
        );
        
        if (dbCheck.rows.length === 0) {
            console.log('📊 Создание базы данных kindplate...');
            await adminClient.query('CREATE DATABASE kindplate');
            console.log('✅ База данных создана\n');
        } else {
            console.log('✅ База данных kindplate уже существует\n');
        }
        
        await adminClient.end();
        
        // Теперь подключаемся к kindplate для инициализации
        console.log('🔄 Инициализация базы данных...\n');
        const kindplateConfig = { ...config, database: 'kindplate' };
        const kindplateClient = new Client(kindplateConfig);
        
        await kindplateClient.connect();
        
        // Выполняем init.sql
        const fs = require('fs');
        const path = require('path');
        const initSQL = fs.readFileSync(
            path.join(__dirname, 'backend', 'init.sql'), 
            'utf8'
        );
        
        console.log('📋 Выполнение init.sql...');
        await kindplateClient.query(initSQL);
        console.log('✅ Схема базы данных создана\n');
        
        await kindplateClient.end();
        
        // Запускаем миграции
        console.log('🔄 Запуск миграций...\n');
        const { execSync } = require('child_process');
        const migrations = [
            'migrate-roles.js',
            'migrate-quality-badge.js',
            'migrate-reviews.js'
        ];
        
        for (const migration of migrations) {
            try {
                console.log(`Выполнение ${migration}...`);
                execSync(`node ${migration}`, {
                    cwd: path.join(__dirname, 'backend'),
                    stdio: 'inherit'
                });
                console.log(`✅ ${migration} выполнен\n`);
            } catch (error) {
                console.log(`⚠️  Ошибка в ${migration}: ${error.message}\n`);
            }
        }
        
        console.log('✅ База данных настроена!\n');
        console.log('🔐 Учетные данные администратора:');
        console.log('   Email: admin@kindplate.ru');
        console.log('   Пароль: admin123\n');
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.error('❌ Не удалось подключиться к PostgreSQL');
            console.error('\n📥 Установите PostgreSQL:');
            console.error('   1. Через winget: winget install --id PostgreSQL.PostgreSQL.16');
            console.error('   2. Или скачайте с https://www.postgresql.org/download/windows/');
            console.error('\n⚠️  Убедитесь, что:');
            console.error('   - PostgreSQL установлен и запущен');
            console.error('   - Пароль в backend/.env соответствует паролю PostgreSQL');
            console.error('   - Порт 5432 не занят другим приложением\n');
        } else if (error.code === '28P01') {
            console.error('❌ Неверный пароль PostgreSQL');
            console.error('   Проверьте DB_PASSWORD в backend/.env\n');
        } else {
            console.error('❌ Ошибка:', error.message);
            console.error(error);
        }
        process.exit(1);
    }
}

setupDatabase();


