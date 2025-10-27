const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:12345678@localhost:5432/kindplate',
});

async function migrate() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Начинаем миграцию системы ролей...\n');
        
        // Читаем SQL файл
        const sqlPath = path.join(__dirname, 'add_roles.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Генерируем реальный хэш для admin123
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        // Заменяем placeholder на реальный хэш
        sql = sql.replace(
            '$2b$10$8ZqJZ5Z5Z5Z5Z5Z5Z5Z5ZuKjX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5a',
            adminPassword
        );
        
        // Выполняем миграцию
        await client.query(sql);
        
        console.log('\n✅ Миграция успешно выполнена!');
        console.log('\n🔐 Данные для входа администратора:');
        console.log('   Email:    admin@kindplate.ru');
        console.log('   Пароль:   admin123');
        console.log('\n⚠️  ВАЖНО: Смените пароль после первого входа!\n');
        
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(error => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
});

