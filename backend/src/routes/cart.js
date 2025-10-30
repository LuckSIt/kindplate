const express = require('express');
const pool = require('../lib/db');

const cartRouter = express.Router();

// Получить корзину пользователя
cartRouter.get("/cart", async (req, res) => {
    try {
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос /customer/cart", { userId });

        // Безопасная проверка наличия таблиц
        const tablesCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = ANY($1)
        `, [[ 'cart_items', 'offers', 'businesses', 'users' ]]);
        const have = tablesCheck.rows.map(r => r.table_name);
        // Создаем cart_items если отсутствует
        if (!have.includes('cart_items')) {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS cart_items (
                    user_id INTEGER NOT NULL,
                    offer_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, offer_id)
                )
            `);
            have.push('cart_items');
        }

        // Если нет offers — вернуть пусто; при отсутствии businesses используем legacy users
        if (!have.includes('offers')) {
            console.warn('⚠️ Таблица offers отсутствует. Возвращаем пустую корзину.');
            return res.send({ success: true, data: [] });
        }

        // Проверяем доступные колонки в offers (прод и локальные схемы могут отличаться)
        const offersColsRes = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'offers'
        `);
        const offerCols = offersColsRes.rows.map(r => r.column_name);

        const colOrNull = (name, fallbackNames = [], cast = 'text') => {
            if (offerCols.includes(name)) return `o.${name}`;
            for (const alt of fallbackNames) {
                if (offerCols.includes(alt)) return `o.${alt}`;
            }
            return `NULL::${cast}`;
        };

        const titleSel = `${colOrNull('title', ['name'])} as title`;
        const descSel = `${colOrNull('description', [])} as description`;
        const imageSel = `${colOrNull('image_url', ['photo_url', 'image'])} as image_url`;
        const origPriceSel = `${colOrNull('original_price', ['price_orig','price_original'], 'numeric')} as original_price`;
        const discPriceSel = `${colOrNull('discounted_price', ['price_disc','price_discount'], 'numeric')} as discounted_price`;
        const qtySel = `${colOrNull('quantity_available', ['quantity','stock'], 'int')} as quantity_available`;
        const startSel = `${colOrNull('pickup_time_start', [])} as pickup_time_start`;
        const endSel = `${colOrNull('pickup_time_end', [])} as pickup_time_end`;

        let query;
        const queryWithBusinesses = `SELECT 
                ci.offer_id,
                ci.quantity,
                o.business_id,
                ${titleSel},
                ${descSel},
                ${imageSel},
                ${origPriceSel},
                ${discPriceSel},
                ${startSel},
                ${endSel},
                b.name as business_name,
                b.address as business_address
            FROM cart_items ci
            JOIN offers o ON ci.offer_id = o.id
            JOIN businesses b ON o.business_id = b.id
            WHERE ci.user_id = $1`;
        const queryWithUsers = `SELECT 
                ci.offer_id,
                ci.quantity,
                o.business_id,
                ${titleSel},
                ${descSel},
                ${imageSel},
                ${origPriceSel},
                ${discPriceSel},
                ${startSel},
                ${endSel},
                u.name as business_name,
                u.address as business_address
            FROM cart_items ci
            JOIN offers o ON ci.offer_id = o.id
            JOIN users u ON o.business_id = u.id
            WHERE ci.user_id = $1`;

        if (have.includes('businesses')) {
            query = queryWithBusinesses;
        } else {
            // fallback legacy schema
            query = queryWithUsers;
        }

        let result = await pool.query(query, [userId]);
        // Если попытались джойниться к businesses, но нет соответствий (миграции не совпадают), пробуем legacy users
        if (result.rows.length === 0 && have.includes('businesses') && have.includes('users')) {
            const legacyResult = await pool.query(queryWithUsers, [userId]);
            if (legacyResult.rows.length > 0) {
                result = legacyResult;
            }
        }

        const cartItems = result.rows.map(row => ({
            offer_id: row.offer_id,
            quantity: row.quantity,
            business_id: row.business_id,
            offer: {
                id: row.offer_id,
                title: row.title,
                description: row.description,
                image_url: row.image_url,
                original_price: parseFloat(row.original_price),
                discounted_price: parseFloat(row.discounted_price),
                pickup_time_start: row.pickup_time_start,
                pickup_time_end: row.pickup_time_end,
                business: {
                    id: row.business_id,
                    name: row.business_name,
                    address: row.business_address
                }
            }
        }));

        res.send({
            success: true,
            data: cartItems
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/cart:", e);
        return res.send({ success: true, data: [] });
    }
});

// Добавить товар в корзину
cartRouter.post("/cart", async (req, res) => {
    try {
        const { offer_id, quantity } = req.body;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос POST /customer/cart", { offer_id, quantity, userId });

        // Проверяем доступные колонки в offers
        const offersColsRes = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'offers'
        `);
        const offerCols = offersColsRes.rows.map(r => r.column_name);
        const hasIsActive = offerCols.includes('is_active');

        // Проверяем, существует ли предложение (учитывая возможное отсутствие is_active)
        const offerResult = await pool.query(
            `SELECT o.id, o.business_id, 
                    ${offerCols.includes('quantity_available') ? 'o.quantity_available' : 'COALESCE(o.quantity, 0)'} AS quantity_available
             FROM offers o
             WHERE o.id = $1 ${hasIsActive ? 'AND o.is_active = true' : ''}`,
            [offer_id]
        );

        if (offerResult.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "OFFER_NOT_FOUND",
                message: "Предложение не найдено или неактивно"
            });
        }

        const offer = offerResult.rows[0];
        if (Number(offer.quantity_available) < Number(quantity)) {
            return res.status(400).send({
                success: false,
                error: "INSUFFICIENT_QUANTITY",
                message: "Недостаточно товара в наличии"
            });
        }

        // Убедимся, что есть таблица cart_items
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                user_id INTEGER NOT NULL,
                offer_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, offer_id)
            )
        `);

        // Проверяем, есть ли в корзине товары от другого продавца
        const existingCartResult = await pool.query(
            `SELECT ci.offer_id, o.business_id
             FROM cart_items ci
             JOIN offers o ON ci.offer_id = o.id
             WHERE ci.user_id = $1`,
            [userId]
        );

        const hasDifferentBusiness = existingCartResult.rows.some(
            item => item.business_id !== offer.business_id
        );

        if (hasDifferentBusiness) {
            // Очищаем корзину и добавляем новый товар
            await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
        }

        // Добавляем товар в корзину
        await pool.query(
            `INSERT INTO cart_items (user_id, offer_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, offer_id)
             DO UPDATE SET quantity = $3`,
            [userId, offer_id, quantity]
        );

        res.send({
            success: true,
            message: "Товар добавлен в корзину"
        });
    } catch (e) {
        console.error("❌ Ошибка в POST /customer/cart:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Обновить количество товара в корзине
cartRouter.put("/cart", async (req, res) => {
    try {
        const { offer_id, quantity } = req.body;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос PUT /customer/cart", { offer_id, quantity, userId });

        // Проверяем, есть ли товар в корзине
        const existingItem = await pool.query(
            `SELECT ci.quantity, o.quantity_available
             FROM cart_items ci
             JOIN offers o ON ci.offer_id = o.id
             WHERE ci.user_id = $1 AND ci.offer_id = $2`,
            [userId, offer_id]
        );

        if (existingItem.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "ITEM_NOT_IN_CART",
                message: "Товар не найден в корзине"
            });
        }

        const availableQuantity = existingItem.rows[0].quantity_available;
        if (availableQuantity < quantity) {
            return res.status(400).send({
                success: false,
                error: "INSUFFICIENT_QUANTITY",
                message: "Недостаточно товара в наличии"
            });
        }

        // Обновляем количество
        await pool.query(
            `UPDATE cart_items 
             SET quantity = $1 
             WHERE user_id = $2 AND offer_id = $3`,
            [quantity, userId, offer_id]
        );

        res.send({
            success: true,
            message: "Количество товара обновлено"
        });
    } catch (e) {
        console.error("❌ Ошибка в PUT /customer/cart:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Удалить товар из корзины
cartRouter.delete("/cart/:offerId", async (req, res) => {
    try {
        const { offerId } = req.params;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос DELETE /customer/cart/:offerId", { offerId, userId });

        const result = await pool.query(
            `DELETE FROM cart_items 
             WHERE user_id = $1 AND offer_id = $2`,
            [userId, offerId]
        );

        if (result.rowCount === 0) {
            return res.status(404).send({
                success: false,
                error: "ITEM_NOT_IN_CART",
                message: "Товар не найден в корзине"
            });
        }

        res.send({
            success: true,
            message: "Товар удален из корзины"
        });
    } catch (e) {
        console.error("❌ Ошибка в DELETE /customer/cart/:offerId:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Очистить корзину
cartRouter.delete("/cart", async (req, res) => {
    try {
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос DELETE /customer/cart", { userId });

        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

        res.send({
            success: true,
            message: "Корзина очищена"
        });
    } catch (e) {
        console.error("❌ Ошибка в DELETE /customer/cart:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

module.exports = cartRouter;
