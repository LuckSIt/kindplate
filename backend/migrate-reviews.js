require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kindplate',
    password: process.env.DB_PASSWORD || '12345678',
    port: process.env.DB_PORT || 5432,
});

async function runMigration() {
    try {
        console.log('🔄 Запуск миграции для системы отзывов...\n');
        
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_reviews_table.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        
        console.log('✅ Миграция успешно выполнена!');
        console.log('📊 Создана таблица reviews с полями:');
        console.log('   - user_id (автор отзыва)');
        console.log('   - business_id (заведение)');
        console.log('   - order_id (заказ, опционально)');
        console.log('   - rating (оценка 1-5)');
        console.log('   - comment (текст отзыва)');
        console.log('   - created_at, updated_at\n');
        console.log('🔧 Созданы триггеры:');
        console.log('   - Автоматическое обновление updated_at');
        console.log('   - Автоматический пересчет рейтинга заведения\n');
        console.log('📝 Добавлены тестовые отзывы (если есть пользователи)\n');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error.message);
        await pool.end();
        process.exit(1);
    }
}

runMigration();




