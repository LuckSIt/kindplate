const express = require("express");
const subscriptionsRouter = express.Router();
const pool = require("../lib/db");
const { ensureAuthenticated } = require("../lib/auth");

// Middleware для проверки авторизации (cookie-сессия + Bearer JWT)
const requireAuth = async (req, res, next) => {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }
    // Сохраняем userId в req для использования в роутах
    req.userId = userId;
    next();
};

// POST /subscriptions/waitlist - Подписаться/отписаться от уведомлений
subscriptionsRouter.post("/waitlist", requireAuth, async (req, res) => {
    try {
        const { action, scope_type, scope_id, latitude, longitude, radius_km, area_geojson } = req.body;
        const userId = req.userId || req.session?.userId;

        // Проверяем существование таблицы
        const tableCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'waitlist_subscriptions'
        `);

        if (tableCheck.rows.length === 0) {
            return res.status(503).send({
                success: false,
                error: "SERVICE_UNAVAILABLE",
                message: "Сервис подписок временно недоступен"
            });
        }

        if (action === 'subscribe') {
            // Подписка
            if (!scope_type || !['offer', 'category', 'area', 'business'].includes(scope_type)) {
                return res.status(400).send({
                    success: false,
                    error: "INVALID_REQUEST",
                    message: "Необходимо указать тип подписки: offer, category, area или business"
                });
            }

            // Валидация scope_id для типов, где он обязателен
            if (['offer', 'category', 'business'].includes(scope_type) && !scope_id) {
                return res.status(400).send({
                    success: false,
                    error: "INVALID_REQUEST",
                    message: `Необходимо указать scope_id для типа подписки ${scope_type}`
                });
            }

            // Валидация геолокации для типа 'area'
            if (scope_type === 'area' && (!latitude || !longitude)) {
                return res.status(400).send({
                    success: false,
                    error: "INVALID_REQUEST",
                    message: "Для подписки по области необходимо указать latitude и longitude"
                });
            }

            // Проверяем существующую подписку
            const existingCheck = await pool.query(
                `SELECT id FROM waitlist_subscriptions 
                 WHERE user_id = $1 AND scope_type = $2 
                 AND (($3 IS NULL AND scope_id IS NULL) OR scope_id = $3)`,
                [userId, scope_type, scope_id || null]
            );

            let result;
            if (existingCheck.rows.length > 0) {
                // Обновляем существующую подписку
                result = await pool.query(
                    `UPDATE waitlist_subscriptions 
                     SET is_active = true,
                         latitude = COALESCE($4, latitude),
                         longitude = COALESCE($5, longitude),
                         radius_km = COALESCE($6, radius_km),
                         area_geojson = COALESCE($7, area_geojson),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $8
                     RETURNING id, user_id, scope_type, scope_id, created_at`,
                    [latitude || null, longitude || null, radius_km || 5, area_geojson ? JSON.stringify(area_geojson) : null, existingCheck.rows[0].id]
                );
            } else {
                // Создаем новую подписку
                result = await pool.query(
                    `INSERT INTO waitlist_subscriptions 
                     (user_id, scope_type, scope_id, latitude, longitude, radius_km, area_geojson)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING id, user_id, scope_type, scope_id, created_at`,
                    [userId, scope_type, scope_id || null, latitude || null, longitude || null, radius_km || 5, area_geojson ? JSON.stringify(area_geojson) : null]
                );
            }

            res.send({
                success: true,
                data: result.rows[0],
                message: "Подписка создана"
            });
        } else if (action === 'unsubscribe') {
            // Отписка
            const { subscription_id, scope_type: unsub_scope_type, scope_id: unsub_scope_id } = req.body;

            if (subscription_id) {
                // Удаляем конкретную подписку
                await pool.query(
                    `UPDATE waitlist_subscriptions 
                     SET is_active = false, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1 AND user_id = $2`,
                    [subscription_id, userId]
                );
            } else if (unsub_scope_type && unsub_scope_id) {
                // Удаляем подписку по типу и ID
                await pool.query(
                    `UPDATE waitlist_subscriptions 
                     SET is_active = false, updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = $1 AND scope_type = $2 AND scope_id = $3`,
                    [userId, unsub_scope_type, unsub_scope_id]
                );
            } else {
                return res.status(400).send({
                    success: false,
                    error: "INVALID_REQUEST",
                    message: "Необходимо указать subscription_id или scope_type + scope_id"
                });
            }

            res.send({
                success: true,
                message: "Подписка отменена"
            });
        } else {
            return res.status(400).send({
                success: false,
                error: "INVALID_REQUEST",
                message: "Необходимо указать action: 'subscribe' или 'unsubscribe'"
            });
        }
    } catch (e) {
        console.error("❌ Ошибка в /subscriptions/waitlist:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// GET /subscriptions/waitlist - Получить мои подписки
subscriptionsRouter.get("/waitlist", requireAuth, async (req, res) => {
    try {
        const userId = req.userId || req.session?.userId;

        // Проверяем существование таблицы
        const tableCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'waitlist_subscriptions'
        `);

        if (tableCheck.rows.length === 0) {
            // Таблица не существует, возвращаем пустой массив
            return res.send({
                success: true,
                data: []
            });
        }

        const result = await pool.query(
            `SELECT id, scope_type, scope_id, latitude, longitude, radius_km, is_active, created_at
             FROM waitlist_subscriptions
             WHERE user_id = $1 AND is_active = true
             ORDER BY created_at DESC`,
            [userId]
        );

        res.send({
            success: true,
            data: result.rows
        });
    } catch (e) {
        console.error("❌ Ошибка в /subscriptions/waitlist:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

module.exports = subscriptionsRouter;

