/**
 * Security Middleware
 * Защита от XSS, CSRF, injection атак
 */

const sanitizeHtml = (value) => {
    if (typeof value === 'string') {
        // Удаляем потенциально опасные теги и атрибуты
        return value
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '')
            .trim();
    }
    return value;
};

const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        return sanitizeHtml(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }

    return obj;
};

/**
 * XSS Protection Middleware
 * Очищает все входящие данные от потенциально опасного кода
 */
const xssProtection = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};

/**
 * Content Security Policy
 * Устанавливает политику безопасности контента
 */
const contentSecurityPolicy = (req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api-maps.yandex.ru https://yandex.ru; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: http:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://api-maps.yandex.ru https://geocode-maps.yandex.ru; " +
        "frame-src 'self';"
    );
    next();
};

/**
 * NoSQL Injection Protection
 * Защита от NoSQL injection атак (для будущего использования MongoDB)
 */
const noSqlInjectionProtection = (req, res, next) => {
    const sanitizeNoSql = (obj) => {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            // Удаляем операторы MongoDB/NoSQL
            return obj.replace(/\$\w+/g, '');
        }

        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeNoSql(item));
        }

        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                // Удаляем ключи, начинающиеся с $
                if (!key.startsWith('$')) {
                    sanitized[key] = sanitizeNoSql(value);
                }
            }
            return sanitized;
        }

        return obj;
    };

    if (req.body) {
        req.body = sanitizeNoSql(req.body);
    }
    if (req.query) {
        req.query = sanitizeNoSql(req.query);
    }

    next();
};

/**
 * SQL Injection Protection
 * Базовая защита от SQL injection (дополнительно к параметризованным запросам)
 */
const sqlInjectionProtection = (req, res, next) => {
    const checkSqlInjection = (value) => {
        if (typeof value !== 'string') {
            return false;
        }

        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
            /(--|\;|\/\*|\*\/)/,
            /(\bOR\b.*=.*\b)/i,
            /(\bAND\b.*=.*\b)/i,
            /('|\"|`)/
        ];

        // Проверяем только если строка похожа на SQL команду
        const suspiciousPatterns = sqlPatterns.slice(0, 3);
        return suspiciousPatterns.some(pattern => pattern.test(value));
    };

    const checkObject = (obj) => {
        if (typeof obj === 'string') {
            return checkSqlInjection(obj);
        }

        if (Array.isArray(obj)) {
            return obj.some(item => checkObject(item));
        }

        if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(value => checkObject(value));
        }

        return false;
    };

    // Проверяем только query параметры, так как body может содержать валидные данные
    if (checkObject(req.query)) {
        return res.status(400).json({
            error: 'Обнаружена подозрительная активность'
        });
    }

    next();
};

/**
 * Rate Limiting для специфических операций
 */
const createRateLimiter = (windowMs, max, message) => {
    const requests = new Map();

    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Очищаем старые записи
        for (const [ip, data] of requests.entries()) {
            if (now - data.resetTime > windowMs) {
                requests.delete(ip);
            }
        }

        const userRequests = requests.get(identifier) || { count: 0, resetTime: now };

        if (now - userRequests.resetTime > windowMs) {
            userRequests.count = 0;
            userRequests.resetTime = now;
        }

        userRequests.count++;
        requests.set(identifier, userRequests);

        if (userRequests.count > max) {
            return res.status(429).json({
                error: message || 'Слишком много запросов. Попробуйте позже.'
            });
        }

        next();
    };
};

module.exports = {
    xssProtection,
    contentSecurityPolicy,
    noSqlInjectionProtection,
    sqlInjectionProtection,
    createRateLimiter
};

