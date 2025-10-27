const express = require('express');
const pool = require('../lib/db');
const auditLogger = require('../lib/audit');

const paymentsRouter = express.Router();

// Создать платеж (новый API)
paymentsRouter.post("/create", async (req, res) => {
    try {
        const { order_id, payment_method, return_url } = req.body;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос POST /payments/create", { order_id, payment_method, userId });

        // Пока таблица orders не создана правильно, возвращаем заглушку
        const payment = {
            id: Date.now(),
            order_id: parseInt(order_id),
            amount: 1000, // TODO: Получить из заказа
            payment_method: payment_method || 'yookassa',
            status: 'pending',
            payment_url: `https://yookassa.ru/payment/${Date.now()}`, // Заглушка
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Логируем создание платежа
        auditLogger.logPaymentCreated(
            payment.id,
            payment.order_id,
            payment.amount,
            payment.payment_method,
            userId
        );

        res.send({
            success: true,
            data: payment
        });
    } catch (e) {
        console.error("❌ Ошибка в POST /payments/create:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Создать платеж
paymentsRouter.post("/:orderId/create", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { payment_method, return_url } = req.body;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос POST /payments/:orderId/create", { orderId, payment_method, userId });

        // Проверяем, что заказ принадлежит пользователю
        const orderResult = await pool.query(
            `SELECT id, status, total, business_name FROM orders 
             WHERE id = $1 AND user_id = $2`,
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "ORDER_NOT_FOUND",
                message: "Заказ не найден"
            });
        }

        const order = orderResult.rows[0];

        if (order.status !== 'confirmed') {
            return res.status(400).send({
                success: false,
                error: "ORDER_NOT_CONFIRMED",
                message: "Заказ должен быть подтвержден перед оплатой"
            });
        }

        // Проверяем, нет ли уже активного платежа
        const existingPayment = await pool.query(
            `SELECT id, status FROM payments 
             WHERE order_id = $1 AND status IN ('pending', 'processing')`,
            [orderId]
        );

        if (existingPayment.rows.length > 0) {
            return res.status(400).send({
                success: false,
                error: "PAYMENT_EXISTS",
                message: "Для этого заказа уже создан платеж"
            });
        }

        // Создаем платеж
        const paymentResult = await pool.query(
            `INSERT INTO payments (
                order_id, user_id, amount, payment_method, status, 
                return_url, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id`,
            [orderId, userId, order.total, payment_method, 'pending', return_url]
        );

        const paymentId = paymentResult.rows[0].id;

        // TODO: Интеграция с ЮKassa/СБП
        // Пока возвращаем заглушку
        let paymentUrl = '';
        let paymentData = {};

        if (payment_method === 'yookassa') {
            // TODO: Создать платеж в ЮKassa
            paymentUrl = `https://yookassa.ru/payment/${paymentId}`;
            paymentData = {
                payment_id: paymentId,
                amount: order.total,
                currency: 'RUB',
                description: `Оплата заказа #${orderId} от ${order.business_name}`
            };
        } else if (payment_method === 'sbp') {
            // TODO: Создать платеж через СБП
            paymentUrl = `https://sbp.ru/payment/${paymentId}`;
            paymentData = {
                payment_id: paymentId,
                amount: order.total,
                currency: 'RUB',
                description: `Оплата заказа #${orderId} от ${order.business_name}`
            };
        }

        // Обновляем статус платежа
        await pool.query(
            `UPDATE payments SET status = 'processing', payment_url = $1, payment_data = $2 
             WHERE id = $3`,
            [paymentUrl, JSON.stringify(paymentData), paymentId]
        );

        res.send({
            success: true,
            data: {
                payment_id: paymentId,
                payment_url: paymentUrl,
                amount: order.total,
                currency: 'RUB',
                status: 'processing'
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в POST /payments/:orderId/create:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Получить статус платежа по order_id
paymentsRouter.get("/order/:orderId/status", async (req, res) => {
    try {
        const { orderId } = req.params;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос /payments/order/:orderId/status", { orderId, userId });

        // Пока таблица payments не создана правильно, возвращаем заглушку
        const payment = {
            id: Date.now(),
            order_id: parseInt(orderId),
            amount: 1000,
            payment_method: 'yookassa',
            status: 'succeeded', // Заглушка - успешный платеж
            payment_url: `https://yookassa.ru/payment/${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        res.send({
            success: true,
            data: payment
        });
    } catch (e) {
        console.error("❌ Ошибка в /payments/order/:orderId/status:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Получить статус платежа
paymentsRouter.get("/:paymentId/status", async (req, res) => {
    try {
        const { paymentId } = req.params;
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос /payments/:paymentId/status", { paymentId, userId });

        const result = await pool.query(
            `SELECT p.id, p.status, p.amount, p.payment_method, p.payment_url, p.payment_data,
                    o.id as order_id, o.business_name, o.total
             FROM payments p
             JOIN orders o ON p.order_id = o.id
             WHERE p.id = $1 AND p.user_id = $2`,
            [paymentId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "PAYMENT_NOT_FOUND",
                message: "Платеж не найден"
            });
        }

        const payment = result.rows[0];

        res.send({
            success: true,
            data: {
                payment_id: payment.id,
                status: payment.status,
                amount: parseFloat(payment.amount),
                payment_method: payment.payment_method,
                payment_url: payment.payment_url,
                payment_data: payment.payment_data ? JSON.parse(payment.payment_data) : null,
                order_id: payment.order_id,
                business_name: payment.business_name
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в /payments/:paymentId/status:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Webhook для обработки уведомлений от платежной системы
paymentsRouter.post("/webhook", async (req, res) => {
    try {
        const { payment_id, status, amount, currency } = req.body;

        console.log("🔍 Webhook /payments/webhook", { payment_id, status, amount, currency });

        // Логируем получение webhook
        auditLogger.logWebhookReceived('PAYMENT_STATUS_UPDATE', {
            payment_id,
            status,
            amount,
            currency
        }, 'payment_provider');

        // Проверяем, что платеж существует
        const paymentResult = await pool.query(
            `SELECT p.id, p.order_id, p.amount, p.status, o.user_id
             FROM payments p
             JOIN orders o ON p.order_id = o.id
             WHERE p.id = $1`,
            [payment_id]
        );

        if (paymentResult.rows.length === 0) {
            console.error("❌ Платеж не найден:", payment_id);
            return res.status(404).send({ success: false, error: "PAYMENT_NOT_FOUND" });
        }

        const payment = paymentResult.rows[0];

        // Проверяем сумму
        if (parseFloat(payment.amount) !== parseFloat(amount)) {
            console.error("❌ Неверная сумма платежа:", { expected: payment.amount, received: amount });
            return res.status(400).send({ success: false, error: "INVALID_AMOUNT" });
        }

        // Логируем изменение статуса платежа
        auditLogger.logPaymentStatusChanged(
            payment_id,
            payment.status,
            status,
            payment.user_id
        );

        // Обновляем статус платежа
        await pool.query(
            `UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2`,
            [status, payment_id]
        );

        // Если платеж успешен, обновляем статус заказа
        if (status === 'succeeded') {
            await pool.query(
                `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1`,
                [payment.order_id]
            );

            // TODO: Отправить уведомление пользователю
            console.log("✅ Платеж успешен, заказ оплачен:", payment.order_id);
        } else if (status === 'failed' || status === 'cancelled') {
            await pool.query(
                `UPDATE orders SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1`,
                [payment.order_id]
            );

            console.log("❌ Платеж не удался, заказ отменен:", payment.order_id);
        }

        res.send({ success: true, message: "Webhook обработан" });
    } catch (e) {
        console.error("❌ Ошибка в webhook /payments/webhook:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Получить платежи пользователя
paymentsRouter.get("/", async (req, res) => {
    try {
        // TODO: Получить user_id из JWT токена
        const userId = 1; // Временное решение для тестирования

        console.log("🔍 Запрос /payments", { userId });

        // Проверяем, существует ли таблица payments
        const tableExists = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'payments'
            )`
        );

        if (!tableExists.rows[0].exists) {
            console.log("📦 Таблица payments не существует, возвращаем пустой массив");
            res.send({
                success: true,
                data: []
            });
            return;
        }

        // Пока таблица payments не создана правильно, возвращаем пустой массив
        console.log("📦 Таблица payments не готова, возвращаем пустой массив");
        res.send({
            success: true,
            data: []
        });
    } catch (e) {
        console.error("❌ Ошибка в /payments:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

module.exports = paymentsRouter;
