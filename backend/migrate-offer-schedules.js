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
        console.log('🔄 Запуск миграции для расписания публикации офферов...\n');
        
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_offer_schedules.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        
        console.log('✅ Миграция успешно выполнена!');
        console.log('📊 Создана таблица offer_schedules:');
        console.log('   - offer_id - ссылка на оффер');
        console.log('   - business_id - владелец расписания');
        console.log('   - publish_at - время публикации');
        console.log('   - unpublish_at - время окончания (опционально)');
        console.log('   - qty_planned - запланированное количество\n');
        console.log('📊 Создана таблица waitlist_subscriptions:');
        console.log('   - user_id - пользователь');
        console.log('   - scope_type - тип подписки (offer, category, area, business)');
        console.log('   - scope_id - ID объекта подписки');
        console.log('   - area_geojson - гео-зона для подписки');
        console.log('   - latitude, longitude, radius_km - для подписки по геолокации\n');
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

