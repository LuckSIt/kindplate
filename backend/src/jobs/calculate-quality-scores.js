require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../lib/logger');

// Создаем пул с явными credentials для крон-джоба
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kindplate',
    password: process.env.DB_PASSWORD || '12345678',
    port: process.env.DB_PORT || 5432,
});

/**
 * Крон-джоб для расчета качества продавцов
 * Запускается периодически (например, раз в день)
 * 
 * Критерии качества:
 * - Конверсия заказов (completed/total) - 30%
 * - Средняя оценка - 25%
 * - Процент повторных клиентов - 25%
 * - Общее количество заказов (активность) - 20%
 */

const QUALITY_WEIGHTS = {
    COMPLETION_RATE: 0.30,    // Процент завершенных заказов
    AVG_RATING: 0.25,          // Средняя оценка (1-5)
    REPEAT_RATE: 0.25,         // Процент повторных клиентов
    ACTIVITY: 0.20             // Активность (количество заказов)
};

const THRESHOLDS = {
    MIN_ORDERS: 10,            // Минимум заказов для получения бейджа
    MIN_QUALITY_SCORE: 75,     // Минимальный балл для "Лучшие у нас"
    MIN_COMPLETION_RATE: 0.90, // Минимум 90% завершенных заказов
    MIN_AVG_RATING: 4.5        // Минимальная средняя оценка 4.5
};

/**
 * Рассчитывает балл качества для продавца
 */
function calculateQualityScore(metrics) {
    const {
        total_orders,
        completed_orders,
        repeat_customers,
        avg_rating,
        unique_customers
    } = metrics;

    // Если недостаточно заказов, возвращаем 0
    if (total_orders < QUALITY_WEIGHTS.MIN_ORDERS) {
        return 0;
    }

    // 1. Процент завершенных заказов (0-100)
    const completionRate = total_orders > 0 
        ? (completed_orders / total_orders) * 100 
        : 0;

    // 2. Оценка (нормализуем 1-5 к 0-100)
    const ratingScore = (avg_rating / 5) * 100;

    // 3. Процент повторных клиентов (0-100)
    const repeatRate = unique_customers > 0 
        ? (repeat_customers / unique_customers) * 100 
        : 0;

    // 4. Активность (логарифмическая шкала, макс 100)
    const activityScore = Math.min(100, Math.log10(total_orders + 1) * 50);

    // Итоговый балл (взвешенная сумма)
    const qualityScore = 
        completionRate * QUALITY_WEIGHTS.COMPLETION_RATE +
        ratingScore * QUALITY_WEIGHTS.AVG_RATING +
        repeatRate * QUALITY_WEIGHTS.REPEAT_RATE +
        activityScore * QUALITY_WEIGHTS.ACTIVITY;

    return Math.round(qualityScore * 100) / 100; // Округляем до 2 знаков
}

/**
 * Определяет, заслуживает ли продавец бейдж "Лучшие у нас"
 */
function isTopVendor(metrics, qualityScore) {
    const {
        total_orders,
        completed_orders,
        avg_rating
    } = metrics;

    const completionRate = total_orders > 0 
        ? completed_orders / total_orders 
        : 0;

    return (
        total_orders >= THRESHOLDS.MIN_ORDERS &&
        qualityScore >= THRESHOLDS.MIN_QUALITY_SCORE &&
        completionRate >= THRESHOLDS.MIN_COMPLETION_RATE &&
        avg_rating >= THRESHOLDS.MIN_AVG_RATING
    );
}

/**
 * Основная функция расчета качества для всех продавцов
 */
async function calculateQualityScores() {
    const startTime = Date.now();
    logger.info('🔄 Запуск расчета качества продавцов...');

    try {
        // Получаем всех бизнес-пользователей
        const businessesResult = await pool.query(`
            SELECT id, name, email
            FROM users
            WHERE is_business = TRUE
        `);

        const businesses = businessesResult.rows;
        logger.info(`📊 Найдено бизнес-аккаунтов: ${businesses.length}`);

        let updatedCount = 0;
        let topVendorsCount = 0;

        for (const business of businesses) {
            try {
                // Собираем метрики для каждого продавца
                const metrics = await collectVendorMetrics(business.id);
                
                // Рассчитываем балл качества
                const qualityScore = calculateQualityScore(metrics);
                
                // Определяем, топовый ли продавец
                const isTop = isTopVendor(metrics, qualityScore);

                // Обновляем данные в БД
                await pool.query(`
                    UPDATE users
                    SET 
                        is_top = $1,
                        quality_score = $2,
                        total_orders = $3,
                        completed_orders = $4,
                        repeat_customers = $5,
                        avg_rating = $6
                    WHERE id = $7
                `, [
                    isTop,
                    qualityScore,
                    metrics.total_orders,
                    metrics.completed_orders,
                    metrics.repeat_customers,
                    metrics.avg_rating,
                    business.id
                ]);

                updatedCount++;
                if (isTop) {
                    topVendorsCount++;
                    logger.info(`⭐ ${business.name} получил бейдж "Лучшие у нас" (балл: ${qualityScore})`);
                }

            } catch (error) {
                logger.error(`❌ Ошибка при расчете качества для ${business.name}:`, error);
            }
        }

        const duration = Date.now() - startTime;
        logger.info(`✅ Расчет завершен за ${duration}ms`);
        logger.info(`📈 Обновлено продавцов: ${updatedCount}`);
        logger.info(`⭐ Топовых продавцов: ${topVendorsCount}`);

        return {
            success: true,
            updated: updatedCount,
            topVendors: topVendorsCount,
            duration
        };

    } catch (error) {
        logger.error('❌ Ошибка при расчете качества продавцов:', error);
        throw error;
    }
}

/**
 * Собирает метрики для конкретного продавца
 */
async function collectVendorMetrics(businessId) {
    // Проверяем наличие таблицы orders
    const tableCheck = await pool.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'orders'
        );
    `);

    if (!tableCheck.rows[0].exists) {
        // Если таблица не существует, возвращаем нулевые метрики
        return {
            total_orders: 0,
            completed_orders: 0,
            repeat_customers: 0,
            avg_rating: 0,
            unique_customers: 0
        };
    }

    try {
        // Общее количество заказов и завершенных
        const ordersResult = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
            FROM orders
            WHERE business_id = $1
        `, [businessId]);

        // Уникальные клиенты и повторные покупатели
        const customersResult = await pool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as unique_customers,
                COUNT(*) FILTER (WHERE order_count > 1) as repeat_customers
            FROM (
                SELECT user_id, COUNT(*) as order_count
                FROM orders
                WHERE business_id = $1
                GROUP BY user_id
            ) customer_orders
        `, [businessId]);

        // Средняя оценка (если есть таблица reviews)
        let avgRating = 0;
        try {
            const reviewsCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'reviews'
                );
            `);

            if (reviewsCheck.rows[0].exists) {
                const ratingResult = await pool.query(`
                    SELECT COALESCE(AVG(rating), 0) as avg_rating
                    FROM reviews
                    WHERE business_id = $1
                `, [businessId]);
                avgRating = parseFloat(ratingResult.rows[0].avg_rating) || 0;
            }
        } catch (reviewError) {
            logger.warn(`⚠️ Не удалось получить оценки для бизнеса ${businessId}`);
        }

        return {
            total_orders: parseInt(ordersResult.rows[0].total_orders) || 0,
            completed_orders: parseInt(ordersResult.rows[0].completed_orders) || 0,
            repeat_customers: parseInt(customersResult.rows[0].repeat_customers) || 0,
            avg_rating: Math.round(avgRating * 100) / 100,
            unique_customers: parseInt(customersResult.rows[0].unique_customers) || 0
        };
    } catch (error) {
        logger.error(`❌ Ошибка при сборе метрик для бизнеса ${businessId}:`, error);
        return {
            total_orders: 0,
            completed_orders: 0,
            repeat_customers: 0,
            avg_rating: 0,
            unique_customers: 0
        };
    }
}

/**
 * Экспортируем функцию для использования в крон-джобе или API
 */
module.exports = {
    calculateQualityScores,
    collectVendorMetrics,
    calculateQualityScore,
    isTopVendor,
    THRESHOLDS
};

// Если запускается напрямую
if (require.main === module) {
    calculateQualityScores()
        .then((result) => {
            console.log('✅ Результат:', result);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Ошибка:', error);
            process.exit(1);
        });
}

