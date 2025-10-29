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
        `, [[ 'cart_items', 'offers', 'businesses' ]]);
        const have = tablesCheck.rows.map(r => r.table_name);
        if (!have.includes('cart_items') || !have.includes('offers') || !have.includes('businesses')) {
            console.warn('⚠️ Необходимые таблицы отсутствуют. Возвращаем пустую корзину.');
            return res.send({ success: true, data: [] });
        }

        const result = await pool.query(
            `SELECT 
                ci.offer_id,
                ci.quantity,
                o.business_id,
                o.title,
                o.description,
                o.image_url,
                o.original_price,
                o.discounted_price,
                o.pickup_time_start,
                o.pickup_time_end,
                b.name as business_name,
                b.address as business_address
            FROM cart_items ci
            JOIN offers o ON ci.offer_id = o.id
            JOIN businesses b ON o.business_id = b.id
            WHERE ci.user_id = $1`,
            [userId]
        );

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

        // Проверяем, существует ли предложение
        const offerResult = await pool.query(
            `SELECT o.id, o.business_id, o.quantity_available, o.is_active
             FROM offers o
             WHERE o.id = $1 AND o.is_active = true`,
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
        if (offer.quantity_available < quantity) {
            return res.status(400).send({
                success: false,
                error: "INSUFFICIENT_QUANTITY",
                message: "Недостаточно товара в наличии"
            });
        }

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
