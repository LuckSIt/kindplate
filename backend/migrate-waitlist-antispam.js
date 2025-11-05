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
        console.log('🔄 Запуск миграции для антиспам защиты waitlist уведомлений...\n');
        
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_waitlist_antispam.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        
        console.log('✅ Миграция успешно выполнена!');
        console.log('📊 Создана таблица waitlist_notifications_log:');
        console.log('   - offer_id - ссылка на оффер');
        console.log('   - user_id - пользователь');
        console.log('   - notification_type - тип уведомления');
        console.log('   - sent_at - время отправки\n');
        console.log('🔒 Антиспам защита: не чаще 1 уведомления на оффер в N часов\n');
        console.log('💡 Настройте WAITLIST_ANTISPAM_HOURS в .env (по умолчанию 24 часа)\n');
        
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

