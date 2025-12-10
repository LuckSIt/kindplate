const { Pool } = require('pg');
require('dotenv').config();

// Создаем пул для подключения к PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kindplate',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function addTestPlaces() {
    console.log('🗺️  Добавляем тестовые места на карту...\n');

    const businesses = [
        {
            name: 'Кофейня "Утро"',
            email: 'coffee@kindplate.ru',
            address: 'Санкт-Петербург, Невский пр., 78',
            coord_0: 59.9322,
            coord_1: 30.3489,
            rating: 4.8,
            offers: [
                { title: 'Капучино + Круассан', description: 'Ароматный капучино и свежий круассан', original_price: 380, discounted_price: 190, quantity: 15, start: '18:00:00', end: '21:00:00' },
                { title: 'Американо + Маффин', description: 'Классический американо и шоколадный маффин', original_price: 320, discounted_price: 160, quantity: 10, start: '17:00:00', end: '20:00:00' }
            ]
        },
        {
            name: 'Пекарня "Хлеб & Ко"',
            email: 'bakery@kindplate.ru',
            address: 'Санкт-Петербург, ул. Рубинштейна, 15',
            coord_0: 59.9286,
            coord_1: 30.3456,
            rating: 4.6,
            offers: [
                { title: 'Набор выпечки', description: 'Ассорти из 5 видов свежей выпечки', original_price: 450, discounted_price: 225, quantity: 8, start: '19:00:00', end: '22:00:00' },
                { title: 'Хлеб свежий', description: 'Свежеиспечённый хлеб дня', original_price: 180, discounted_price: 90, quantity: 20, start: '18:00:00', end: '21:00:00' }
            ]
        },
        {
            name: 'Суши "Токио"',
            email: 'sushi@kindplate.ru',
            address: 'Санкт-Петербург, Лиговский пр., 30',
            coord_0: 59.9198,
            coord_1: 30.3548,
            rating: 4.5,
            offers: [
                { title: 'Сет Филадельфия', description: '24 ролла с лососем и сливочным сыром', original_price: 1200, discounted_price: 600, quantity: 5, start: '20:00:00', end: '23:00:00' },
                { title: 'Мисо суп', description: 'Традиционный японский суп с тофу', original_price: 180, discounted_price: 90, quantity: 12, start: '19:00:00', end: '22:00:00' }
            ]
        },
        {
            name: 'Пиццерия "Манхэттен"',
            email: 'pizza@kindplate.ru',
            address: 'Санкт-Петербург, Садовая ул., 42',
            coord_0: 59.9256,
            coord_1: 30.3167,
            rating: 4.7,
            offers: [
                { title: 'Пицца Маргарита 40см', description: 'Классическая пицца с томатами и моцареллой', original_price: 800, discounted_price: 400, quantity: 6, start: '20:00:00', end: '23:00:00' },
                { title: 'Комбо пицца + напиток', description: 'Любая средняя пицца + кола', original_price: 650, discounted_price: 325, quantity: 10, start: '18:00:00', end: '22:00:00' }
            ]
        }
    ];

    const passwordHash = '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe'; // пароль: password

    try {
        for (const business of businesses) {
            // Проверяем, существует ли уже этот бизнес
            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [business.email]);
            
            let businessId;
            if (existingUser.rows.length > 0) {
                businessId = existingUser.rows[0].id;
                console.log(`📍 "${business.name}" уже существует (ID: ${businessId})`);
            } else {
                // Создаем бизнес
                const result = await pool.query(
                    `INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role, rating)
                     VALUES ($1, $2, $3, $4, $5, $6, true, 'business', $7)
                     RETURNING id`,
                    [business.name, business.email, business.address, business.coord_0, business.coord_1, passwordHash, business.rating]
                );
                businessId = result.rows[0].id;
                console.log(`✅ Создан "${business.name}" (ID: ${businessId})`);
            }

            // Добавляем предложения
            for (const offer of business.offers) {
                // Проверяем, существует ли уже это предложение
                const existingOffer = await pool.query(
                    'SELECT id FROM offers WHERE business_id = $1 AND title = $2',
                    [businessId, offer.title]
                );

                if (existingOffer.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
                        [businessId, offer.title, offer.description, offer.original_price, offer.discounted_price, offer.quantity, offer.start, offer.end]
                    );
                    console.log(`   + Добавлен оффер: "${offer.title}"`);
                } else {
                    console.log(`   - Оффер "${offer.title}" уже существует`);
                }
            }
        }

        // Показываем итог
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE is_business = true) as businesses,
                (SELECT COUNT(*) FROM offers WHERE is_active = true AND quantity_available > 0) as active_offers
        `);
        
        console.log('\n📊 Статистика:');
        console.log(`   Всего бизнесов: ${stats.rows[0].businesses}`);
        console.log(`   Активных предложений: ${stats.rows[0].active_offers}`);
        console.log('\n🎉 Готово! Теперь места должны отображаться на карте.');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

addTestPlaces();

