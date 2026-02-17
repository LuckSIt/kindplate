const express = require('express');
const bcrypt = require('bcrypt');
const { requireAdmin } = require('../lib/guards');
const { asyncHandler } = require('../lib/errorHandler');
const { AppError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const logger = require('../lib/logger');
const { z } = require('zod');

const adminRouter = express.Router();

// Схема валидации для регистрации бизнеса
const businessRegisterSchema = z.object({
    email: z.string().email('Неверный формат email'),
    name: z.string().min(3, 'Название должно быть не короче 3 символов').max(100),
    password: z.string().min(6, 'Пароль должен быть не короче 6 символов').max(50),
    address: z.string().min(10, 'Адрес слишком короткий').max(200),
    coord_0: z.number().min(-90).max(90).optional(),
    coord_1: z.number().min(-180).max(180).optional(),
});

// Регистрация нового бизнеса (только для админа)
adminRouter.post('/register-business', requireAdmin, asyncHandler(async (req, res) => {
    // Валидация входных данных
    const validation = businessRegisterSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.errors[0].message, 400);
    }

    const { email, name, password, address, coord_0, coord_1 } = validation.data;

    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new AppError('Пользователь с таким email уже существует', 400);
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Используем координаты СПб по умолчанию, если не переданы
    // Валидация координат - проверяем, что они не NaN
    let latitude = coord_0;
    let longitude = coord_1;
    
    if (latitude === undefined || latitude === null || isNaN(parseFloat(latitude))) {
        latitude = 59.9311; // СПб по умолчанию
    } else {
        latitude = parseFloat(latitude);
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            latitude = 59.9311;
        }
    }
    
    if (longitude === undefined || longitude === null || isNaN(parseFloat(longitude))) {
        longitude = 30.3609; // СПб по умолчанию
    } else {
        longitude = parseFloat(longitude);
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            longitude = 30.3609;
        }
    }

    // Создаем бизнес-аккаунт
    const result = await pool.query(
        `INSERT INTO users 
        (email, password_hash, name, address, coord_0, coord_1, is_business, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id, email, name, address, is_business, role, created_at`,
        [email, passwordHash, name, address, latitude, longitude, true, 'business']
    );

    const newBusiness = result.rows[0];

    res.status(201).json({
        success: true,
        message: 'Бизнес-аккаунт успешно создан',
        business: {
            id: newBusiness.id,
            email: newBusiness.email,
            name: newBusiness.name,
            address: newBusiness.address,
            is_business: newBusiness.is_business,
            role: newBusiness.role,
            created_at: newBusiness.created_at
        }
    });
}));

// Получить список всех бизнесов (только для админа)
adminRouter.get('/businesses', requireAdmin, asyncHandler(async (req, res) => {
    try {
        // Проверяем наличие колонок is_top и quality_score
        const columnCheck = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' 
            AND column_name IN ('is_top', 'quality_score')
        `);
        const availableColumns = columnCheck.rows.map(r => r.column_name);
        const hasIsTop = availableColumns.includes('is_top');
        const hasQualityScore = availableColumns.includes('quality_score');

        const result = await pool.query(
            `SELECT 
                id, email, name, address, coord_0, coord_1, 
                is_business, role, created_at, 
                ${hasIsTop ? 'COALESCE(is_top, false) as is_top' : 'false as is_top'}, 
                ${hasQualityScore ? 'COALESCE(quality_score, 0) as quality_score' : '0 as quality_score'}
            FROM users 
            WHERE is_business = true 
            ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            businesses: result.rows
        });
    } catch (error) {
        logger.error("Error in /admin/businesses:", { 
            error: error.message, 
            stack: error.stack 
        });
        throw error;
    }
}));

// Отчёт по переводам: выручка по каждому бизнесу за периоды сб/вс/пн (к переводу в пн) и вт/ср/чт/пт (к переводу в пт)
adminRouter.get('/transfer-report', requireAdmin, asyncHandler(async (req, res) => {
    const columnsRes = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders'
    `);
    const orderCols = columnsRes.rows.map(r => r.column_name);
    const hasModernSchema = orderCols.includes('total') && orderCols.includes('subtotal');
    const totalField = hasModernSchema ? 'total' : (orderCols.includes('total_price') ? 'total_price' : null);
    if (!totalField) {
        throw new AppError('Неизвестная схема orders', 500);
    }
    const notCancelled = "status NOT IN ('draft', 'cancelled')";
    const mondayCond = `(created_at::date >= (CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::integer - 1 + 7) % 7) - 2)
        AND created_at::date <= (CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::integer - 1 + 7) % 7)))`;
    const fridayCond = `(created_at::date >= (CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::integer - 5 + 7) % 7) - 4)
        AND created_at::date <= (CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::integer - 5 + 7) % 7)))`;

    const report = await pool.query(
        `WITH rev AS (
            SELECT business_id,
                COALESCE(SUM(CASE WHEN ${mondayCond} THEN ${totalField} ELSE 0 END), 0) AS monday_transfer_revenue,
                COALESCE(SUM(CASE WHEN ${fridayCond} THEN ${totalField} ELSE 0 END), 0) AS friday_transfer_revenue
            FROM orders
            WHERE ${notCancelled}
            GROUP BY business_id
        )
        SELECT u.id, u.name, u.email,
               COALESCE(rev.monday_transfer_revenue, 0)::float AS monday_transfer_revenue,
               COALESCE(rev.friday_transfer_revenue, 0)::float AS friday_transfer_revenue
        FROM users u
        LEFT JOIN rev ON rev.business_id = u.id
        WHERE u.is_business = true
        ORDER BY u.name`,
        []
    );

    res.json({
        success: true,
        report: report.rows,
    });
}));

// Получить статистику по платформе (только для админа)
adminRouter.get('/stats', requireAdmin, asyncHandler(async (req, res) => {
    // Количество пользователей
    const usersCount = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE is_business = false AND role = $1',
        ['customer']
    );

    // Количество бизнесов
    const businessCount = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE is_business = true'
    );

    // Количество офферов
    const offersCount = await pool.query(
        'SELECT COUNT(*) as count FROM offers'
    );

    // Количество заказов
    let ordersCount = { rows: [{ count: 0 }] };
    try {
        ordersCount = await pool.query('SELECT COUNT(*) as count FROM orders');
    } catch (e) {
        // Таблица orders может не существовать
    }

    res.json({
        success: true,
        stats: {
            users: parseInt(usersCount.rows[0].count),
            businesses: parseInt(businessCount.rows[0].count),
            offers: parseInt(offersCount.rows[0].count),
            orders: parseInt(ordersCount.rows[0].count)
        }
    });
}));

// Удалить бизнес (только для админа).
// Сначала удаляем все связанные записи (из-за FK без ON DELETE CASCADE), затем users.
// Для опциональных таблиц сначала проверяем существование (через information_schema),
// иначе при отсутствии таблицы запрос падает и транзакция переходит в aborted.
const runDeleteIfTableExists = async (client, tableName, sql, params) => {
    const r = await client.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
        [tableName]
    );
    if (r.rows.length > 0) {
        await client.query(sql, params);
    }
};

adminRouter.delete('/businesses/:id', requireAdmin, asyncHandler(async (req, res) => {
    const businessId = parseInt(req.params.id);

    if (isNaN(businessId)) {
        throw new AppError('Неверный ID бизнеса', 400);
    }

    // Проверяем, существует ли бизнес
    const business = await pool.query(
        'SELECT id, is_business FROM users WHERE id = $1',
        [businessId]
    );

    if (business.rows.length === 0) {
        throw new AppError('Бизнес не найден', 404);
    }

    if (!business.rows[0].is_business) {
        throw new AppError('Это не бизнес-аккаунт', 400);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Платежи по заказам этого бизнеса
        await runDeleteIfTableExists(client, 'payments',
            'DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE business_id = $1)',
            [businessId]);

        // 2. Позиции заказов (order_items)
        await runDeleteIfTableExists(client, 'order_items',
            'DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE business_id = $1)',
            [businessId]);

        // 3. Заказы
        await client.query('DELETE FROM orders WHERE business_id = $1', [businessId]);

        // 4. Расписания офферов
        await runDeleteIfTableExists(client, 'offer_schedules',
            'DELETE FROM offer_schedules WHERE business_id = $1',
            [businessId]);

        // 5. Элементы корзины по офферам этого бизнеса
        await runDeleteIfTableExists(client, 'cart_items',
            'DELETE FROM cart_items WHERE offer_id IN (SELECT id FROM offers WHERE business_id = $1)',
            [businessId]);

        // 6. Офферы
        await client.query('DELETE FROM offers WHERE business_id = $1', [businessId]);

        // 7. Отзывы
        await client.query('DELETE FROM reviews WHERE business_id = $1', [businessId]);

        // 8. Избранное (где бизнес — объект избранного)
        await client.query('DELETE FROM favorites WHERE business_id = $1', [businessId]);

        // 9. Товары (items), если owner_id = бизнес (таблица может отсутствовать)
        await runDeleteIfTableExists(client, 'items',
            'DELETE FROM items WHERE owner_id = $1',
            [businessId]);

        // 10. Локации бизнеса
        await runDeleteIfTableExists(client, 'business_locations',
            'DELETE FROM business_locations WHERE business_id = $1',
            [businessId]);

        // 11. Настройки уведомлений пользователя-бизнеса
        await runDeleteIfTableExists(client, 'notification_settings',
            'DELETE FROM notification_settings WHERE user_id = $1',
            [businessId]);

        // 12. Записи уведомлений
        await runDeleteIfTableExists(client, 'notifications',
            'DELETE FROM notifications WHERE user_id = $1',
            [businessId]);

        // 13. Пользователь (бизнес)
        await client.query('DELETE FROM users WHERE id = $1', [businessId]);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    res.json({
        success: true,
        message: 'Бизнес успешно удален'
    });
}));

// Seed test places for development (no auth required in dev mode)
adminRouter.post('/seed-test-places', asyncHandler(async (req, res) => {
    // Только в dev режиме
    if (process.env.NODE_ENV !== 'development') {
        throw new AppError('Этот endpoint доступен только в режиме разработки', 403);
    }

    const passwordHash = '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe'; // пароль: password

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

    const results = [];

    for (const business of businesses) {
        try {
            // Проверяем, существует ли уже этот бизнес
            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [business.email]);
            
            let businessId;
            if (existingUser.rows.length > 0) {
                businessId = existingUser.rows[0].id;
                results.push({ name: business.name, status: 'exists', id: businessId });
            } else {
                // Создаем бизнес
                const result = await pool.query(
                    `INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role, rating)
                     VALUES ($1, $2, $3, $4, $5, $6, true, 'business', $7)
                     RETURNING id`,
                    [business.name, business.email, business.address, business.coord_0, business.coord_1, passwordHash, business.rating]
                );
                businessId = result.rows[0].id;
                results.push({ name: business.name, status: 'created', id: businessId });
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
                }
            }
        } catch (error) {
            results.push({ name: business.name, status: 'error', error: error.message });
        }
    }

    // Получаем статистику
    const stats = await pool.query(`
        SELECT 
            (SELECT COUNT(*) FROM users WHERE is_business = true) as businesses,
            (SELECT COUNT(*) FROM offers WHERE is_active = true AND quantity_available > 0) as active_offers
    `);

    res.json({
        success: true,
        message: 'Тестовые места добавлены',
        results,
        stats: {
            total_businesses: parseInt(stats.rows[0].businesses),
            active_offers: parseInt(stats.rows[0].active_offers)
        }
    });
}));

module.exports = adminRouter;

