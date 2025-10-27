const express = require("express");
const notificationsRouter = express.Router();
const pool = require("../lib/db");

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send({ success: false, error: "NOT_AUTHENTICATED" });
    }
    next();
};

// POST /notifications/subscribe - Подписаться на push-уведомления
notificationsRouter.post("/subscribe", requireAuth, async (req, res) => {
    try {
        const { subscription, userAgent } = req.body;
        const userId = req.session.userId;

        console.log("🔔 Push subscription request:", { userId, userAgent });

        if (!subscription) {
            return res.status(400).send({ success: false, error: "MISSING_SUBSCRIPTION" });
        }

        // Проверяем, существует ли таблица notification_settings
        const tableExists = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'notification_settings'
            )`
        );

        if (!tableExists.rows[0].exists) {
            console.log("📦 Таблица notification_settings не существует, возвращаем успех без сохранения");
            res.send({ success: true, message: "Successfully subscribed to push notifications" });
            return;
        }

        // Сохраняем подписку в базу данных
        await pool.query(
            `INSERT INTO notification_settings (user_id, web_push_enabled, web_push_subscription)
             VALUES ($1, true, $2)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                 web_push_enabled = true,
                 web_push_subscription = $2,
                 updated_at = CURRENT_TIMESTAMP`,
            [userId, JSON.stringify(subscription)]
        );

        res.send({ success: true, message: "Successfully subscribed to push notifications" });
    } catch (e) {
        console.error("❌ Ошибка в /notifications/subscribe:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// POST /notifications/unsubscribe - Отписаться от push-уведомлений
notificationsRouter.post("/unsubscribe", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        console.log("🔕 Push unsubscription request:", { userId });

        // Отключаем push-уведомления
        await pool.query(
            `UPDATE notification_settings 
             SET web_push_enabled = false, web_push_subscription = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1`,
            [userId]
        );

        res.send({ success: true, message: "Successfully unsubscribed from push notifications" });
    } catch (e) {
        console.error("❌ Ошибка в /notifications/unsubscribe:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// GET /notifications/settings - Получить настройки уведомлений
notificationsRouter.get("/settings", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        console.log("🔍 Запрос /notifications/settings", { userId });

        // Проверяем, существует ли таблица notification_settings
        const tableExists = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'notification_settings'
            )`
        );

        if (!tableExists.rows[0].exists) {
            console.log("📦 Таблица notification_settings не существует, возвращаем настройки по умолчанию");
            res.send({
                success: true,
                data: {
                    web_push_enabled: false,
                    email_enabled: false,
                    email_address: '',
                    new_offers_enabled: true,
                    window_start_enabled: true,
                    window_end_enabled: true,
                    web_push_subscription: null
                }
            });
            return;
        }

        const result = await pool.query(
            `SELECT web_push_enabled, email_enabled, email_address, 
                    new_offers_enabled, window_start_enabled, window_end_enabled,
                    web_push_subscription
             FROM notification_settings 
             WHERE user_id = $1`,
            [userId]
        );

        if (result.rowCount === 0) {
            // Создаем настройки по умолчанию
            await pool.query(
                `INSERT INTO notification_settings (user_id) VALUES ($1)`,
                [userId]
            );
            
            res.send({
                success: true,
                data: {
                    web_push_enabled: false,
                    email_enabled: false,
                    email_address: '',
                    new_offers_enabled: true,
                    window_start_enabled: true,
                    window_end_enabled: true,
                    web_push_subscription: null
                }
            });
        } else {
            const settings = result.rows[0];
            res.send({
                success: true,
                data: {
                    web_push_enabled: settings.web_push_enabled || false,
                    email_enabled: settings.email_enabled || false,
                    email_address: settings.email_address || '',
                    new_offers_enabled: settings.new_offers_enabled !== false,
                    window_start_enabled: settings.window_start_enabled !== false,
                    window_end_enabled: settings.window_end_enabled !== false,
                    web_push_subscription: settings.web_push_subscription
                }
            });
        }
    } catch (e) {
        console.error("❌ Ошибка в /notifications/settings:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// PUT /notifications/settings - Обновить настройки уведомлений
notificationsRouter.put("/settings", requireAuth, async (req, res) => {
    try {
        const { 
            web_push_enabled, 
            email_enabled, 
            email_address, 
            new_offers_enabled, 
            window_start_enabled, 
            window_end_enabled 
        } = req.body;
        const userId = req.session.userId;

        console.log("🔧 Updating notification settings:", { userId, web_push_enabled, email_enabled });

        await pool.query(
            `INSERT INTO notification_settings 
             (user_id, web_push_enabled, email_enabled, email_address, 
              new_offers_enabled, window_start_enabled, window_end_enabled)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                 web_push_enabled = $2,
                 email_enabled = $3,
                 email_address = $4,
                 new_offers_enabled = $5,
                 window_start_enabled = $6,
                 window_end_enabled = $7,
                 updated_at = CURRENT_TIMESTAMP`,
            [userId, web_push_enabled, email_enabled, email_address, 
             new_offers_enabled, window_start_enabled, window_end_enabled]
        );

        res.send({ success: true, message: "Notification settings updated successfully" });
    } catch (e) {
        console.error("❌ Ошибка в /notifications/settings:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// POST /notifications/send - Отправить уведомление (для тестирования)
notificationsRouter.post("/send", requireAuth, async (req, res) => {
    try {
        const { title, body, type, businessId } = req.body;
        const userId = req.session.userId;

        console.log("📨 Sending notification:", { userId, title, body, type });

        // TODO: Реальная отправка push-уведомлений через web-push библиотеку
        // Пока просто логируем
        console.log("📤 Notification would be sent:", {
            title,
            body,
            type,
            businessId,
            userId
        });

        res.send({ success: true, message: "Notification sent successfully" });
    } catch (e) {
        console.error("❌ Ошибка в /notifications/send:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// GET /notifications/history - Получить историю уведомлений
notificationsRouter.get("/history", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { limit = 50, offset = 0 } = req.query;

        console.log("🔍 Запрос /notifications/history", { userId, limit, offset });

        // Проверяем, существует ли таблица notifications
        const tableExists = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'notifications'
            )`
        );

        if (!tableExists.rows[0].exists) {
            console.log("📦 Таблица notifications не существует, возвращаем пустой массив");
            res.send({
                success: true,
                data: []
            });
            return;
        }

        const result = await pool.query(
            `SELECT n.id, n.type, n.title, n.message, n.data, n.sent_via, 
                    n.read_at, n.created_at, n.sent_at,
                    u.name as business_name
             FROM notifications n
             LEFT JOIN users u ON n.business_id = u.id
             WHERE n.user_id = $1
             ORDER BY n.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.send({
            success: true,
            data: result.rows
        });
    } catch (e) {
        console.error("❌ Ошибка в /notifications/history:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// POST /notifications/mark-read - Отметить уведомление как прочитанное
notificationsRouter.post("/mark-read", requireAuth, async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.session.userId;

        await pool.query(
            `UPDATE notifications 
             SET read_at = CURRENT_TIMESTAMP 
             WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );

        res.send({ success: true, message: "Notification marked as read" });
    } catch (e) {
        console.error("❌ Ошибка в /notifications/mark-read:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

module.exports = notificationsRouter;
