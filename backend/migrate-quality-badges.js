const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
        `postgresql://${process.env.DB_USER || 'kind'}:${process.env.DB_PASSWORD || 'kind'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'kindplate'}`
});

async function migrate() {
    try {
        console.log('📦 Запуск миграции quality_badges...');
        
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_quality_badges.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        
        console.log('✅ Миграция quality_badges завершена успешно!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка миграции:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();

