const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:12345678@localhost:5432/kindplate',
});

async function runMigration() {
    try {
        console.log('🔄 Запуск миграции для системы бейджа качества...');
        
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_quality_badge_fields.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        
        console.log('✅ Миграция успешно выполнена!');
        console.log('📊 Добавлены поля:');
        console.log('   - is_top (флаг "Лучшие у нас")');
        console.log('   - quality_score (балл качества 0-100)');
        console.log('   - total_orders (общее количество заказов)');
        console.log('   - completed_orders (завершенные заказы)');
        console.log('   - repeat_customers (повторные клиенты)');
        console.log('   - avg_rating (средняя оценка)');
        console.log('   - quality_updated_at (время обновления)');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error);
        process.exit(1);
    }
}

runMigration();

