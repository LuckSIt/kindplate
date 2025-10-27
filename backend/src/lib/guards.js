/**
 * Authentication and Authorization Guards
 * Middleware для проверки аутентификации и ролей пользователей
 */

const { AppError } = require('./errorHandler');

/**
 * Проверка, что пользователь аутентифицирован
 */
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        throw new AppError('Необходима авторизация', 401, 'UNAUTHORIZED');
    }
    next();
};

/**
 * Проверка, что пользователь - администратор
 */
const requireAdmin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        throw new AppError('Необходима авторизация', 401, 'UNAUTHORIZED');
    }
    
    if (req.session.role !== 'admin') {
        throw new AppError('Доступ запрещен. Требуется роль администратора', 403, 'FORBIDDEN_ADMIN');
    }
    
    next();
};

/**
 * Проверка, что пользователь - бизнес или админ
 */
const requireBusinessOrAdmin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        throw new AppError('Необходима авторизация', 401, 'UNAUTHORIZED');
    }
    
    if (req.session.role !== 'business' && req.session.role !== 'admin') {
        throw new AppError('Доступ только для бизнеса или администратора', 403, 'FORBIDDEN');
    }
    
    next();
};

/**
 * Проверка, что пользователь - бизнес
 * @deprecated Используйте requireBusinessOrAdmin для совместимости с админом
 */
const requireBusiness = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        throw new AppError('Необходима авторизация', 401, 'UNAUTHORIZED');
    }
    
    // Разрешаем доступ админу тоже
    if (req.session.role !== 'business' && req.session.role !== 'admin') {
        throw new AppError('Доступ только для бизнеса', 403, 'FORBIDDEN');
    }
    
    next();
};

/**
 * Проверка, что пользователь - клиент (не бизнес)
 */
const requireCustomer = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        throw new AppError('Необходима авторизация', 401, 'UNAUTHORIZED');
    }
    
    if (req.session.isBusiness) {
        throw new AppError('Доступ только для клиентов', 403, 'FORBIDDEN');
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




