const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kindplate',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function checkData() {
    try {
        console.log('🔍 Проверяем данные в базе...\n');

        // Проверяем пользователей
        const usersResult = await pool.query('SELECT * FROM users');
        console.log(`👥 Пользователи (${usersResult.rows.length}):`);
        usersResult.rows.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - ${user.is_business ? 'Бизнес' : 'Клиент'}`);
        });

        // Проверяем товары
        const itemsResult = await pool.query('SELECT * FROM items');
        console.log(`\n📦 Товары (${itemsResult.rows.length}):`);
        itemsResult.rows.forEach(item => {
            console.log(`  - ${item.name} (${item.amount} шт.) - ${item.price_disc}₽ (${item.price_orig}₽)`);
        });

        // Проверяем бизнес-пользователей
        const businessUsersResult = await pool.query('SELECT * FROM users WHERE is_business = true');
        console.log(`\n🏢 Бизнес-пользователи (${businessUsersResult.rows.length}):`);
        businessUsersResult.rows.forEach(user => {
            console.log(`  - ${user.name} (${user.address})`);
        });

        if (businessUsersResult.rows.length === 0) {
            console.log('\n⚠️  Нет бизнес-пользователей! Создаем тестовые данные...');
            await createTestData();
        }

    } catch (error) {
        console.error('❌ Ошибка при проверке данных:', error);
    } finally {
        await pool.end();
    }
}

async function createTestData() {
    try {
        // Создаем бизнес-пользователя
        const businessUserResult = await pool.query(
            `INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            ['Кафе Вкусняшка', 'cafe@test.com', 'Невский проспект, 100', 59.9311, 30.3609, '$2b$10$example', true]
        );
        
        const businessId = businessUserResult.rows[0].id;
        console.log(`✅ Создан бизнес-пользователь с ID: ${businessId}`);

        // Создаем товары
        const items = [
            ['Пицца Маргарита', 'Классическая пицца с томатами и моцареллой', 5, 500, 200],
            ['Салат Цезарь', 'Свежий салат с курицей, сыром пармезан и соусом Цезарь', 3, 350, 150],
            ['Бургер с картофелем', 'Сочный бургер с говядиной и картофелем фри', 4, 450, 180]
        ];

        for (const [name, description, amount, price_orig, price_disc] of items) {
            await pool.query(
                `INSERT INTO items (name, description, amount, owner_id, price_orig, price_disc) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [name, description, amount, businessId, price_orig, price_disc]
            );
        }

        console.log('✅ Созданы тестовые товары');

        // Создаем клиента
        await pool.query(
            `INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['Тестовый Клиент', 'customer@test.com', 'Садовая улица, 50', 59.9267, 30.3175, '$2b$10$example', false]
        );

        console.log('✅ Создан тестовый клиент');
        console.log('\n🎉 Тестовые данные созданы! Теперь можете тестировать приложение.');

    } catch (error) {
        console.error('❌ Ошибка при создании тестовых данных:', error);
    }
}

checkData();

