/**
 * Profile Routes
 * API endpoints для управления профилем пользователя
 */

const express = require("express");
const profileRouter = express.Router();
const pool = require("../lib/db");
const logger = require("../lib/logger");
const { AppError, asyncHandler } = require("../lib/errorHandler");
const { requireAuth } = require("../lib/guards");

// Валидация телефона (простая проверка)
function validatePhone(phone) {
    if (!phone) return true; // Телефон опционален
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 20;
}

/**
 * GET /profile - Получить профиль текущего пользователя
 */
profileRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.session.userId;

    logger.info('Fetching profile', { userId });

    const result = await pool.query(
        `SELECT 
            id, 
            name, 
            email, 
            phone,
            is_business, 
            address, 
            coord_0, 
            coord_1, 
            rating, 
            total_reviews,
            terms_accepted,
            privacy_accepted,
            profile_updated_at,
            created_at
        FROM users 
        WHERE id=$1`,
        [userId]
    );

    if (result.rowCount === 0) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];
    user.coords = [user.coord_0, user.coord_1];
    delete user.coord_0;
    delete user.coord_1;

    res.json({
        success: true,
        profile: user
    });
}));

/**
 * PUT /profile - Обновить профиль текущего пользователя
 */
profileRouter.put("/", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { name, phone, address, coords } = req.body;

    logger.info('Updating profile', { userId, updates: Object.keys(req.body) });

    // Валидация
    if (name !== undefined && (!name || name.trim().length < 2)) {
        throw new AppError('Имя должно содержать минимум 2 символа', 400, 'INVALID_NAME');
    }

    if (phone !== undefined && !validatePhone(phone)) {
        throw new AppError('Некорректный формат телефона', 400, 'INVALID_PHONE');
    }

    // Формируем запрос на обновление
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name.trim());
    }

    if (phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(phone || null);
    }

    if (address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(address);
    }

    if (coords !== undefined && Array.isArray(coords) && coords.length === 2) {
        updates.push(`coord_0 = $${paramIndex++}`);
        values.push(coords[0]);
        updates.push(`coord_1 = $${paramIndex++}`);
        values.push(coords[1]);
    }

    if (updates.length === 0) {
        throw new AppError('Нет данных для обновления', 400, 'NO_UPDATES');
    }

    values.push(userId);

    const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, email, phone, is_business, address, coord_0, coord_1, profile_updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];
    user.coords = [user.coord_0, user.coord_1];
    delete user.coord_0;
    delete user.coord_1;

    logger.info('Profile updated successfully', { userId });

    res.json({
        success: true,
        message: 'Профиль успешно обновлен',
        profile: user
    });
}));

/**
 * POST /profile/accept-terms - Принять оферту и согласие на обработку ПДн
 */
profileRouter.post("/accept-terms", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { terms, privacy } = req.body;

    logger.info('Accepting terms', { userId, terms, privacy });

    if (typeof terms !== 'boolean' || typeof privacy !== 'boolean') {
        throw new AppError('Необходимо явное согласие', 400, 'INVALID_CONSENT');
    }

    await pool.query(
        `UPDATE users 
         SET terms_accepted = $1, privacy_accepted = $2 
         WHERE id = $3`,
        [terms, privacy, userId]
    );

    logger.info('Terms accepted', { userId });

    res.json({
        success: true,
        message: 'Согласия успешно сохранены'
    });
}));

/**
 * POST /profile/change-password - Изменить пароль
 */
profileRouter.post("/change-password", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { currentPassword, newPassword } = req.body;

    logger.info('Password change attempt', { userId });

    if (!currentPassword || !newPassword) {
        throw new AppError('Необходимо указать текущий и новый пароль', 400, 'MISSING_PASSWORDS');
    }

    if (newPassword.length < 6) {
        throw new AppError('Новый пароль должен содержать минимум 6 символов', 400, 'WEAK_PASSWORD');
    }

    // Получаем текущий хэш пароля
    const result = await pool.query(
        'SELECT password_hash FROM users WHERE id=$1',
        [userId]
    );

    if (result.rowCount === 0) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const { password_hash } = result.rows[0];
    const bcrypt = require('bcrypt');

    // Проверяем текущий пароль
    const isValid = await bcrypt.compare(currentPassword, password_hash);
    if (!isValid) {
        logger.warn('Password change failed - invalid current password', { userId });
        throw new AppError('Неверный текущий пароль', 401, 'INVALID_PASSWORD');
    }

    // Хэшируем новый пароль
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Обновляем пароль
    await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
    );

    logger.info('Password changed successfully', { userId });

    res.json({
        success: true,
        message: 'Пароль успешно изменен'
    });
}));

/**
 * DELETE /profile - Удалить аккаунт (опционально)
 */
profileRouter.delete("/", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { password } = req.body;

    logger.warn('Account deletion attempt', { userId });

    if (!password) {
        throw new AppError('Необходимо подтвердить пароль', 400, 'PASSWORD_REQUIRED');
    }

    // Проверяем пароль
    const result = await pool.query(
        'SELECT password_hash FROM users WHERE id=$1',
        [userId]
    );

    if (result.rowCount === 0) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const { password_hash } = result.rows[0];
    const bcrypt = require('bcrypt');

    const isValid = await bcrypt.compare(password, password_hash);
    if (!isValid) {
        logger.warn('Account deletion failed - invalid password', { userId });
        throw new AppError('Неверный пароль', 401, 'INVALID_PASSWORD');
    }

    // Удаляем пользователя (CASCADE удалит связанные записи)
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);

    // Очищаем сессию
    req.session.userId = undefined;
    req.session.isBusiness = undefined;

    logger.warn('Account deleted', { userId });

    res.json({
        success: true,
        message: 'Аккаунт успешно удален'
    });
}));

module.exports = profileRouter;




