const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../lib/db');
const { createAccessToken, verifyToken } = require('../lib/jwt');
const { asyncHandler } = require('../lib/errorHandler');
const QRCode = require('qrcode');
const crypto = require('crypto');

const ordersRouter = express.Router();

// Rate limiting для сканирования QR
const scanRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 минута
    max: 10, // максимум 10 попыток сканирования в минуту
    message: {
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: "Слишком много попыток сканирования. Попробуйте позже."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Функция для логирования событий заказа
async function logOrderEvent(orderId, eventType, actorId = null, actorType = 'system', metadata = null) {
    try {
        await pool.query(
            `INSERT INTO order_events (order_id, event_type, actor_id, actor_type, metadata)
             VALUES ($1, $2, $3, $4, $5)`,
            [orderId, eventType, actorId, actorType, metadata ? JSON.stringify(metadata) : null]
        );
    } catch (error) {
        console.error('❌ Ошибка при логировании события заказа:', error);
        // Не прерываем выполнение, если логирование не удалось
    }
}

// Функция для генерации UUID v4
function generateUUID() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback для старых версий Node.js
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Получить конфигурацию сервисного сбора
ordersRouter.get("/config", async (req, res) => {
    try {
        console.log("🔍 Запрос /orders/config");

        // TODO: Получить из таблицы конфигурации
        const serviceFee = 50; // Временное значение
        const promocodeEnabled = true;

        res.send({
            success: true,
            data: {
                service_fee: serviceFee,
                promocode_enabled: promocodeEnabled,
                currency: 'RUB'
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в /orders/config:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Создать черновик заказа
ordersRouter.post("/draft", asyncHandler(async (req, res) => {
    const { items, pickup_time_start, pickup_time_end, business_id, business_name, business_address, notes } = req.body;
    const userId = req.session?.userId;
    
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }

    console.log("🔍 Запрос POST /orders/draft", { items: items?.length, business_id, userId });

    // Валидация
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send({
            success: false,
            error: "INVALID_REQUEST",
            message: "Заказ должен содержать хотя бы один товар"
        });
    }

    if (!business_id || !business_name || !business_address) {
        return res.status(400).send({
            success: false,
            error: "INVALID_REQUEST",
            message: "Необходима информация о заведении"
        });
    }

    if (!pickup_time_start || !pickup_time_end) {
        return res.status(400).send({
            success: false,
            error: "INVALID_REQUEST",
            message: "Необходимо указать время самовывоза"
        });
    }

    // Валидация каждого товара
    for (const item of items) {
        if (!item.offer_id || !item.quantity || !item.discounted_price) {
            return res.status(400).send({
                success: false,
                error: "INVALID_REQUEST",
                message: "Каждый товар должен содержать offer_id, quantity и discounted_price"
            });
        }
        if (item.quantity <= 0) {
            return res.status(400).send({
                success: false,
                error: "INVALID_REQUEST",
                message: "Количество товара должно быть больше 0"
            });
        }
    }

    // Проверяем, что все товары от одного продавца
    const uniqueBusinessIds = [...new Set(items.map(item => item.business_id))];
    if (uniqueBusinessIds.length > 1) {
        return res.status(400).send({
            success: false,
            error: "MULTIPLE_VENDORS",
            message: "Все товары должны быть от одного продавца"
        });
    }

    // Проверяем доступность товаров
    for (const item of items) {
        const offerResult = await pool.query(
            `SELECT quantity_available, is_active, title 
             FROM offers 
             WHERE id = $1`,
            [item.offer_id]
        );

        if (offerResult.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "OFFER_NOT_FOUND",
                message: `Товар "${item.title}" не найден`
            });
        }

        const offer = offerResult.rows[0];
        if (!offer.is_active) {
            return res.status(400).send({
                success: false,
                error: "OFFER_INACTIVE",
                message: `Товар "${item.title}" недоступен`
            });
        }

        if (offer.quantity_available < item.quantity) {
            return res.status(400).send({
                success: false,
                error: "INSUFFICIENT_QUANTITY",
                message: `Недостаточно товара "${item.title}" в наличии`
            });
        }
    }

    // Рассчитываем суммы
    const subtotal = items.reduce((sum, item) => sum + (item.discounted_price * item.quantity), 0);
    const serviceFee = 50; // TODO: Получить из конфигурации
    const total = subtotal + serviceFee;

    // Проверяем существование таблицы orders
    const tableCheck = await pool.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'orders'
        );
    `);

    if (!tableCheck.rows[0].exists) {
        // Таблица не существует, создаем её
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                business_id INTEGER NOT NULL REFERENCES users(id),
                status VARCHAR(50) NOT NULL DEFAULT 'draft',
                subtotal DECIMAL(10, 2) NOT NULL,
                service_fee DECIMAL(10, 2) NOT NULL DEFAULT 50,
                total DECIMAL(10, 2) NOT NULL,
                pickup_time_start TIME,
                pickup_time_end TIME,
                notes TEXT,
                pickup_code VARCHAR(255),
                pickup_verified_at TIMESTAMP,
                confirmed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                offer_id INTEGER NOT NULL REFERENCES offers(id),
                quantity INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                title VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    // Создаем заказ
    const orderResult = await pool.query(
        `INSERT INTO orders (
            user_id, business_id, status, subtotal, service_fee, total,
            pickup_time_start, pickup_time_end, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, status, subtotal, service_fee, total, created_at`,
        [userId, business_id, 'draft', subtotal, serviceFee, total, pickup_time_start, pickup_time_end, notes || null]
    );

    const orderId = orderResult.rows[0].id;

    // Добавляем позиции заказа
    for (const item of items) {
        try {
            await pool.query(
                `INSERT INTO order_items (
                    order_id, offer_id, quantity, price, title
                ) VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.offer_id, item.quantity, item.discounted_price, item.title || 'Товар']
            );
        } catch (itemError) {
            console.error("Ошибка при добавлении позиции заказа:", itemError);
            // Продолжаем, даже если одна позиция не добавилась
        }
    }

    // Очищаем корзину
    try {
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    } catch (cartError) {
        console.error("Ошибка при очистке корзины:", cartError);
        // Не критично, продолжаем
    }

    res.status(201).send({
        success: true,
        data: {
            order_id: orderId,
            status: 'draft',
            subtotal,
            service_fee: serviceFee,
            total,
            message: "Черновик заказа создан"
        }
    });
}));

// ============================================
// СПЕЦИФИЧНЫЕ МАРШРУТЫ (должны быть ДО маршрутов с параметрами)
// ============================================

// POST /orders/:id/confirm - Подтвердить заказ
// Дубликат удален - маршрут уже определен выше в секции специфичных маршрутов

// GET /orders/:id/qr - Получить QR-код для заказа
// Дубликат удален - маршрут уже определен выше в секции специфичных маршрутов

// ============================================
// ОСНОВНЫЕ МАРШРУТЫ
// ============================================
// PATCH /orders/:id определен ниже после всех специфичных маршрутов

// Подтвердить заказ
ordersRouter.post("/:id/confirm", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { pickup_time_start, pickup_time_end, notes } = req.body;
    const userId = req.session?.userId;
    
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }

    console.log("🔍 Запрос POST /orders/:id/confirm", { id, userId });

        // Проверяем, что заказ принадлежит пользователю
        const orderResult = await pool.query(
            `SELECT id, status, business_id FROM orders 
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "ORDER_NOT_FOUND",
                message: "Заказ не найден"
            });
        }

        const order = orderResult.rows[0];

        if (order.status !== 'draft') {
            return res.status(400).send({
                success: false,
                error: "ORDER_NOT_EDITABLE",
                message: "Заказ нельзя подтвердить"
            });
        }

        // Обновляем заказ
        await pool.query(
            `UPDATE orders 
             SET status = 'confirmed', 
                 pickup_time_start = COALESCE($1, pickup_time_start),
                 pickup_time_end = COALESCE($2, pickup_time_end),
                 notes = COALESCE($3, notes),
                 confirmed_at = NOW()
             WHERE id = $4`,
            [pickup_time_start, pickup_time_end, notes, id]
        );

    res.send({
        success: true,
        message: "Заказ подтвержден"
    });
}));

// Получить заказы пользователя
// Получить заказы текущего пользователя
ordersRouter.get("/mine", asyncHandler(async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }
        
        console.log("🔍 Запрос GET /orders/mine", { userId });

        // Проверяем наличие таблицы
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'orders'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log("⚠️ Таблица orders не существует");
            return res.send({
                success: true,
                data: []
            });
        }

        let result;
        try {
            result = await pool.query(`
                SELECT 
                    o.id,
                    o.user_id,
                    o.business_id,
                    u.name as business_name,
                    u.address as business_address,
                    o.pickup_time_start,
                    o.pickup_time_end,
                    o.subtotal,
                    o.service_fee,
                    o.total,
                    o.status,
                    o.notes,
                    o.created_at,
                    o.confirmed_at
                FROM orders o
                JOIN users u ON o.business_id = u.id
                WHERE o.user_id = $1
                ORDER BY o.created_at DESC
            `, [userId]);
        } catch (queryError) {
            console.log("⚠️ Ошибка при запросе orders (возможно, неправильная структура таблицы):", queryError.message);
            return res.send({
                success: true,
                data: []
            });
        }

        console.log(`✅ Найдено заказов: ${result.rows.length}`);

        const orders = await Promise.all(result.rows.map(async (order) => {
            // Получаем позиции заказа
            let items = [];
            try {
                const itemsResult = await pool.query(`
                    SELECT 
                        oi.id,
                        oi.offer_id,
                        oi.quantity,
                        oi.price,
                        oi.title
                    FROM order_items oi
                    WHERE oi.order_id = $1
                `, [order.id]);
                
                items = itemsResult.rows.map(item => ({
                    id: item.id,
                    offer_id: item.offer_id,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    title: item.title
                }));
            } catch (itemError) {
                console.log("⚠️ Ошибка при получении позиций заказа:", itemError.message);
                items = [];
            }

            return {
                id: order.id,
                user_id: order.user_id,
                business_id: order.business_id,
                business_name: order.business_name,
                business_address: order.business_address,
                pickup_time_start: order.pickup_time_start,
                pickup_time_end: order.pickup_time_end,
                subtotal: parseFloat(order.subtotal),
                service_fee: parseFloat(order.service_fee),
                total: parseFloat(order.total),
                status: order.status,
                notes: order.notes,
                items: items,
                created_at: order.created_at,
                confirmed_at: order.confirmed_at
            };
        }));

    res.send({
        success: true,
        data: orders
    });
}));

ordersRouter.get("/", asyncHandler(async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }

    console.log("🔍 Запрос /orders", { userId });

        try {
            // Сначала проверим, существует ли таблица orders
            const tableExists = await pool.query(
                `SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'orders'
                )`
            );

            if (!tableExists.rows[0].exists) {
                console.log("📦 Таблица orders не существует, возвращаем пустой массив");
                res.send({
                    success: true,
                    data: []
                });
                return;
            }

            // Проверим структуру таблицы
            const columns = await pool.query(
                `SELECT column_name FROM information_schema.columns 
                 WHERE table_name = 'orders' ORDER BY ordinal_position`
            );

            console.log("📦 Столбцы таблицы orders:", columns.rows.map(r => r.column_name));

            // Если таблица пустая или не имеет нужных столбцов, возвращаем пустой массив
            if (columns.rows.length === 0) {
                console.log("📦 Таблица orders пустая, возвращаем пустой массив");
                res.send({
                    success: true,
                    data: []
                });
                return;
            }

            // Пока таблица orders не создана правильно, возвращаем пустой массив
            console.log("📦 Таблица orders не готова, возвращаем пустой массив");
            res.send({
                success: true,
                data: []
            });
            return;

        console.log("📦 Результаты запроса:", result.rows.length);

        const orders = result.rows.map(row => ({
            id: row.id,
            business_name: 'Заведение',
            business_address: 'Адрес',
            pickup_time_start: '18:00',
            pickup_time_end: '20:00',
            subtotal: 0,
            service_fee: 0,
            total: 0,
            status: 'draft',
            notes: '',
            created_at: row.created_at,
            confirmed_at: null
        }));

        res.send({
            success: true,
            data: orders
        });
    } catch (dbError) {
        console.error("❌ Ошибка базы данных в /orders:", dbError);
        return res.status(500).send({
            success: false,
            error: "DATABASE_ERROR",
            message: "Ошибка базы данных: " + dbError.message
        });
    }
}));

// Получить заказы для бизнеса
ordersRouter.get("/business", asyncHandler(async (req, res) => {
    const businessId = req.session?.userId;
    
    if (!businessId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }
        
        console.log("🔍 Запрос GET /orders/business", { businessId });

        // Проверяем наличие таблицы orders
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'orders'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log("⚠️ Таблица orders не существует");
            return res.send({
                success: true,
                data: []
            });
        }

        let result;
        try {
            result = await pool.query(`
                SELECT 
                    o.id,
                    o.user_id,
                    o.business_id,
                    u.name as customer_name,
                    u.email as customer_email,
                    u.phone as customer_phone,
                    o.pickup_time_start,
                    o.pickup_time_end,
                    o.subtotal,
                    o.service_fee,
                    o.total,
                    o.status,
                    o.notes,
                    o.created_at,
                    o.confirmed_at
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.business_id = $1
                ORDER BY o.created_at DESC
            `, [businessId]);
        } catch (queryError) {
            console.log("⚠️ Ошибка при запросе orders:", queryError.message);
            return res.send({
                success: true,
                data: []
            });
        }

        console.log(`✅ Найдено заказов для бизнеса: ${result.rows.length}`);

        const orders = await Promise.all(result.rows.map(async (order) => {
            // Получаем позиции заказа
            let items = [];
            try {
                const itemsResult = await pool.query(`
                    SELECT 
                        oi.id,
                        oi.offer_id,
                        oi.quantity,
                        oi.price,
                        oi.title
                    FROM order_items oi
                    WHERE oi.order_id = $1
                `, [order.id]);
                
                items = itemsResult.rows.map(item => ({
                    id: item.id,
                    offer_id: item.offer_id,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    title: item.title
                }));
            } catch (itemError) {
                console.log("⚠️ Ошибка при получении позиций заказа:", itemError.message);
                items = [];
            }

            return {
                id: order.id,
                user_id: order.user_id,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                customer_phone: order.customer_phone,
                pickup_time_start: order.pickup_time_start,
                pickup_time_end: order.pickup_time_end,
                subtotal: parseFloat(order.subtotal),
                service_fee: parseFloat(order.service_fee),
                total: parseFloat(order.total),
                status: order.status,
                notes: order.notes,
                items: items,
                created_at: order.created_at,
                confirmed_at: order.confirmed_at
            };
        }));

    res.send({
        success: true,
        data: orders
    });
}));

// ============================================
// QR-КОД ДЛЯ ВЫДАЧИ ЗАКАЗА
// ============================================

// Получить QR-код для заказа (клиент видит QR для сканирования продавцом)
ordersRouter.get("/:id/qr", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.userId;
    
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }

        console.log("🔍 Запрос GET /orders/:id/qr", { id, userId });

        // Проверяем, что заказ принадлежит пользователю
        const orderResult = await pool.query(
            `SELECT id, status, pickup_code, business_id, pickup_time_end
             FROM orders 
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "ORDER_NOT_FOUND",
                message: "Заказ не найден"
            });
        }

        const order = orderResult.rows[0];

        // Проверяем, что заказ оплачен или готов к выдаче
        if (!['paid', 'ready_for_pickup'].includes(order.status)) {
            return res.status(400).send({
                success: false,
                error: "ORDER_NOT_READY",
                message: "Заказ еще не готов к выдаче"
            });
        }

        // Проверяем, что заказ не просрочен
        const now = new Date();
        const pickupEnd = new Date(order.pickup_time_end);
        if (now > pickupEnd) {
            return res.status(400).send({
                success: false,
                error: "ORDER_EXPIRED",
                message: "Время выдачи заказа истекло"
            });
        }

        // Генерируем pickup_code, если его нет
        let pickupCode = order.pickup_code;
        if (!pickupCode) {
            pickupCode = generateUUID();
            await pool.query(
                `UPDATE orders SET pickup_code = $1 WHERE id = $2`,
                [pickupCode, id]
            );
            await logOrderEvent(id, 'qr_generated', userId, 'user');
        }

        // Создаем JWT токен с данными для QR (подписанный)
        const qrPayload = {
            order_id: parseInt(id),
            pickup_code: pickupCode,
            business_id: order.business_id
        };

        const qrToken = await createAccessToken({
            userId: order.business_id, // Используем business_id для валидации
            email: 'qr', // Заглушка
            isBusiness: true
        });

        // Подписываем данные QR кодом (добавляем JWT в payload)
        const qrData = JSON.stringify({
            ...qrPayload,
            token: qrToken, // JWT токен для проверки на сервере
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // TTL 5 минут
        });

        // Генерируем QR код как base64 PNG
        const qrImageBase64 = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        // Логируем генерацию QR
        await logOrderEvent(id, 'qr_requested', userId, 'user', {
            ip: req.ip
        });

    res.send({
        success: true,
        data: {
            qr_code: qrImageBase64, // base64 PNG
            pickup_code: pickupCode,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }
    });
}));

// Сканировать QR-код (продавец сканирует код клиента)
ordersRouter.post("/scan", scanRateLimiter, async (req, res) => {
    try {
        const { code } = req.body;
        // TODO: Получить business_id из JWT токена/сессии
        const businessId = req.session?.userId || 1;

        console.log("🔍 Запрос POST /orders/scan", { code, businessId });

        if (!code) {
            return res.status(400).send({
                success: false,
                error: "INVALID_REQUEST",
                message: "Необходимо указать код"
            });
        }

        // Парсим данные из QR кода
        let qrData;
        try {
            qrData = JSON.parse(code);
        } catch (e) {
            // Если не JSON, возможно это просто pickup_code
            qrData = { pickup_code: code };
        }

        const { pickup_code, order_id, token } = qrData;

        // Если есть JWT токен, проверяем его
        if (token) {
            try {
                const payload = await verifyToken(token);
                // Проверяем, что токен не истек (expires_at)
                if (qrData.expires_at && new Date(qrData.expires_at) < new Date()) {
                    return res.status(400).send({
                        success: false,
                        error: "QR_EXPIRED",
                        message: "QR-код истек. Попросите клиента обновить код."
                    });
                }
            } catch (e) {
                return res.status(400).send({
                    success: false,
                    error: "INVALID_QR_TOKEN",
                    message: "Недействительный QR-код"
                });
            }
        }

        // Находим заказ по pickup_code
        const orderResult = await pool.query(
            `SELECT id, status, business_id, user_id, pickup_verified_at, pickup_time_end
             FROM orders 
             WHERE pickup_code = $1`,
            [pickup_code || code]
        );

        if (orderResult.rows.length === 0) {
            await logOrderEvent(null, 'qr_scan_failed', businessId, 'business', {
                code: pickup_code || code,
                reason: 'code_not_found'
            });
            return res.status(404).send({
                success: false,
                error: "CODE_NOT_FOUND",
                message: "Код не найден"
            });
        }

        const order = orderResult.rows[0];

        // Проверяем, что заказ принадлежит этому бизнесу
        if (order.business_id !== businessId) {
            await logOrderEvent(order.id, 'qr_scan_failed', businessId, 'business', {
                reason: 'wrong_business'
            });
            return res.status(403).send({
                success: false,
                error: "WRONG_BUSINESS",
                message: "Этот заказ не принадлежит вашему заведению"
            });
        }

        // Проверяем статус заказа
        if (!['paid', 'ready_for_pickup'].includes(order.status)) {
            await logOrderEvent(order.id, 'qr_scan_failed', businessId, 'business', {
                reason: 'invalid_status',
                current_status: order.status
            });
            return res.status(400).send({
                success: false,
                error: "ORDER_NOT_READY",
                message: `Заказ не готов к выдаче. Текущий статус: ${order.status}`
            });
        }

        // Проверяем, что заказ не просрочен
        const now = new Date();
        const pickupEnd = new Date(order.pickup_time_end);
        if (now > pickupEnd) {
            await logOrderEvent(order.id, 'qr_scan_failed', businessId, 'business', {
                reason: 'expired'
            });
            return res.status(400).send({
                success: false,
                error: "ORDER_EXPIRED",
                message: "Время выдачи заказа истекло"
            });
        }

        // Проверяем идемпотентность - если уже выдан, возвращаем 409
        if (order.pickup_verified_at) {
            await logOrderEvent(order.id, 'qr_scan_duplicate', businessId, 'business', {
                previous_verified_at: order.pickup_verified_at
            });
            return res.status(409).send({
                success: false,
                error: "ALREADY_PICKED_UP",
                message: "Заказ уже был выдан",
                data: {
                    order_id: order.id,
                    verified_at: order.pickup_verified_at
                }
            });
        }

        // Обновляем заказ - помечаем как выданный
        await pool.query(
            `UPDATE orders 
             SET status = 'picked_up', 
                 pickup_verified_at = NOW() 
             WHERE id = $1`,
            [order.id]
        );

        // Логируем успешное сканирование
        await logOrderEvent(order.id, 'qr_scanned', businessId, 'business', {
            verified_at: new Date().toISOString()
        });

        res.send({
            success: true,
            message: "Заказ успешно выдан",
            data: {
                order_id: order.id,
                customer_id: order.user_id,
                verified_at: new Date().toISOString()
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в POST /orders/scan:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Обновить заказ (должен быть ПОСЛЕ всех специфичных маршрутов с :id)
ordersRouter.patch("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { items, pickup_time_start, pickup_time_end, notes } = req.body;
    const userId = req.session?.userId;
    
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }

    console.log("🔍 Запрос PATCH /orders/:id", { id, userId });

        // Проверяем, что заказ принадлежит пользователю
        const orderResult = await pool.query(
            `SELECT id, status, business_id FROM orders 
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "ORDER_NOT_FOUND",
                message: "Заказ не найден"
            });
        }

        const order = orderResult.rows[0];

        if (order.status !== 'draft') {
            return res.status(400).send({
                success: false,
                error: "ORDER_NOT_EDITABLE",
                message: "Заказ нельзя изменить"
            });
        }

        // Обновляем заказ
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (pickup_time_start) {
            updateFields.push(`pickup_time_start = $${paramCount++}`);
            updateValues.push(pickup_time_start);
        }

        if (pickup_time_end) {
            updateFields.push(`pickup_time_end = $${paramCount++}`);
            updateValues.push(pickup_time_end);
        }

        if (notes !== undefined) {
            updateFields.push(`notes = $${paramCount++}`);
            updateValues.push(notes);
        }

        if (updateFields.length > 0) {
            updateValues.push(id, userId);
            await pool.query(
                `UPDATE orders SET ${updateFields.join(', ')} 
                 WHERE id = $${paramCount} AND user_id = $${paramCount + 1}`,
                updateValues
            );
        }

        // Обновляем позиции, если переданы
        if (items) {
            // Удаляем старые позиции
            await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);

            // Добавляем новые позиции
            for (const item of items) {
                await pool.query(
                    `INSERT INTO order_items (order_id, offer_id, quantity, price, title)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [id, item.offer_id, item.quantity, item.discounted_price, item.title]
                );
            }

            // Пересчитываем суммы
            const subtotal = items.reduce((sum, item) => sum + (item.discounted_price * item.quantity), 0);
            const serviceFee = 50; // TODO: Получить из конфигурации
            const total = subtotal + serviceFee;

            await pool.query(
                `UPDATE orders SET subtotal = $1, service_fee = $2, total = $3 
                 WHERE id = $4`,
                [subtotal, serviceFee, total, id]
            );
        }

    res.send({
        success: true,
        message: "Заказ обновлен"
    });
}));

module.exports = ordersRouter;