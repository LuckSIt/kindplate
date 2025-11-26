const express = require('express');
const reviewsRouter = express.Router();
const pool = require('../lib/db');
const logger = require('../lib/logger');
const { AppError, asyncHandler } = require('../lib/errorHandler');
const { requireAuth, requireAdmin } = require('../lib/guards');
const { sanitizePlainTextFields } = require('../middleware/sanitization');
const { upload, processReviewPhotos } = require('../middleware/review-photos-upload');

// ============================================
// СПЕЦИФИЧНЫЕ МАРШРУТЫ (должны быть ДО маршрутов с параметрами)
// ============================================

// GET /reviews/business/:businessId - Получить отзывы для бизнеса
reviewsRouter.get('/business/:businessId', asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const ratingFilter = req.query.rating ? parseInt(req.query.rating) : null;

    logger.info('Fetching reviews for business', { businessId, limit, offset, ratingFilter });

    // Проверяем наличие таблицы reviews
    const tableCheck = await pool.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'reviews'
        );
    `);

    if (!tableCheck.rows[0].exists) {
        logger.warn('Reviews table does not exist');
        return res.json({
            success: true,
            data: {
                reviews: [],
                total: 0,
                avg_rating: 0
            }
        });
    }

    // Строим запрос с фильтрацией - показываем только опубликованные отзывы
    let query = `
        SELECT 
            r.id,
            r.user_id,
            r.business_id,
            r.order_id,
            r.rating,
            r.comment,
            r.photos,
            r.status,
            r.is_verified_purchase,
            r.created_at,
            u.name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.business_id = $1 AND r.status = 'published'
    `;
    const params = [businessId];

    if (ratingFilter) {
        query += ` AND r.rating = $${params.length + 1}`;
        params.push(ratingFilter);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Получаем общее количество отзывов и среднюю оценку (только опубликованные)
    let statsQuery = `SELECT COUNT(*) as total, COALESCE(AVG(rating), 0) as avg_rating 
                      FROM reviews WHERE business_id = $1 AND status = 'published'`;
    const statsParams = [businessId];

    if (ratingFilter) {
        statsQuery += ' AND rating = $2';
        statsParams.push(ratingFilter);
    }

    const statsResult = await pool.query(statsQuery, statsParams);
    const { total, avg_rating } = statsResult.rows[0];

    // Получаем распределение по рейтингу (только опубликованные)
    const distributionResult = await pool.query(
        `SELECT rating, COUNT(*) as count
         FROM reviews
         WHERE business_id = $1 AND status = 'published'
         GROUP BY rating
         ORDER BY rating DESC`,
        [businessId]
    );

    const ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    distributionResult.rows.forEach(row => {
        ratingDistribution[row.rating] = parseInt(row.count);
    });

    logger.info('Reviews fetched successfully', { 
        businessId, 
        count: result.rows.length, 
        total: parseInt(total),
        avg_rating: parseFloat(avg_rating)
    });

    res.json({
        success: true,
        data: {
            reviews: result.rows.map(review => ({
                id: review.id,
                user_id: review.user_id,
                user_name: review.user_name,
                business_id: review.business_id,
                order_id: review.order_id,
                rating: review.rating,
                comment: review.comment,
                photos: review.photos || [],
                is_verified_purchase: review.is_verified_purchase || false,
                created_at: review.created_at
            })),
            total: parseInt(total),
            avg_rating: parseFloat(avg_rating).toFixed(1),
            rating_distribution: ratingDistribution,
            limit,
            offset
        }
    });
}));

// GET /reviews/can-review/:orderId - Проверить, может ли пользователь оставить отзыв
reviewsRouter.get('/can-review/:orderId', requireAuth, asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const user_id = req.session.userId;

    logger.info('Checking if user can review order', { orderId, user_id });

    // Проверяем наличие таблицы reviews
    const tableCheck = await pool.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'reviews'
        );
    `);

    if (!tableCheck.rows[0].exists) {
        return res.json({
            success: true,
            data: {
                can_review: false,
                reason: 'REVIEWS_TABLE_NOT_FOUND'
            }
        });
    }

    // Проверяем, что заказ существует и принадлежит пользователю
    const orderCheck = await pool.query(
        'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2',
        [orderId, user_id]
    );

    if (orderCheck.rows.length === 0) {
        return res.json({
            success: true,
            data: {
                can_review: false,
                reason: 'ORDER_NOT_FOUND'
            }
        });
    }

    // Проверяем, что заказ завершен
    if (orderCheck.rows[0].status !== 'completed') {
        return res.json({
            success: true,
            data: {
                can_review: false,
                reason: 'ORDER_NOT_COMPLETED'
            }
        });
    }

    // Проверяем, не оставлен ли уже отзыв
    const existingReview = await pool.query(
        'SELECT id FROM reviews WHERE order_id = $1 AND user_id = $2',
        [orderId, user_id]
    );

    if (existingReview.rows.length > 0) {
        return res.json({
            success: true,
            data: {
                can_review: false,
                reason: 'REVIEW_ALREADY_EXISTS',
                review_id: existingReview.rows[0].id
            }
        });
    }

    res.json({
        success: true,
        data: {
            can_review: true
        }
    });
}));

// POST /reviews/admin/moderate/:id - Модерировать отзыв (админ)
reviewsRouter.post('/admin/moderate/:id', requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'publish' или 'reject'

    if (!action || !['publish', 'reject'].includes(action)) {
        throw new AppError('Необходимо указать action: publish или reject', 400, 'INVALID_ACTION');
    }

    logger.info('Moderating review', { review_id: id, action });

    // Проверяем наличие таблицы reviews
    const tableCheck = await pool.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'reviews'
        );
    `);

    if (!tableCheck.rows[0].exists) {
        throw new AppError('Таблица reviews не найдена', 404, 'TABLE_NOT_FOUND');
    }

    const newStatus = action === 'publish' ? 'published' : 'rejected';

    const result = await pool.query(
        'UPDATE reviews SET status = $1, moderated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
        [newStatus, id]
    );

    if (result.rows.length === 0) {
        throw new AppError('Отзыв не найден', 404, 'REVIEW_NOT_FOUND');
    }

    logger.info('Review moderated successfully', { review_id: id, new_status: newStatus });

    res.json({
        success: true,
        data: {
            id: result.rows[0].id,
            status: result.rows[0].status
        },
        message: action === 'publish' ? 'Отзыв опубликован' : 'Отзыв отклонен'
    });
}));

/**
 * Создать отзыв
 * POST /reviews
 * 
 * Body: {
 *   business_id: number,
 *   order_id?: number,
 *   rating: number (1-5),
 *   comment?: string
 * }
 */
reviewsRouter.post('/', requireAuth, upload, processReviewPhotos, sanitizePlainTextFields(['comment']), asyncHandler(async (req, res) => {
    const { business_id, order_id, rating, comment, is_verified_purchase } = req.body;
    const user_id = req.session.userId;
    const photos = req.body.photos || [];

    logger.info('Creating review', { user_id, business_id, order_id, rating });

    // Валидация
    if (!business_id) {
        throw new AppError('business_id обязателен', 400, 'MISSING_BUSINESS_ID');
    }

    if (!rating || rating < 1 || rating > 5) {
        throw new AppError('rating должен быть от 1 до 5', 400, 'INVALID_RATING');
    }

    // Проверяем, что business_id это действительно бизнес
    const businessCheck = await pool.query(
        'SELECT id, name FROM users WHERE id = $1 AND is_business = TRUE',
        [business_id]
    );

    if (businessCheck.rowCount === 0) {
        throw new AppError('Заведение не найдено', 404, 'BUSINESS_NOT_FOUND');
    }

    // Если указан order_id, проверяем, что заказ существует и принадлежит пользователю
    if (order_id) {
        // Проверяем наличие таблицы orders
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'orders'
            );
        `);

        if (tableCheck.rows[0].exists) {
            // Проверяем структуру таблицы (customer_id или user_id)
            const columnCheck = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'orders' 
                AND column_name IN ('user_id', 'customer_id')
            `);
            
            const hasUserId = columnCheck.rows.some(row => row.column_name === 'user_id');
            const customerField = hasUserId ? 'user_id' : 'customer_id';
            
            const orderCheck = await pool.query(
                `SELECT id, status, business_id, ${customerField} as customer_user_id
                 FROM orders 
                 WHERE id = $1`,
                [order_id]
        );

        if (orderCheck.rowCount === 0) {
                throw new AppError('Заказ не найден', 404, 'ORDER_NOT_FOUND');
            }

            const order = orderCheck.rows[0];

            // Проверяем, что заказ принадлежит пользователю
            if (order.customer_user_id !== user_id) {
                throw new AppError('Заказ не принадлежит вам', 403, 'ORDER_OWNER_MISMATCH');
            }

            // Проверяем, что заказ принадлежит этому заведению
            if (order.business_id !== business_id) {
                throw new AppError('Заказ не принадлежит этому заведению', 400, 'ORDER_BUSINESS_MISMATCH');
            }

            // Проверяем, что заказ завершен (статус completed или picked_up)
            if (order.status !== 'completed' && order.status !== 'picked_up') {
                throw new AppError('Отзыв можно оставить только на завершенный заказ', 400, 'ORDER_NOT_COMPLETED');
            }

            // Проверяем, что отзыв еще не оставлен на этот заказ
            const existingReview = await pool.query(
                'SELECT id FROM reviews WHERE user_id = $1 AND order_id = $2',
                [user_id, order_id]
        );

        if (existingReview.rowCount > 0) {
                throw new AppError('Вы уже оставили отзыв на этот заказ', 400, 'REVIEW_ALREADY_EXISTS');
            }
        } else {
            logger.warn('Orders table does not exist, skipping order validation');
        }
    }

    // Определяем is_verified_purchase: true если есть order_id, иначе из body
    const verifiedPurchase = order_id ? true : (is_verified_purchase === true || is_verified_purchase === 'true');

    // Создаем отзыв со статусом pending (требует модерации)
    const result = await pool.query(
        `INSERT INTO reviews (user_id, business_id, order_id, rating, comment, photos, status, is_verified_purchase)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
         RETURNING id, user_id, business_id, order_id, rating, comment, photos, status, is_verified_purchase, created_at`,
        [user_id, business_id, order_id || null, rating, comment || null, photos, verifiedPurchase]
    );

    const review = result.rows[0];

    logger.info('Review created successfully', { review_id: review.id, user_id, business_id });

    res.status(201).json({
        success: true,
        data: review,
        message: 'Отзыв успешно создан'
    });
}));

// Дубликат удален - маршрут уже определен выше

/**
 * Получить отзывы пользователя
 * GET /reviews/mine
 */
reviewsRouter.get('/mine', requireAuth, asyncHandler(async (req, res) => {
    const user_id = req.session.userId;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    logger.info('Fetching user reviews', { user_id, limit, offset });

    // Проверяем наличие таблицы reviews
    const tableCheck = await pool.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'reviews'
        );
    `);

    if (!tableCheck.rows[0].exists) {
        logger.warn('Reviews table does not exist');
        return res.json({
            success: true,
            data: {
                reviews: [],
                total: 0
            }
        });
    }

        const result = await pool.query(
            `SELECT 
                r.id,
                r.user_id,
                r.business_id,
                r.order_id,
                r.rating,
                r.comment,
                r.photos,
                r.status,
                r.is_verified_purchase,
                r.created_at,
                b.name as business_name,
                b.logo_url as business_logo
             FROM reviews r
             JOIN users b ON r.business_id = b.id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
        [user_id, limit, offset]
    );

    const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM reviews WHERE user_id = $1',
        [user_id]
    );

    logger.info('User reviews fetched successfully', { 
        user_id, 
        count: result.rows.length,
        total: parseInt(countResult.rows[0].total)
    });

    res.json({
        success: true,
        data: {
            reviews: result.rows.map(review => ({
                id: review.id,
                business_id: review.business_id,
                business_name: review.business_name,
                business_logo: review.business_logo,
                order_id: review.order_id,
                rating: review.rating,
                comment: review.comment,
                photos: review.photos || [],
                status: review.status,
                is_verified_purchase: review.is_verified_purchase || false,
                created_at: review.created_at
            })),
            total: parseInt(countResult.rows[0].total),
            limit,
            offset
        }
    });
}));

/**
 * Обновить отзыв
 * PUT /reviews/:id
 */
reviewsRouter.put('/:id', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.session.userId;

    logger.info('Updating review', { review_id: id, user_id, rating });

    // Валидация
    if (rating && (rating < 1 || rating > 5)) {
        throw new AppError('rating должен быть от 1 до 5', 400, 'INVALID_RATING');
    }

    // Проверяем, что отзыв существует и принадлежит пользователю
    const reviewCheck = await pool.query(
        'SELECT id, user_id FROM reviews WHERE id = $1',
        [id]
    );

    if (reviewCheck.rowCount === 0) {
        throw new AppError('Отзыв не найден', 404, 'REVIEW_NOT_FOUND');
    }

    if (reviewCheck.rows[0].user_id !== user_id) {
        throw new AppError('Вы можете редактировать только свои отзывы', 403, 'FORBIDDEN');
    }

    // Обновляем отзыв
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (rating !== undefined) {
        updateFields.push(`rating = $${paramIndex++}`);
        values.push(rating);
    }

    if (comment !== undefined) {
        updateFields.push(`comment = $${paramIndex++}`);
        values.push(comment);
    }

    if (updateFields.length === 0) {
        throw new AppError('Нет полей для обновления', 400, 'NO_FIELDS_TO_UPDATE');
    }

    values.push(id);

        const result = await pool.query(
        `UPDATE reviews 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, user_id, business_id, order_id, rating, comment, created_at, updated_at`,
        values
    );

    logger.info('Review updated successfully', { review_id: id, user_id });

    res.json({
        success: true,
        data: result.rows[0],
        message: 'Отзыв успешно обновлен'
    });
}));

/**
 * Удалить отзыв
 * DELETE /reviews/:id
 */
reviewsRouter.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user_id = req.session.userId;

    logger.info('Deleting review', { review_id: id, user_id });

    // Проверяем, что отзыв существует и принадлежит пользователю
    const reviewCheck = await pool.query(
        'SELECT id, user_id FROM reviews WHERE id = $1',
        [id]
    );

    if (reviewCheck.rowCount === 0) {
        throw new AppError('Отзыв не найден', 404, 'REVIEW_NOT_FOUND');
    }

    if (reviewCheck.rows[0].user_id !== user_id) {
        throw new AppError('Вы можете удалять только свои отзывы', 403, 'FORBIDDEN');
    }

    // Удаляем отзыв
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    logger.info('Review deleted successfully', { review_id: id, user_id });

    res.json({
        success: true,
        message: 'Отзыв успешно удален'
    });
}));

// Дубликат удален - маршрут уже определен выше

/**
 * Админ: Получить отзывы на модерации
 * GET /reviews/admin/pending
 */
reviewsRouter.get('/admin/pending', requireAdmin, asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    logger.info('Fetching pending reviews for moderation', { limit, offset });

    const result = await pool.query(
        `SELECT 
            r.id,
            r.user_id,
            r.business_id,
            r.order_id,
            r.rating,
            r.comment,
            r.photos,
            r.status,
            r.is_verified_purchase,
            r.created_at,
            u.name as user_name,
            b.name as business_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         JOIN users b ON r.business_id = b.id
         WHERE r.status = 'pending'
         ORDER BY r.created_at ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM reviews WHERE status = $1',
        ['pending']
    );

    res.json({
        success: true,
        data: {
            reviews: result.rows.map(review => ({
                id: review.id,
                user_id: review.user_id,
                user_name: review.user_name,
                business_id: review.business_id,
                business_name: review.business_name,
                order_id: review.order_id,
                rating: review.rating,
                comment: review.comment,
                photos: review.photos || [],
                is_verified_purchase: review.is_verified_purchase || false,
                created_at: review.created_at
            })),
            total: parseInt(countResult.rows[0].total),
            limit,
            offset
        }
    });
}));

/**
 * Админ: Модерировать отзыв
 * POST /reviews/admin/moderate/:id
 * 
 * Body: {
 *   action: 'publish' | 'reject',
 *   reason?: string (для reject)
 * }
 */
reviewsRouter.post('/admin/moderate/:id', requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, reason } = req.body;
    const moderator_id = req.session.userId;

    logger.info('Moderating review', { review_id: id, action, moderator_id });

    if (!action || !['publish', 'reject'].includes(action)) {
        throw new AppError('action должен быть "publish" или "reject"', 400, 'INVALID_ACTION');
    }

    // Проверяем, что отзыв существует и на модерации
    const reviewCheck = await pool.query(
        'SELECT id, status FROM reviews WHERE id = $1',
        [id]
    );

    if (reviewCheck.rowCount === 0) {
        throw new AppError('Отзыв не найден', 404, 'REVIEW_NOT_FOUND');
    }

    if (reviewCheck.rows[0].status !== 'pending') {
        throw new AppError('Отзыв уже прошел модерацию', 400, 'REVIEW_ALREADY_MODERATED');
    }

    const newStatus = action === 'publish' ? 'published' : 'rejected';

    // Обновляем статус отзыва
    const result = await pool.query(
        `UPDATE reviews 
         SET status = $1, 
             moderated_at = CURRENT_TIMESTAMP,
             moderated_by = $2
         WHERE id = $3
         RETURNING id, status, moderated_at, moderated_by`,
        [newStatus, moderator_id, id]
    );

    logger.info('Review moderated successfully', { 
        review_id: id, 
        action, 
        new_status: newStatus,
        moderator_id 
    });

    res.json({
        success: true,
        data: result.rows[0],
        message: action === 'publish' ? 'Отзыв опубликован' : 'Отзыв отклонен'
    });
}));

module.exports = reviewsRouter;
