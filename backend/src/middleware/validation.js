/**
 * Validation Middleware using Zod
 * Защита от невалидных данных
 */

const { z } = require('zod');

/**
 * Middleware для валидации body через Zod схему
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Ошибка валидации',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            next(error);
        }
    };
};

/**
 * Middleware для валидации query параметров
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.query = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Ошибка валидации параметров',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            next(error);
        }
    };
};

/**
 * Middleware для валидации params
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.params);
            req.params = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Ошибка валидации параметров URL',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            next(error);
        }
    };
};

// Общие схемы для переиспользования
const schemas = {
    // ID параметр
    id: z.object({
        id: z.string().regex(/^\d+$/).transform(Number)
    }),

    // Пагинация
    pagination: z.object({
        limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
        offset: z.string().regex(/^\d+$/).transform(Number).default('0')
    }).partial(),

    // Координаты для карты
    mapBounds: z.object({
        north: z.string().regex(/^-?\d+\.?\d*$/).transform(Number),
        south: z.string().regex(/^-?\d+\.?\d*$/).transform(Number),
        east: z.string().regex(/^-?\d+\.?\d*$/).transform(Number),
        west: z.string().regex(/^-?\d+\.?\d*$/).transform(Number),
        search: z.string().optional()
    }),

    // Email
    email: z.string().email('Неверный формат email'),

    // Телефон (РФ формат)
    phone: z.string().regex(/^\+?[78][\d\s\-()]{10,}$/, 'Неверный формат телефона'),

    // Пароль
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),

    // Рейтинг
    rating: z.number().min(1).max(5),

    // Статус заказа
    orderStatus: z.enum(['pending', 'confirmed', 'ready', 'completed', 'cancelled'])
};

module.exports = {
    validateBody,
    validateQuery,
    validateParams,
    schemas
};

