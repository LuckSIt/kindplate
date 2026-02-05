const pool = require("./db");
const { verifyToken } = require("./jwt");

/**
 * Универсальная проверка аутентификации.
 * Сначала пробуем session, если её нет — пробуем JWT из заголовка Authorization: Bearer <token>.
 * При успехе выставляем req.session.userId, чтобы остальной код работал как раньше.
 */
async function ensureAuthenticated(req, res) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const hasSession = !!(req.session && req.session.userId !== undefined);
    const hasJWT = !!(authHeader && authHeader.startsWith('Bearer '));
    
    console.log('🔐 ensureAuthenticated:', { 
        hasSession, 
        hasJWT,
        sessionUserId: req.session?.userId,
        url: req.url
    });

    // 1) Уже есть сессия
    if (req.session && req.session.userId !== undefined) {
        console.log('✅ Auth via session:', req.session.userId);
        return req.session.userId;
    }

    // 2) Пробуем вытянуть Bearer-токен из заголовка
    if (!authHeader || typeof authHeader !== "string") {
        console.log('❌ No auth header');
        return null;
    }

    const [scheme, token] = authHeader.split(" ");
    if (!token || scheme.toLowerCase() !== "bearer") {
        console.log('❌ Invalid auth header format');
        return null;
    }

    try {
        console.log('🔄 Verifying JWT token...');
        const payload = await verifyToken(token);
        console.log('📦 JWT payload:', { userId: payload?.userId, type: payload?.type, exp: payload?.exp });
        
        if (!payload || payload.type !== "access" || !payload.userId) {
            console.log('❌ Invalid JWT payload');
            return null;
        }

        // Проверяем, что пользователь существует
        const result = await pool.query("SELECT id, is_business FROM users WHERE id=$1", [
            payload.userId,
        ]);
        if (result.rowCount === 0) {
            console.log('❌ User not found in DB:', payload.userId);
            return null;
        }

        // Проставляем сессию для обратной совместимости
        req.session.userId = result.rows[0].id;
        req.session.isBusiness = result.rows[0].is_business;

        console.log('✅ Auth via JWT:', result.rows[0].id);
        return result.rows[0].id;
    } catch (e) {
        // Невалидный/просроченный токен — считаем, что не авторизован
        console.log('❌ JWT verification failed:', e.message);
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
