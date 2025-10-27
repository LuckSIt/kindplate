const logger = require('./logger');

// Централизованная обработка ошибок
class AppError extends Error {
    constructor(message, statusCode, errorCode = 'UNKNOWN_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Обработчик ошибок для Express
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Логируем ошибку
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Ошибки валидации Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400, 'VALIDATION_ERROR');
    }

    // Ошибки дублирования ключей
    if (err.code === 11000) {
        const message = 'Дублирование данных';
        error = new AppError(message, 400, 'DUPLICATE_ERROR');
    }

    // Ошибки JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'Недействительный токен';
        error = new AppError(message, 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Токен истек';
        error = new AppError(message, 401, 'TOKEN_EXPIRED');
    }

    // Ошибки PostgreSQL
    if (err.code === '23505') { // unique_violation
        const message = 'Данные уже существуют';
        error = new AppError(message, 400, 'DUPLICATE_ERROR');
    }

    if (err.code === '23503') { // foreign_key_violation
        const message = 'Нарушение связей между таблицами';
        error = new AppError(message, 400, 'FOREIGN_KEY_ERROR');
    }

    if (err.code === '23502') { // not_null_violation
        const message = 'Обязательные поля не заполнены';
        error = new AppError(message, 400, 'NULL_VALUE_ERROR');
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.errorCode || 'UNKNOWN_ERROR',
        message: error.message || 'Внутренняя ошибка сервера',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Обработчик для несуществующих маршрутов
const notFound = (req, res, next) => {
    const error = new AppError(`Маршрут ${req.originalUrl} не найден`, 404, 'ROUTE_NOT_FOUND');
    next(error);
};

// Асинхронный обработчик ошибок
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    asyncHandler
};



