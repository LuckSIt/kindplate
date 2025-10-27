/**
 * HTML Sanitization Middleware
 * Очистка HTML от потенциально опасных элементов
 */

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Создаем экземпляр DOMPurify для Node.js
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Конфигурация для DOMPurify
 */
const SANITIZE_CONFIG = {
    // Разрешаем только безопасные теги
    ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre'
    ],
    // Разрешаем только безопасные атрибуты
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    // Запрещаем все URI схемы кроме http/https
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Принудительно добавляем rel="noopener noreferrer" ко всем ссылкам
    ADD_ATTR: ['target="_blank"', 'rel="noopener noreferrer"'],
};

/**
 * Очищает HTML строку от потенциально опасного контента
 * @param {string} html - HTML строка для очистки
 * @returns {string} - Очищенная HTML строка
 */
function sanitizeHtml(html) {
    if (!html || typeof html !== 'string') {
        return '';
    }
    
    return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

/**
 * Middleware для очистки HTML в определенных полях запроса
 * @param {string[]} fields - Массив полей для очистки
 */
function sanitizeHtmlFields(fields = []) {
    return (req, res, next) => {
        if (!req.body) {
            return next();
        }

        for (const field of fields) {
            if (req.body[field] && typeof req.body[field] === 'string') {
                // Проверяем, содержит ли поле HTML теги
                if (/<[a-z][\s\S]*>/i.test(req.body[field])) {
                    req.body[field] = sanitizeHtml(req.body[field]);
                }
            }
        }

        next();
    };
}

/**
 * Очищает plain text от потенциально опасных символов
 * Используется для полей, которые не должны содержать HTML
 * @param {string} text - Текст для очистки
 * @returns {string} - Очищенный текст
 */
function sanitizePlainText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Middleware для очистки plain text полей
 * @param {string[]} fields - Массив полей для очистки
 */
function sanitizePlainTextFields(fields = []) {
    return (req, res, next) => {
        if (!req.body) {
            return next();
        }

        for (const field of fields) {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = sanitizePlainText(req.body[field]);
            }
        }

        next();
    };
}

/**
 * Удаляет потенциально опасные символы из имен файлов
 * @param {string} filename - Имя файла
 * @returns {string} - Безопасное имя файла
 */
function sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
        return 'unnamed';
    }
    
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Заменяем все небезопасные символы на _
        .replace(/\.{2,}/g, '.') // Удаляем множественные точки
        .replace(/^\.+/, '') // Удаляем точки в начале
        .substring(0, 255); // Ограничиваем длину
}

/**
 * Middleware для валидации и очистки URL
 */
function sanitizeUrl() {
    return (req, res, next) => {
        if (req.body.url) {
            try {
                const url = new URL(req.body.url);
                // Разрешаем только http и https протоколы
                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    return res.status(400).json({
                        error: 'Недопустимый URL',
                        message: 'URL должен использовать протокол http или https'
                    });
                }
                req.body.url = url.toString();
            } catch (error) {
                return res.status(400).json({
                    error: 'Недопустимый URL',
                    message: 'Предоставлен некорректный URL'
                });
            }
        }
        next();
    };
}

/**
 * Универсальный sanitizer для всего body
 * Рекурсивно очищает все строковые значения
 */
function sanitizeBody() {
    return (req, res, next) => {
        if (!req.body) {
            return next();
        }

        req.body = deepSanitize(req.body);
        next();
    };
}

function deepSanitize(obj) {
    if (typeof obj === 'string') {
        // Базовая очистка для всех строк
        return obj.trim();
    }
    
    if (Array.isArray(obj)) {
        return obj.map(deepSanitize);
    }
    
    if (obj !== null && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = deepSanitize(obj[key]);
            }
        }
        return sanitized;
    }
    
    return obj;
}

module.exports = {
    sanitizeHtml,
    sanitizeHtmlFields,
    sanitizePlainText,
    sanitizePlainTextFields,
    sanitizeFilename,
    sanitizeUrl,
    sanitizeBody,
    SANITIZE_CONFIG,
};

