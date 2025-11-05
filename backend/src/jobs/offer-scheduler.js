require('dotenv').config();
const cron = require('node-cron');
const pool = require('../lib/db');
const logger = require('../lib/logger');
const webpush = require('web-push');

// VAPID ключи для web-push (должны быть в .env)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@kindplate.ru';

// Настраиваем web-push если ключи есть
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Планировщик для активации/деактивации офферов по расписанию
 * Запускается каждую минуту
 */
async function processScheduledOffers() {
    const now = new Date();
    logger.info(`🕐 Обработка расписания офферов: ${now.toISOString()}`);

    try {
        // 1. Активируем офферы, которые должны быть опубликованы
        const activateResult = await pool.query(
            `UPDATE offers o
             SET is_active = true
             FROM offer_schedules s
             WHERE o.id = s.offer_id
             AND s.is_active = true
             AND s.publish_at <= $1
             AND (o.is_active = false OR o.is_active IS NULL)
             RETURNING o.id, o.title, o.business_id, s.publish_at`,
            [now]
        );

        if (activateResult.rows.length > 0) {
            logger.info(`✅ Активировано офферов: ${activateResult.rows.length}`);
            
            // Отправляем уведомления подписчикам
            for (const offer of activateResult.rows) {
                await notifySubscribers(offer.id, offer.title, offer.business_id, 'offer_live');
            }
        }

        // 2. Деактивируем офферы, которые должны быть завершены
        const deactivateResult = await pool.query(
            `UPDATE offers o
             SET is_active = false
             FROM offer_schedules s
             WHERE o.id = s.offer_id
             AND s.is_active = true
             AND s.unpublish_at IS NOT NULL
             AND s.unpublish_at <= $1
             AND o.is_active = true
             RETURNING o.id, o.title`,
            [now]
        );

        if (deactivateResult.rows.length > 0) {
            logger.info(`⏸️ Деактивировано офферов: ${deactivateResult.rows.length}`);
        }

    } catch (error) {
        logger.error('❌ Ошибка при обработке расписания офферов:', error);
    }
}

/**
 * Отправка уведомлений подписчикам при активации оффера
 */
async function notifySubscribers(offerId, offerTitle, businessId, eventType) {
    try {
        // Антиспам: минимальный интервал между уведомлениями (в часах)
        const ANTISPAM_HOURS = parseInt(process.env.WAITLIST_ANTISPAM_HOURS || '24');
        
        // Получаем координаты бизнеса
        const businessResult = await pool.query(
            `SELECT coord_0 as latitude, coord_1 as longitude 
             FROM users WHERE id = $1`,
            [businessId]
        );

        const businessLat = businessResult.rows[0]?.latitude;
        const businessLon = businessResult.rows[0]?.longitude;

        // Находим подписчиков на этот оффер, бизнес или область
        // Для области проверяем расстояние (простая формула гаверсинуса)
        // Исключаем тех, кому уже отправляли уведомление в последние N часов (антиспам)
        const antispamInterval = `${ANTISPAM_HOURS} hours`;
        const subscribersResult = await pool.query(
            `SELECT DISTINCT ws.user_id, ns.web_push_subscription, ws.scope_type
             FROM waitlist_subscriptions ws
             LEFT JOIN notification_settings ns ON ws.user_id = ns.user_id
             LEFT JOIN waitlist_notifications_log wnl ON (
                 wnl.offer_id = $1 
                 AND wnl.user_id = ws.user_id 
                 AND wnl.notification_type = $5
                 AND wnl.sent_at > NOW() - INTERVAL $6
             )
             WHERE ws.is_active = true
             AND ns.web_push_enabled = true
             AND ns.web_push_subscription IS NOT NULL
             AND wnl.id IS NULL -- Антиспам: исключаем тех, кому уже отправляли
             AND (
                 (ws.scope_type = 'offer' AND ws.scope_id = $1)
                 OR (ws.scope_type = 'business' AND ws.scope_id = $2)
                 OR (
                     ws.scope_type = 'area' 
                     AND ws.latitude IS NOT NULL 
                     AND ws.longitude IS NOT NULL
                     AND $3 IS NOT NULL 
                     AND $4 IS NOT NULL
                     AND (
                         -- Простая проверка расстояния (приблизительная, в км)
                         6371 * acos(
                             cos(radians($3)) * cos(radians(ws.latitude)) *
                             cos(radians(ws.longitude) - radians($4)) +
                             sin(radians($3)) * sin(radians(ws.latitude))
                         ) <= COALESCE(ws.radius_km, 5)
                     )
                 )
             )`,
            [offerId, businessId, businessLat, businessLon, eventType, antispamInterval]
        );

        if (subscribersResult.rows.length === 0) {
            logger.info(`📭 Нет подписчиков для оффера ${offerId}`);
            return;
        }

        logger.info(`📨 Отправка уведомлений ${subscribersResult.rows.length} подписчикам оффера ${offerId}`);

        const notificationPayload = JSON.stringify({
            title: '🎉 Новое предложение!',
            body: `${offerTitle} теперь доступно!`,
            icon: '/kandlate.png',
            badge: '/kandlate.png',
            data: {
                type: eventType,
                offerId: offerId,
                businessId: businessId,
                url: `/vendor/${businessId}`
            }
        });

        // Отправляем уведомления
        const sendPromises = subscribersResult.rows.map(async (row) => {
            try {
                const subscription = typeof row.web_push_subscription === 'string' 
                    ? JSON.parse(row.web_push_subscription)
                    : row.web_push_subscription;

                if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
                    // Если нет VAPID ключей, просто логируем
                    logger.info(`📤 [SIMULATED] Push notification to user ${row.user_id}: ${offerTitle}`);
                    return;
                }

                await webpush.sendNotification(subscription, notificationPayload);
                logger.info(`✅ Push отправлен пользователю ${row.user_id}`);
                
                // Логируем отправку для антиспама
                await pool.query(
                    `INSERT INTO waitlist_notifications_log (offer_id, user_id, notification_type)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (offer_id, user_id, notification_type) 
                     DO UPDATE SET sent_at = CURRENT_TIMESTAMP`,
                    [offerId, row.user_id, eventType]
                );
            } catch (error) {
                // Если подписка недействительна, удаляем её
                if (error.statusCode === 410 || error.statusCode === 404) {
                    logger.warn(`⚠️ Удаляем недействительную подписку пользователя ${row.user_id}`);
                    await pool.query(
                        `UPDATE notification_settings 
                         SET web_push_enabled = false, web_push_subscription = NULL 
                         WHERE user_id = $1`,
                        [row.user_id]
                    );
                } else {
                    logger.error(`❌ Ошибка отправки push пользователю ${row.user_id}:`, error.message);
                }
            }
        });

        await Promise.allSettled(sendPromises);

    } catch (error) {
        logger.error('❌ Ошибка при отправке уведомлений:', error);
    }
}

/**
 * Запуск планировщика
 */
function startScheduler() {
    if (process.env.NODE_ENV === 'test') {
        logger.info('⏭️ Планировщик отключен в тестовом режиме');
        return;
    }

    // Запускаем каждую минуту
    cron.schedule('* * * * *', processScheduledOffers, {
        scheduled: true,
        timezone: 'Europe/Moscow'
    });

    logger.info('✅ Планировщик офферов запущен (каждую минуту)');
}

module.exports = {
    startScheduler,
    processScheduledOffers,
    notifySubscribers
};

