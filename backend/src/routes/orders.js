const express = require('express');
const pool = require('../lib/db');

const ordersRouter = express.Router();

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
ordersRouter.post("/draft", async (req, res) => {
    try {
        const { items, pickup_time_start, pickup_time_end, business_id, business_name, business_address, notes } = req.body;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос POST /orders/draft", { items: items?.length, business_id, userId });

        // Валидация
        if (!items || items.length === 0) {
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

        // Пока таблица orders не создана правильно, просто возвращаем успех
        console.log("📦 Создание заказа временно отключено - таблица orders не готова");
        res.send({
            success: true,
            data: {
                order_id: 1,
                status: 'draft',
                subtotal,
                service_fee: serviceFee,
                total,
                message: "Черновик заказа создан (временно отключено)"
            }
        });
        return;

        const orderId = orderResult.rows[0].id;

        // Добавляем позиции заказа
        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items (
                    order_id, offer_id, quantity, price, title
                ) VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.offer_id, item.quantity, item.discounted_price, item.title]
            );
        }

        // Очищаем корзину
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

        res.send({
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
    } catch (e) {
        console.error("❌ Ошибка в POST /orders/draft:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Обновить заказ
ordersRouter.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { items, pickup_time_start, pickup_time_end, notes } = req.body;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

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
    } catch (e) {
        console.error("❌ Ошибка в PATCH /orders/:id:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Подтвердить заказ
ordersRouter.post("/:id/confirm", async (req, res) => {
    try {
        const { id } = req.params;
        const { pickup_time_start, pickup_time_end, notes } = req.body;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

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
    } catch (e) {
        console.error("❌ Ошибка в POST /orders/:id/confirm:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Получить заказы пользователя
// Получить заказы текущего пользователя
ordersRouter.get("/mine", async (req, res) => {
    try {
        // TODO: Получить user_id из JWT токена/сессии
        const userId = req.session?.userId || 1; // Временное решение для тестирования
        
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
    } catch (e) {
        console.error("❌ Ошибка в /orders/mine:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

ordersRouter.get("/", async (req, res) => {
    try {
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

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
            res.status(500).send({
                success: false,
                error: "DATABASE_ERROR",
                message: "Ошибка базы данных: " + dbError.message
            });
        }
    } catch (e) {
        console.error("❌ Ошибка в /orders:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Получить заказы для бизнеса
ordersRouter.get("/business", async (req, res) => {
    try {
        // TODO: Получить business_id из JWT токена/сессии
        const businessId = req.session?.userId || 1;
        
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
    } catch (e) {
        console.error("❌ Ошибка в /orders/business:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

module.exports = ordersRouter;