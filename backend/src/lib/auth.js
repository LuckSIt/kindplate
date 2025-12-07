const pool = require("./db");
const { verifyToken } = require("./jwt");

/**
 * Универсальная проверка аутентификации.
 * Сначала пробуем session, если её нет — пробуем JWT из заголовка Authorization: Bearer <token>.
 * При успехе выставляем req.session.userId, чтобы остальной код работал как раньше.
 */
async function ensureAuthenticated(req, res) {
    // 1) Уже есть сессия
    if (req.session && req.session.userId !== undefined) {
        return req.session.userId;
    }

    // 2) Пробуем вытянуть Bearer-токен из заголовка
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== "string") {
        return null;
    }

    const [scheme, token] = authHeader.split(" ");
    if (!token || scheme.toLowerCase() !== "bearer") {
        return null;
    }

    try {
        const payload = await verifyToken(token);
        if (!payload || payload.type !== "access" || !payload.userId) {
            return null;
        }

        // Проверяем, что пользователь существует
        const result = await pool.query("SELECT id, is_business FROM users WHERE id=$1", [
            payload.userId,
        ]);
        if (result.rowCount === 0) {
            return null;
        }

        // Проставляем сессию для обратной совместимости
        req.session.userId = result.rows[0].id;
        req.session.isBusiness = result.rows[0].is_business;

        return result.rows[0].id;
    } catch (e) {
        // Невалидный/просроченный токен — считаем, что не авторизован
        return null;
    }
}

async function authOnly(req, res, next) {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация",
        });
    }
    next();
}

async function businessOnly(req, res, next) {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация",
        });
    }

    const result = await pool.query("SELECT is_business FROM users WHERE id=$1", [userId]);

    if (result.rowCount === 0) {
        req.session.userId = undefined;
        return res.status(401).send({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Пользователь не найден",
        });
    } else if (!result.rows[0].is_business) {
        return res.status(403).send({
            success: false,
            error: "NOT_AUTHORIZED",
            message: "Доступ разрешён только бизнес-аккаунтам",
        });
    }

    next();
}

module.exports = {
    authOnly,
    businessOnly,
    ensureAuthenticated,
};
