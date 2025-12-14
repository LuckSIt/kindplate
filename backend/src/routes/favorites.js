const express = require("express");
const favoritesRouter = express.Router();
const pool = require("../lib/db");
const { authOnly, ensureAuthenticated } = require("../lib/auth");

// POST /favorites/add - Добавить в избранное
favoritesRouter.post("/add", authOnly, async (req, res) => {
    try {
        const { business_id } = req.body;
        // Унифицированная аутентификация (cookie-сессия + Bearer-токен)
        const user_id = await ensureAuthenticated(req, res);

        if (!business_id) {
            return res.status(400).send({ success: false, error: "MISSING_BUSINESS_ID" });
        }

        // Проверка, что это бизнес-аккаунт
        const businessCheck = await pool.query(
            `SELECT is_business FROM users WHERE id=$1`,
            [business_id]
        );

        if (businessCheck.rowCount === 0 || !businessCheck.rows[0].is_business) {
            return res.status(400).send({ success: false, error: "INVALID_BUSINESS_ID" });
        }

        // Добавляем в избранное (UNIQUE constraint предотвратит дубликаты)
        await pool.query(
            `INSERT INTO favorites (user_id, business_id) VALUES ($1, $2) 
             ON CONFLICT (user_id, business_id) DO NOTHING`,
            [user_id, business_id]
        );

        res.send({ success: true });
    } catch (e) {
        console.error("❌ Ошибка в /favorites/add:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// POST /favorites/remove - Удалить из избранного
favoritesRouter.post("/remove", authOnly, async (req, res) => {
    try {
        const { business_id } = req.body;
        const user_id = await ensureAuthenticated(req, res);

        if (!business_id) {
            return res.status(400).send({ success: false, error: "MISSING_BUSINESS_ID" });
        }

        await pool.query(
            `DELETE FROM favorites WHERE user_id=$1 AND business_id=$2`,
            [user_id, business_id]
        );

        res.send({ success: true });
    } catch (e) {
        console.error("❌ Ошибка в /favorites/remove:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// GET /favorites/mine - Получить список избранных заведений
favoritesRouter.get("/mine", authOnly, async (req, res) => {
    try {
        const user_id = await ensureAuthenticated(req, res);

        const result = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.address,
                u.logo_url,
                u.rating,
                u.total_reviews,
                (SELECT COUNT(*) FROM offers o WHERE o.business_id = u.id AND o.is_active = true AND o.quantity_available > 0) as active_offers,
                f.created_at
             FROM favorites f
             JOIN users u ON f.business_id = u.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [user_id]
        );

        res.send({ success: true, favorites: result.rows });
    } catch (e) {
        console.error("❌ Ошибка в /favorites/mine:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// GET /favorites/check/:businessId - Проверить наличие в избранном
favoritesRouter.get("/check/:businessId", authOnly, async (req, res) => {
    try {
        const business_id = req.params.businessId;
        const user_id = req.session.userId;

        const result = await pool.query(
            `SELECT id FROM favorites WHERE user_id=$1 AND business_id=$2`,
            [user_id, business_id]
        );

        res.send({ success: true, is_favorite: result.rowCount > 0 });
    } catch (e) {
        console.error("❌ Ошибка в /favorites/check:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

module.exports = favoritesRouter;

