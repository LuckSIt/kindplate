require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Подключаемся к PostgreSQL без указания базы данных для её пересоздания
const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Подключаемся к системной базе данных
    password: process.env.DB_PASSWORD || '12345678',
    port: process.env.DB_PORT || 5432,
});

async function recreateDatabase() {
    let client;
    try {
        console.log('🚀 Начинаем пересоздание базы данных PostgreSQL...\n');

        // Получаем клиент для выполнения команд
        client = await adminPool.connect();

        // Удаляем базу данных если она существует
        console.log('🗑️  Удаляем существующую базу данных...');
        await client.query('DROP DATABASE IF EXISTS kindplate');
        console.log('✅ База данных удалена');

        // Создаем базу данных заново
        console.log('📄 Создаем новую базу данных...');
        await client.query('CREATE DATABASE kindplate');
        console.log('✅ База данных создана');

        // Освобождаем клиент
        await client.release();

        // Подключаемся к новой базе данных
        console.log('🔌 Подключаемся к новой базе данных...');
        const pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: 'kindplate',
            password: process.env.DB_PASSWORD || 'password',
            port: process.env.DB_PORT || 5432,
        });

        client = await pool.connect();

        // Выполняем init.sql
        console.log('📋 Создаем таблицы...');
        const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        await client.query(initSql);
        console.log('✅ Таблицы созданы');

        // Вставляем тестовые данные
        console.log('\n👥 Добавляем тестовые данные...');

        // Хешируем пароль
        const passwordHash = await bcrypt.hash('123456', 10);

        // Создаем бизнес-пользователя
        const businessResult = await client.query(
            `INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            ['Кафе Вкусняшка', 'cafe@test.com', 'Невский проспект, 100', 59.9311, 30.3609, passwordHash, true]
        );
        
        const businessId = businessResult.rows[0].id;
        console.log(`✅ Создан бизнес-пользователь "Кафе Вкусняшка" с ID: ${businessId}`);

        // Создаем товары (старый функционал)
        const items = [
            ['Пицца Маргарита', 'Классическая пицца с томатами и моцареллой. Свежая и вкусная!', 5, 500, 200],
            ['Салат Цезарь', 'Свежий салат с курицей, сыром пармезан и соусом Цезарь', 3, 350, 150],
            ['Бургер с картофелем', 'Сочный бургер с говядиной и картофелем фри', 4, 450, 180]
        ];

        for (const [name, description, amount, price_orig, price_disc] of items) {
            await client.query(
                `INSERT INTO items (name, description, amount, owner_id, price_orig, price_disc) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [name, description, amount, businessId, price_orig, price_disc]
            );
        }

        console.log('✅ Созданы тестовые товары (items)');

        // Создаем offers (новый функционал)
        const offers = [
            ['Пицца Маргарита со скидкой', 'Классическая пицца с томатами и моцареллой. Свежая и вкусная! Забирайте вечером со скидкой.', null, 500, 200, 5, '18:00', '20:00'],
            ['Салат Цезарь', 'Свежий салат с курицей, сыром пармезан и соусом Цезарь. Идеально для обеда!', null, 350, 150, 3, '19:00', '21:00'],
            ['Бургер с картофелем', 'Сочный бургер с говядиной и картофелем фри. Горячий и вкусный!', null, 450, 180, 4, '18:30', '20:30']
        ];

        for (const [title, description, image_url, original_price, discounted_price, quantity, start_time, end_time] of offers) {
            await client.query(
                `INSERT INTO offers (business_id, title, description, image_url, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [businessId, title, description, image_url, original_price, discounted_price, quantity, start_time, end_time, true]
            );
        }

        console.log('✅ Созданы тестовые предложения (offers)');

        // Создаем клиента
        const customerResult = await client.query(
            `INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            ['Тестовый Клиент', 'customer@test.com', 'Садовая улица, 50', 59.9267, 30.3175, passwordHash, false]
        );

        const customerId = customerResult.rows[0].id;
        console.log('✅ Создан тестовый клиент');

        // Проверяем созданные данные
        console.log('\n🔍 Проверяем созданные данные...');
        
        const usersResult = await client.query('SELECT * FROM users');
        console.log(`👥 Пользователи (${usersResult.rows.length}):`);
        usersResult.rows.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - ${user.is_business ? 'Бизнес' : 'Клиент'}`);
        });

        const itemsResult = await client.query('SELECT * FROM items');
        console.log(`\n📦 Товары - items (${itemsResult.rows.length}):`);
        itemsResult.rows.forEach(item => {
            console.log(`  - ${item.name} (${item.amount} шт.) - ${item.price_disc}₽ (${item.price_orig}₽)`);
        });

        const offersResult = await client.query('SELECT * FROM offers');
        console.log(`\n🎁 Предложения - offers (${offersResult.rows.length}):`);
        offersResult.rows.forEach(offer => {
            console.log(`  - ${offer.title} (${offer.quantity_available} шт.) - ${offer.discounted_price}₽ (${offer.original_price}₽)`);
        });

        console.log('\n🎉 База данных успешно пересоздана!');
        console.log('\n📝 Данные для входа:');
        console.log('  Бизнес: cafe@test.com / 123456');
        console.log('  Клиент: customer@test.com / 123456');
        console.log('\n🚀 Теперь можете запустить backend сервер и использовать настоящее API!');
        console.log('💡 В backend/src/index.js замените:');
        console.log('   const customerRouter = require("./routes/customer-simple");');
        console.log('   на:');
        console.log('   const customerRouter = require("./routes/customer");');

    } catch (error) {
        console.error('❌ Ошибка при пересоздании базы данных:', error.message);
        
        if (error.code === '28P01') {
            console.log('\n💡 Возможные решения:');
            console.log('1. Проверьте пароль PostgreSQL в файле .env');
            console.log('2. Убедитесь, что PostgreSQL запущен');
            console.log('3. Проверьте настройки подключения к базе данных');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 PostgreSQL не запущен или недоступен');
            console.log('Запустите PostgreSQL сервис и попробуйте снова');
        }
    } finally {
        if (client) {
            await client.release();
        }
        await adminPool.end();
    }
}

// Запускаем пересоздание
recreateDatabase();