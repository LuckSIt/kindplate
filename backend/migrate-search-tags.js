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
        console.log('🔄 Запуск миграции для расширенного поиска...\n');
        
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_search_tags.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        
        console.log('✅ Миграция успешно выполнена!');
        console.log('📊 Добавлены поля в таблицу offers:');
        console.log('   - cuisine_tags[] - теги кухни');
        console.log('   - diet_tags[] - теги диет');
        console.log('   - allergen_tags[] - теги аллергенов');
        console.log('   - rating_avg - средний рейтинг');
        console.log('   - rating_count - количество отзывов\n');
        console.log('📊 Добавлены поля в таблицу users (бизнесы):');
        console.log('   - cuisine_tags[] - теги кухни бизнеса\n');
        console.log('🔍 Созданы индексы GIN для быстрого поиска по тегам\n');
        console.log('⚡ Триггер для автоматического обновления рейтинга офферов\n');
        
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

