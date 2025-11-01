const express = require('express');
const bcrypt = require('bcrypt');
const { requireAdmin } = require('../lib/guards');
const { asyncHandler } = require('../lib/errorHandler');
const { AppError } = require('../lib/errorHandler');
const pool = require('../lib/db');
const logger = require('../lib/logger');
const { z } = require('zod');

const adminRouter = express.Router();

// Схема валидации для регистрации бизнеса
const businessRegisterSchema = z.object({
    email: z.string().email('Неверный формат email'),
    name: z.string().min(3, 'Название должно быть не короче 3 символов').max(100),
    password: z.string().min(6, 'Пароль должен быть не короче 6 символов').max(50),
    address: z.string().min(10, 'Адрес слишком короткий').max(200),
    coord_0: z.number().min(-90).max(90).optional(),
    coord_1: z.number().min(-180).max(180).optional(),
});

// Регистрация нового бизнеса (только для админа)
adminRouter.post('/register-business', requireAdmin, asyncHandler(async (req, res) => {
    // Валидация входных данных
    const validation = businessRegisterSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.errors[0].message, 400);
    }

    const { email, name, password, address, coord_0, coord_1 } = validation.data;

    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new AppError('Пользователь с таким email уже существует', 400);
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Используем координаты СПб по умолчанию, если не переданы
    const latitude = coord_0 || 59.9311;
    const longitude = coord_1 || 30.3609;

    // Создаем бизнес-аккаунт
    const result = await pool.query(
        `INSERT INTO users 
        (email, password_hash, name, address, coord_0, coord_1, is_business, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id, email, name, address, is_business, role, created_at`,
        [email, passwordHash, name, address, latitude, longitude, true, 'business']
    );

    const newBusiness = result.rows[0];

    res.status(201).json({
        success: true,
        message: 'Бизнес-аккаунт успешно создан',
        business: {
            id: newBusiness.id,
            email: newBusiness.email,
            name: newBusiness.name,
            address: newBusiness.address,
            is_business: newBusiness.is_business,
            role: newBusiness.role,
            created_at: newBusiness.created_at
        }
    });
}));

// Получить список всех бизнесов (только для админа)
adminRouter.get('/businesses', requireAdmin, asyncHandler(async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id, email, name, address, coord_0, coord_1, 
                is_business, role, created_at, 
                COALESCE(is_top, false) as is_top, 
                COALESCE(quality_score, 0) as quality_score
            FROM users 
            WHERE is_business = true 
            ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            businesses: result.rows
        });
    } catch (error) {
        logger.error("Error in /admin/businesses:", { 
            error: error.message, 
            stack: error.stack 
        });
        throw error;
    }
}));

// Получить статистику по платформе (только для админа)
adminRouter.get('/stats', requireAdmin, asyncHandler(async (req, res) => {
    // Количество пользователей
    const usersCount = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE is_business = false AND role = $1',
        ['customer']
    );

    // Количество бизнесов
    const businessCount = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE is_business = true'
    );

    // Количество офферов
    const offersCount = await pool.query(
        'SELECT COUNT(*) as count FROM offers'
    );

    // Количество заказов
    let ordersCount = { rows: [{ count: 0 }] };
    try {
        ordersCount = await pool.query('SELECT COUNT(*) as count FROM orders');
    } catch (e) {
        // Таблица orders может не существовать
    }

    res.json({
        success: true,
        stats: {
            users: parseInt(usersCount.rows[0].count),
            businesses: parseInt(businessCount.rows[0].count),
            offers: parseInt(offersCount.rows[0].count),
            orders: parseInt(ordersCount.rows[0].count)
        }
    });
}));

// Удалить бизнес (только для админа)
adminRouter.delete('/businesses/:id', requireAdmin, asyncHandler(async (req, res) => {
    const businessId = parseInt(req.params.id);

    if (isNaN(businessId)) {
        throw new AppError('Неверный ID бизнеса', 400);
    }

    // Проверяем, существует ли бизнес
    const business = await pool.query(
        'SELECT id, is_business FROM users WHERE id = $1',
        [businessId]
    );

    if (business.rows.length === 0) {
        throw new AppError('Бизнес не найден', 404);
    }

    if (!business.rows[0].is_business) {
        throw new AppError('Это не бизнес-аккаунт', 400);
    }

    // Удаляем бизнес
    await pool.query('DELETE FROM users WHERE id = $1', [businessId]);

    res.json({
        success: true,
        message: 'Бизнес успешно удален'
    });
}));

module.exports = adminRouter;

