require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kindplate',
    password: process.env.DB_PASSWORD || '12345678',
    port: process.env.DB_PORT || 5432,
});

async function testAPI() {
    try {
        console.log('🔍 Тестируем API...');
        
        // Проверяем структуру таблицы users
        const tableInfo = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Структура таблицы users:');
        tableInfo.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        // Проверяем структуру таблицы offers
        const offersInfo = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'offers' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Структура таблицы offers:');
        offersInfo.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        // Проверяем данные
        const usersResult = await pool.query('SELECT id, name, is_business FROM users WHERE is_business = true');
        console.log('\n👥 Бизнес-пользователи:');
        usersResult.rows.forEach(user => {
            console.log(`  - ID: ${user.id}, Name: ${user.name}`);
        });
        
        const offersResult = await pool.query('SELECT id, title, business_id FROM offers LIMIT 3');
        console.log('\n🎁 Предложения:');
        offersResult.rows.forEach(offer => {
            console.log(`  - ID: ${offer.id}, Title: ${offer.title}, Business ID: ${offer.business_id}`);
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

testAPI();



