/**
 * Authentication and Authorization Guards
 * Middleware для проверки аутентификации и ролей пользователей
 */

const { AppError } = require('./errorHandler');
const { ensureAuthenticated } = require('./auth');

/**
 * Проверка, что пользователь аутентифицирован (cookie-сессия + Bearer JWT)
 */
const requireAuth = async (req, res, next) => {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Необходима авторизация'
        });
    }
    next();
};

/**
 * Проверка, что пользователь - администратор
 */
const requireAdmin = async (req, res, next) => {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Необходима авторизация'
        });
    }
    
    // Проверяем роль из сессии (после ensureAuthenticated она должна быть установлена)
    if (req.session.role !== 'admin') {
        return res.status(403).send({
            success: false,
            error: 'FORBIDDEN_ADMIN',
            message: 'Доступ запрещен. Требуется роль администратора'
        });
    }
    
    next();
};

/**
 * Проверка, что пользователь - бизнес или админ
 */
const requireBusinessOrAdmin = async (req, res, next) => {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Необходима авторизация'
        });
    }
    
    if (req.session.role !== 'business' && req.session.role !== 'admin') {
        return res.status(403).send({
            success: false,
            error: 'FORBIDDEN',
            message: 'Доступ только для бизнеса или администратора'
        });
    }
    
    next();
};

/**
 * Проверка, что пользователь - бизнес
 * @deprecated Используйте requireBusinessOrAdmin для совместимости с админом
 */
const requireBusiness = async (req, res, next) => {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Необходима авторизация'
        });
    }
    
    // Разрешаем доступ админу тоже
    if (req.session.role !== 'business' && req.session.role !== 'admin') {
        return res.status(403).send({
            success: false,
            error: 'FORBIDDEN',
            message: 'Доступ только для бизнеса'
        });
    }
    
    next();
};

/**
 * Проверка, что пользователь - клиент (не бизнес)
 */
const requireCustomer = async (req, res, next) => {
    const userId = await ensureAuthenticated(req, res);
    if (!userId) {
        return res.status(401).send({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Необходима авторизация'
        });
    }
    
    if (req.session.isBusiness) {
        return res.status(403).send({
            success: false,
            error: 'FORBIDDEN',
            message: 'Доступ только для клиентов'
        });
    }
    
    next();
};

/**
 * Опциональная аутентификация (не выбрасывает ошибку, если пользователь не авторизован)
 */
const optionalAuth = (req, res, next) => {
    // Просто проверяем наличие userId в сессии
    // Если есть - добавляем информацию, если нет - идем дальше
    if (req.session && req.session.userId) {
        req.isAuthenticated = true;
        req.userId = req.session.userId;
        req.isBusiness = req.session.isBusiness;
        req.role = req.session.role;
    } else {
        req.isAuthenticated = false;
    }
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireBusinessOrAdmin,
    requireBusiness,
    requireCustomer,
    optionalAuth
};




