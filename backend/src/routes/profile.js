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
const storage = require("../lib/storage");
const fs = require("fs");
const { uploadConfigs, handleUploadError } = require("../middleware/upload");

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

    // Определяем доступные колонки, чтобы не падать на старой схеме БД
    const columnsRes = await pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'users'`
    );
    const cols = columnsRes.rows.map(r => r.column_name);
    const has = (c) => cols.includes(c);

    const selectSql = `
        SELECT 
            id,
            name,
            email,
            ${has('phone') ? 'phone' : 'NULL::text AS phone'},
            ${has('is_business') ? 'is_business' : 'false AS is_business'},
            ${has('address') ? 'address' : 'NULL::text AS address'},
            ${has('coord_0') ? 'coord_0' : 'NULL::numeric AS coord_0'},
            ${has('coord_1') ? 'coord_1' : 'NULL::numeric AS coord_1'},
            ${has('working_hours') ? 'working_hours' : 'NULL::text AS working_hours'},
            ${has('website') ? 'website' : 'NULL::text AS website'},
            ${has('rating') ? 'rating' : '0::numeric AS rating'},
            ${has('total_reviews') ? 'total_reviews' : '0::integer AS total_reviews'},
            ${has('terms_accepted') ? 'terms_accepted' : 'false AS terms_accepted'},
            ${has('privacy_accepted') ? 'privacy_accepted' : 'false AS privacy_accepted'},
            ${has('profile_updated_at') ? 'profile_updated_at' : 'NULL::timestamp AS profile_updated_at'},
            ${has('created_at') ? 'created_at' : 'NOW() AS created_at'},
            ${has('logo_url') ? 'logo_url' : 'NULL::text AS logo_url'},
            ${has('establishment_type') ? 'establishment_type' : 'NULL::text AS establishment_type'}
        FROM users
        WHERE id = $1
    `;

    const result = await pool.query(selectSql, [userId]);

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
    const { name, phone, address, coords, working_hours, website } = req.body;
    // Явно читаем тип заведения (иногда приходит вложенно или под другим content-type)
    const establishment_type = req.body.establishment_type ?? req.body.data?.establishment_type;

    logger.info('Updating profile', { userId, updates: Object.keys(req.body), establishment_type });

    // Проверяем наличие колонок в БД
    const columnsRes = await pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'users'`
    );
    const cols = columnsRes.rows.map(r => r.column_name);
    const has = (c) => cols.includes(c);

    // Валидация
    if (name !== undefined && (!name || name.trim().length < 2)) {
        throw new AppError('Имя должно содержать минимум 2 символа', 400, 'INVALID_NAME');
    }

    if (phone !== undefined && !validatePhone(phone)) {
        throw new AppError('Некорректный формат телефона', 400, 'INVALID_PHONE');
    }

    if (website !== undefined && website && !/^https?:\/\/.+/.test(website)) {
        throw new AppError('Некорректный формат URL сайта. Используйте формат http:// или https://', 400, 'INVALID_WEBSITE');
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

    if (working_hours !== undefined && has('working_hours')) {
        updates.push(`working_hours = $${paramIndex++}`);
        values.push(working_hours || null);
    }

    if (website !== undefined && has('website')) {
        updates.push(`website = $${paramIndex++}`);
        values.push(website || null);
    }

    if (establishment_type !== undefined) {
        if (has('establishment_type')) {
            updates.push(`establishment_type = $${paramIndex++}`);
            values.push(establishment_type != null && String(establishment_type).trim() ? String(establishment_type).trim().slice(0, 100) : null);
        } else {
            logger.warn('establishment_type передан, но колонки нет в БД. Выполните миграцию: backend/migrations/add-establishment-type.sql');
            // Отдаём клиенту понятную ошибку, чтобы в интерфейсе не «залипало» значение
            throw new AppError('Сохранение типа заведения временно недоступно. Обратитесь к администратору.', 400, 'MIGRATION_REQUIRED');
        }
    }

    if (updates.length === 0) {
        throw new AppError('Нет данных для обновления', 400, 'NO_UPDATES');
    }

    values.push(userId);

    const returnFields = [
        'id', 'name', 'email', 
        has('phone') ? 'phone' : 'NULL::text AS phone',
        'is_business', 
        has('address') ? 'address' : 'NULL::text AS address',
        has('coord_0') ? 'coord_0' : 'NULL::numeric AS coord_0',
        has('coord_1') ? 'coord_1' : 'NULL::numeric AS coord_1',
        has('working_hours') ? 'working_hours' : 'NULL::text AS working_hours',
        has('website') ? 'website' : 'NULL::text AS website',
        has('establishment_type') ? 'establishment_type' : 'NULL::text AS establishment_type',
        has('profile_updated_at') ? 'profile_updated_at' : 'NULL::timestamp AS profile_updated_at'
    ].join(', ');

    const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING ${returnFields}
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];
    if (user.coord_0 !== null && user.coord_1 !== null) {
        user.coords = [user.coord_0, user.coord_1];
    } else {
        user.coords = null;
    }
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
 * POST /profile/logo - Загрузить фото заведения (только для бизнес-аккаунтов).
 * Поле формы: logo. Сохраняется в users.logo_url, отображается на /list.
 */
profileRouter.post("/logo", requireAuth, uploadConfigs.logos.single("logo"), handleUploadError, asyncHandler(async (req, res) => {
    const userId = req.session.userId;

    if (!req.file) {
        throw new AppError("Файл не загружен. Выберите изображение (JPEG, PNG, WebP, до 3 МБ).", 400, "NO_FILE");
    }

    const columnsRes = await pool.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'users'`
    );
    const cols = columnsRes.rows.map(r => r.column_name);
    if (!cols.includes("logo_url")) {
        throw new AppError("Функция фото заведения недоступна в данной конфигурации.", 500, "NO_LOGO_COLUMN");
    }

    const check = await pool.query("SELECT is_business FROM users WHERE id = $1", [userId]);
    if (check.rowCount === 0) {
        throw new AppError("Пользователь не найден", 404, "USER_NOT_FOUND");
    }
    if (!check.rows[0].is_business) {
        throw new AppError("Загружать фото заведения могут только бизнес-аккаунты.", 403, "NOT_BUSINESS");
    }

    const logo_url = "/uploads/logos/" + req.file.filename;
    if (storage.isS3Enabled()) {
        const key = "logos/" + req.file.filename;
        const ok = await storage.uploadToS3(req.file.path, key, req.file.mimetype || "image/jpeg");
        if (ok) try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    await pool.query("UPDATE users SET logo_url = $1 WHERE id = $2", [logo_url, userId]);

    logger.info("Profile logo uploaded", { userId, logo_url });

    res.json({
        success: true,
        message: "Фото заведения обновлено",
        logo_url,
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
    if (req.session) {
        req.session.userId = undefined;
        req.session.isBusiness = undefined;
    }

    logger.warn('Account deleted', { userId });

    res.json({
        success: true,
        message: 'Аккаунт успешно удален'
    });
}));

module.exports = profileRouter;




