/**
 * JWT Authentication Middleware
 * Middleware для проверки JWT токенов
 */

const { verifyToken } = require('./jwt');
const { AppError } = require('./errorHandler');
const logger = require('./logger');

/**
 * Middleware для проверки JWT токена из заголовка Authorization
 */
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Токен не предоставлен', 401, 'NO_TOKEN');
        }

        const token = authHeader.substring(7); // Убираем "Bearer "

        const payload = await verifyToken(token);

        if (payload.type !== 'access') {
            throw new AppError('Неверный тип токена', 401, 'INVALID_TOKEN_TYPE');
        }

        // Добавляем данные пользователя в req
        req.userId = payload.userId;
        req.userEmail = payload.email;
        req.isBusiness = payload.isBusiness;
        req.isAuthenticated = true;

        next();
    } catch (error) {
        logger.warn('JWT authentication failed', { error: error.message });
        
        if (error instanceof AppError) {
            throw error;
        }
        
        throw new AppError('Невалидный или истекший токен', 401, 'INVALID_TOKEN');
    }
};

/**
 * Опциональная JWT аутентификация (не выбрасывает ошибку)
 */
const optionalJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.isAuthenticated = false;
            return next();
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (payload.type === 'access') {
            req.userId = payload.userId;
            req.userEmail = payload.email;
            req.isBusiness = payload.isBusiness;
            req.isAuthenticated = true;
        } else {
            req.isAuthenticated = false;
        }
    } catch (error) {
        req.isAuthenticated = false;
    }
    
    next();
};

module.exports = {
    authenticateJWT,
    optionalJWT
};




