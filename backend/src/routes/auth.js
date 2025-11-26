const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const pool = require("../lib/db");
const logger = require("../lib/logger");
const { AppError, asyncHandler } = require("../lib/errorHandler");
const { validateRegistration, validateLogin } = require("../lib/validation");
const { createTokenPair, verifyToken } = require("../lib/jwt");

// Rate limiting для защиты от брутфорса
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // максимум 5 попыток
    message: {
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: "Слишком много попыток входа. Попробуйте позже."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 3, // максимум 3 регистрации
    message: {
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: "Слишком много попыток регистрации. Попробуйте позже."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

authRouter.post("/register", registerLimiter, validateRegistration, asyncHandler(async (req, res) => {
    const { name, email, password, is_business } = req.body;
    
    // БЛОКИРУЕМ регистрацию бизнесов через публичный endpoint
    if (is_business) {
        logger.warn("Attempt to register business through public endpoint", { email });
        throw new AppError("Регистрация бизнес-аккаунтов доступна только через администратора", 403, "BUSINESS_REGISTRATION_FORBIDDEN");
    }
    
    const coords = [0, 0];
    const address = "none";

    logger.info("Registration attempt", { email, is_business: false });

    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
        "INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
        [
            name,
            email,
            address,
            coords[0],
            coords[1],
            password_hash,
            false, // is_business всегда false
            'customer' // роль всегда customer
        ]
    );

    const userId = result.rows[0].id;
    req.session.userId = userId;
    req.session.isBusiness = false;
    req.session.role = 'customer';

    logger.info("User registered successfully", { userId, email, is_business: false, role: 'customer' });

    res.status(201).json({
        success: true,
        message: "Пользователь успешно зарегистрирован"
    });
}));

authRouter.post("/login", authLimiter, validateLogin, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    logger.info("Login attempt", { email });

    try {
        // Пробуем получить role, если колонка существует, иначе NULL
        const result = await pool.query(
            "SELECT id, password_hash, name, is_business, COALESCE(role, NULL) as role FROM users WHERE email=$1",
            [email]
        );

        if (result.rowCount === 0) {
            logger.warn("Login failed - user not found", { email });
            throw new AppError("Неверные учетные данные", 401, "INVALID_CREDENTIALS");
        }

        const { id, password_hash: passwordHash, name, is_business, role } = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, passwordHash);
        if (!isPasswordValid) {
            logger.warn("Login failed - invalid password", { email });
            throw new AppError("Неверные учетные данные", 401, "INVALID_CREDENTIALS");
        }

        // Определяем роль с fallback
        const userRole = role || (is_business ? 'business' : 'customer');

        req.session.userId = id;
        req.session.isBusiness = is_business;
        req.session.role = userRole;

        logger.info("User logged in successfully", { userId: id, email, is_business, role: userRole });

        res.json({
            success: true,
            message: "Вход выполнен успешно",
            user: { id, name, email, is_business }
        });
    } catch (error) {
        // Логируем полную ошибку для отладки
        logger.error("Login error:", { 
            error: error.message, 
            stack: error.stack, 
            email,
            errorCode: error.code 
        });
        throw error;
    }
}));

authRouter.get("/logout", (req, res) => {
    // Если пользователь уже не авторизован, просто возвращаем успех
    if (req.session.userId === undefined) {
        return res.json({
            success: true,
            message: "Вы уже вышли из системы"
        });
    }
    
    logger.info("User logged out", { userId: req.session.userId });
    req.session.userId = undefined;
    req.session.isBusiness = undefined;
    req.session.role = undefined;
    
    res.json({
        success: true,
        message: "Выход выполнен успешно"
    });
});

authRouter.get("/me", asyncHandler(async (req, res) => {
    try {
    if (req.session.userId === undefined) {
        return res.json({
            user: null,
                success: true,
            message: "Пользователь не авторизован"
        });
    }

        // Проверяем наличие колонок перед запросом
        const columnsCheck = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
            AND column_name IN ('rating', 'total_reviews')
        `);
        const availableColumns = columnsCheck.rows.map(r => r.column_name);
        const hasRating = availableColumns.includes('rating');
        const hasTotalReviews = availableColumns.includes('total_reviews');

        const selectFields = [
            'id', 'name', 'email', 'is_business', 'role', 'address', 
            'coord_0', 'coord_1'
        ];
        
        if (hasRating) selectFields.push('rating');
        if (hasTotalReviews) selectFields.push('total_reviews');

    const result = await pool.query(
            `SELECT ${selectFields.join(', ')} FROM users WHERE id=$1`,
        [req.session.userId]
    );

    if (result.rowCount === 0) {
        req.session.userId = undefined; // Очищаем сессию если пользователь не найден
        return res.json({
            user: null,
                success: true,
            message: "Пользователь не найден"
        });
    }

    const user = result.rows[0];
    user.coords = [user.coord_0, user.coord_1];
    delete user.coord_0;
    delete user.coord_1;
    
    // Устанавливаем роль в сессии, если её там нет (для обратной совместимости)
    if (!req.session.role) {
        req.session.role = user.role || (user.is_business ? 'business' : 'customer');
    }

    res.json({
        user,
        success: true
    });
    } catch (error) {
        logger.error('Error in /auth/me:', {
            error: error.message,
            stack: error.stack,
            userId: req.session?.userId
        });
        // Возвращаем пустой ответ вместо ошибки, чтобы не ломать фронтенд
        res.json({
            user: null,
            success: true,
            message: "Ошибка при получении данных пользователя"
        });
    }
}));

// Endpoint для обновления токена через refresh token
authRouter.post("/refresh", asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh токен не предоставлен', 401, 'NO_REFRESH_TOKEN');
    }

    try {
        const payload = await verifyToken(refreshToken);

        if (payload.type !== 'refresh') {
            throw new AppError('Неверный тип токена', 401, 'INVALID_TOKEN_TYPE');
        }

        // Получаем данные пользователя из БД
        const result = await pool.query(
            "SELECT id, email, is_business FROM users WHERE id=$1",
            [payload.userId]
        );

        if (result.rowCount === 0) {
            throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
        }

        const user = result.rows[0];

        // Создаем новую пару токенов
        const tokens = await createTokenPair(user);

        logger.info('Tokens refreshed', { userId: user.id });

        res.json({
            success: true,
            ...tokens
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.warn('Token refresh failed', { error: error.message });
        throw new AppError('Невалидный или истекший refresh токен', 401, 'INVALID_REFRESH_TOKEN');
    }
}));

// Endpoint для получения JWT токенов (дополнительно к session-based auth)
authRouter.post("/tokens", asyncHandler(async (req, res) => {
    if (!req.session.userId) {
        throw new AppError('Необходима авторизация', 401, 'UNAUTHORIZED');
    }

    const result = await pool.query(
        "SELECT id, email, is_business FROM users WHERE id=$1",
        [req.session.userId]
    );

    if (result.rowCount === 0) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];
    const tokens = await createTokenPair(user);

    logger.info('JWT tokens issued', { userId: user.id });

    res.json({
        success: true,
        ...tokens
    });
}));

module.exports = authRouter;
