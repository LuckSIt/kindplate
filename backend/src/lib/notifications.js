const webpush = require('web-push');
const pool = require('./db');

// VAPID ключи для web-push (должны быть в .env)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@kindplate.ru';

// Настраиваем web-push если ключи есть
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Отправляет push-уведомление пользователю
 * @param {number} userId - ID пользователя
 * @param {string} title - Заголовок уведомления
 * @param {string} body - Текст уведомления
 * @param {object} data - Дополнительные данные (type, orderId, businessId, url и т.д.)
 * @returns {Promise<boolean>} - true если уведомление отправлено, false если нет
 */
async function sendPushNotification(userId, title, body, data = {}) {
    try {
        // Проверяем, существует ли таблица notification_settings
        const tableExists = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'notification_settings'
            )`
        );

        if (!tableExists.rows[0].exists) {
            console.log(`📦 Таблица notification_settings не существует, пропускаем отправку уведомления пользователю ${userId}`);
            return false;
        }

        // Получаем подписку пользователя
        const settingsResult = await pool.query(
            `SELECT web_push_enabled, web_push_subscription 
             FROM notification_settings 
             WHERE user_id = $1`,
            [userId]
        );

        if (settingsResult.rows.length === 0 || !settingsResult.rows[0].web_push_enabled) {
            console.log(`📭 Пользователь ${userId} не подписан на push-уведомления`);
            return false;
        }

        const subscription = settingsResult.rows[0].web_push_subscription;
        if (!subscription) {
            console.log(`📭 Пользователь ${userId} не имеет активной подписки`);
            return false;
        }

        // Парсим подписку если она строка
        const parsedSubscription = typeof subscription === 'string' 
            ? JSON.parse(subscription)
            : subscription;

        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            // Если нет VAPID ключей, просто логируем
            console.log(`📤 [SIMULATED] Push notification to user ${userId}: ${title} - ${body}`);
            return false;
        }

        // Формируем payload уведомления
        const notificationPayload = JSON.stringify({
            title: title,
            body: body,
            icon: '/kandlate.png',
            badge: '/kandlate.png',
            data: {
                ...data,
                timestamp: new Date().toISOString()
            }
        });

        // Отправляем уведомление
        await webpush.sendNotification(parsedSubscription, notificationPayload);
        console.log(`✅ Push отправлен пользователю ${userId}: ${title}`);

        // Сохраняем уведомление в историю (если таблица существует)
        try {
            const notificationsTableExists = await pool.query(
                `SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                )`
            );

            if (notificationsTableExists.rows[0].exists) {
                await pool.query(
                    `INSERT INTO notifications (user_id, title, body, type, data, created_at)
                     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
                    [userId, title, body, data.type || 'info', JSON.stringify(data)]
                );
            }
        } catch (historyError) {
            console.log(`⚠️ Ошибка при сохранении уведомления в историю:`, historyError.message);
            // Не критично, продолжаем
        }

        return true;
    } catch (error) {
        // Если подписка недействительна, удаляем её
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`🗑️ Подписка пользователя ${userId} недействительна, удаляем её`);
            try {
                await pool.query(
                    `UPDATE notification_settings
                     SET web_push_enabled = false, web_push_subscription = NULL
                     WHERE user_id = $1`,
                    [userId]
                );
            } catch (updateError) {
                console.error(`❌ Ошибка при удалении подписки пользователя ${userId}:`, updateError.message);
            }
        } else {
            console.error(`❌ Ошибка отправки push пользователю ${userId}:`, error.message);
        }
        return false;
    }
}

/**
 * Отправляет уведомление бизнесу о новом заказе
 * @param {number} businessId - ID бизнеса
 * @param {number} orderId - ID заказа
 * @param {number} total - Сумма заказа
 * @param {number} itemsCount - Количество позиций в заказе
 * @returns {Promise<boolean>}
 */
async function notifyBusinessAboutNewOrder(businessId, orderId, total, itemsCount) {
    const title = '🛒 Новый заказ!';
    const body = `Получен новый заказ #${orderId} на сумму ${total}₽ (${itemsCount} ${itemsCount === 1 ? 'позиция' : 'позиций'})`;
    
    return await sendPushNotification(businessId, title, body, {
        type: 'new_order',
        orderId: orderId,
        businessId: businessId,
        url: `/panel?tab=orders`
    });
}

/**
 * Отправляет уведомление клиенту о статусе заказа
 * @param {number} customerId - ID клиента
 * @param {number} orderId - ID заказа
 * @param {string} status - Статус заказа (confirmed, ready, completed, cancelled)
 * @param {string} businessName - Название бизнеса
 * @returns {Promise<boolean>}
 */
async function notifyCustomerAboutOrderStatus(customerId, orderId, status, businessName) {
    let title, body;
    
    switch (status) {
        case 'confirmed':
            title = '✅ Заказ подтвержден';
            body = `Ваш заказ #${orderId} от ${businessName} подтвержден`;
            break;
        case 'ready':
            title = '🎉 Заказ готов!';
            body = `Ваш заказ #${orderId} от ${businessName} готов к выдаче`;
            break;
        case 'completed':
            title = '✨ Заказ выполнен';
            body = `Спасибо! Ваш заказ #${orderId} от ${businessName} выполнен`;
            break;
        case 'cancelled':
            title = '❌ Заказ отменен';
            body = `Ваш заказ #${orderId} от ${businessName} был отменен`;
            break;
        default:
            title = '📦 Обновление заказа';
            body = `Статус вашего заказа #${orderId} от ${businessName} изменен`;
    }
    
    return await sendPushNotification(customerId, title, body, {
        type: 'order_status',
        orderId: orderId,
        status: status,
        url: `/orders/${orderId}`
    });
}

/**
 * Отправляет уведомление клиенту о создании заказа
 * @param {number} customerId - ID клиента
 * @param {number} orderId - ID заказа
 * @param {string} businessName - Название бизнеса
 * @param {number} total - Сумма заказа
 * @returns {Promise<boolean>}
 */
async function notifyCustomerAboutNewOrder(customerId, orderId, businessName, total) {
    const title = '📦 Заказ создан';
    const body = `Ваш заказ #${orderId} от ${businessName} на сумму ${total}₽ создан`;
    
    return await sendPushNotification(customerId, title, body, {
        type: 'order_created',
        orderId: orderId,
        businessName: businessName,
        url: `/orders/${orderId}`
    });
}

module.exports = {
    sendPushNotification,
    notifyBusinessAboutNewOrder,
    notifyCustomerAboutOrderStatus,
    notifyCustomerAboutNewOrder
};
