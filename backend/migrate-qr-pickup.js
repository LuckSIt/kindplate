require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Поддержка DATABASE_URL или отдельных параметров
let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
} else {
    pool = new Pool({
        user: process.env.DB_USER || 'kind',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'kindplate',
        password: process.env.DB_PASSWORD || 'plate',
        port: parseInt(process.env.DB_PORT || '5432'),
    });
}

async function runMigration() {
    try {
        console.log('🔄 Запуск миграции для QR-выдачи заказов...\n');
        
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_qr_pickup.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        
        console.log('✅ Миграция успешно выполнена!');
        console.log('📊 Добавлены поля в таблицу orders:');
        console.log('   - pickup_code (UUID) - код для QR-сканирования');
        console.log('   - pickup_verified_at (TIMESTAMP) - время подтверждения выдачи\n');
        console.log('📊 Создана таблица order_events для аудита:');
        console.log('   - order_id - ссылка на заказ');
        console.log('   - event_type - тип события');
        console.log('   - actor_id - кто выполнил действие');
        console.log('   - actor_type - тип актора (user, business, system, admin)');
        console.log('   - metadata - дополнительные данные (JSONB)');
        console.log('   - created_at - время события\n');
        console.log('🔍 Созданы индексы для оптимизации запросов\n');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error.message);
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

runMigration();

