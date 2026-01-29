const express = require("express");
const statsRouter = express.Router();
const pool = require("../lib/db");
const { authOnly, businessOnly } = require("../lib/auth");

// GET /stats/customer - Статистика для клиента (authOnly: сессия или JWT)
statsRouter.get("/customer", authOnly, async (req, res) => {
    try {
        const customer_id = req.session.userId;

        // Количество завершенных заказов
        const ordersCount = await pool.query(
            `SELECT COUNT(*) as count FROM orders WHERE customer_id=$1 AND status='completed'`,
            [customer_id]
        );

        // Общая потраченная сумма
        const totalSpent = await pool.query(
            `SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE customer_id=$1 AND status='completed'`,
            [customer_id]
        );

        // Сэкономленные деньги (разница между обычной и скидочной ценой)
        const savedMoney = await pool.query(
            `SELECT COALESCE(SUM((of.original_price - of.discounted_price) * o.quantity), 0) as saved
             FROM orders o
             JOIN offers of ON o.offer_id = of.id
             WHERE o.customer_id=$1 AND o.status='completed'`,
            [customer_id]
        );

        // Количество спасенных порций
        const savedMeals = await pool.query(
            `SELECT COALESCE(SUM(quantity), 0) as meals FROM orders WHERE customer_id=$1 AND status='completed'`,
            [customer_id]
        );

        // CO2 (примерно 2.5 кг на порцию)
        const co2Saved = Math.round(parseInt(savedMeals.rows[0].meals) * 2.5);

        // График по месяцам (последние 6 месяцев)
        const chartData = await pool.query(
            `SELECT 
                TO_CHAR(created_at, 'Mon') as month,
                COUNT(*) as count
             FROM orders 
             WHERE customer_id=$1 AND status='completed' AND created_at >= NOW() - INTERVAL '6 months'
             GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
             ORDER BY EXTRACT(MONTH FROM created_at)`,
            [customer_id]
        );

        // Уровень пользователя (на основе количества заказов)
        const orders = parseInt(ordersCount.rows[0].count);
        let level = "Новичок";
        let nextLevel = "Любитель";
        let progress = orders;
        let target = 5;

        if (orders >= 50) {
            level = "Эко-герой";
            nextLevel = "Максимум!";
            progress = 50;
            target = 50;
        } else if (orders >= 20) {
            level = "Постоянный клиент";
            nextLevel = "Эко-герой";
            progress = orders - 20;
            target = 30;
        } else if (orders >= 10) {
            level = "Активный";
            nextLevel = "Постоянный клиент";
            progress = orders - 10;
            target = 10;
        } else if (orders >= 5) {
            level = "Любитель";
            nextLevel = "Активный";
            progress = orders - 5;
            target = 5;
        }

        res.send({
            success: true,
            stats: {
                orders_count: parseInt(ordersCount.rows[0].count),
                total_spent: parseFloat(totalSpent.rows[0].total),
                saved_money: parseFloat(savedMoney.rows[0].saved),
                saved_meals: parseInt(savedMeals.rows[0].meals),
                co2_saved: co2Saved,
                level: level,
                next_level: nextLevel,
                progress: progress,
                target: target,
                chart_data: chartData.rows
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в /stats/customer:", e);
        res.status(500).send({ success: false, error: "UNKNOWN_ERROR" });
    }
});

// GET /stats/business - Статистика для бизнеса (businessOnly: сессия или JWT + is_business)
statsRouter.get("/business", businessOnly, async (req, res) => {
    try {
        const business_id = req.session?.userId;
        
        if (!business_id) {
            return res.status(401).json({
                success: false,
                error: "NOT_AUTHENTICATED",
                message: "Необходима авторизация"
            });
        }

        // Проверяем структуру таблицы orders
        const columnsRes = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'orders'
        `);
        const orderCols = columnsRes.rows.map(r => r.column_name);
        const hasModernSchema = orderCols.includes('total') && orderCols.includes('subtotal');
        const hasOldSchema = orderCols.includes('total_price');

        // Определяем поля для подсчета в зависимости от схемы
        const totalField = hasModernSchema ? 'total' : (hasOldSchema ? 'total_price' : null);
        
        if (!totalField) {
            return res.status(500).json({
                success: false,
                error: "SCHEMA_ERROR",
                message: "Неизвестная схема таблицы orders"
            });
        }

        // Условие: только оплаченные заказы (не черновики и не отменённые). Заказ считается у бизнеса только после оплаты.
        const notCancelledCondition = `status NOT IN ('draft', 'cancelled')`;

        // Общее количество заказов (без отмененных)
        const ordersCount = await pool.query(
            `SELECT COUNT(*) as count FROM orders WHERE business_id=$1 AND ${notCancelledCondition}`,
            [business_id]
        );

        // Завершенные заказы
        const completedOrders = await pool.query(
            `SELECT COUNT(*) as count FROM orders WHERE business_id=$1 AND status='completed'`,
            [business_id]
        );

        // Общая выручка за все время (без отмененных заказов)
        const totalRevenue = await pool.query(
            `SELECT COALESCE(SUM(${totalField}), 0) as total FROM orders WHERE business_id=$1 AND ${notCancelledCondition}`,
            [business_id]
        );

        // Количество проданных единиц за все время (сумма quantity из order_items, без отмененных заказов)
        let totalSold = 0;
        try {
            const soldResult = await pool.query(
                `SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
                 FROM order_items oi
                 JOIN orders o ON oi.order_id = o.id
                 WHERE o.business_id=$1 AND o.${notCancelledCondition}`,
                [business_id]
            );
            totalSold = parseInt(soldResult.rows[0].total_sold) || 0;
        } catch (soldError) {
            console.log("⚠️ Ошибка при подсчете проданных единиц:", soldError.message);
            // Если таблицы order_items нет, используем старую схему
            if (orderCols.includes('quantity')) {
                const soldResultOld = await pool.query(
                    `SELECT COALESCE(SUM(quantity), 0) as total_sold
                     FROM orders
                     WHERE business_id=$1 AND ${notCancelledCondition}`,
                    [business_id]
                );
                totalSold = parseInt(soldResultOld.rows[0].total_sold) || 0;
            }
        }

        // Статистика за сегодня (без отмененных заказов)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayRevenue = await pool.query(
            `SELECT COALESCE(SUM(${totalField}), 0) as total 
             FROM orders 
             WHERE business_id=$1 AND ${notCancelledCondition} AND DATE(created_at) = CURRENT_DATE`,
            [business_id]
        );

        let todaySold = 0;
        try {
            const todaySoldResult = await pool.query(
                `SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
                 FROM order_items oi
                 JOIN orders o ON oi.order_id = o.id
                 WHERE o.business_id=$1 AND o.${notCancelledCondition} AND DATE(o.created_at) = CURRENT_DATE`,
                [business_id]
            );
            todaySold = parseInt(todaySoldResult.rows[0].total_sold) || 0;
        } catch (todaySoldError) {
            console.log("⚠️ Ошибка при подсчете проданных единиц за сегодня:", todaySoldError.message);
            if (orderCols.includes('quantity')) {
                const todaySoldResultOld = await pool.query(
                    `SELECT COALESCE(SUM(quantity), 0) as total_sold
                     FROM orders
                     WHERE business_id=$1 AND ${notCancelledCondition} AND DATE(created_at) = CURRENT_DATE`,
                    [business_id]
                );
                todaySold = parseInt(todaySoldResultOld.rows[0].total_sold) || 0;
            }
        }

        // Статистика за последние 3 дня (сегодня + вчера + позавчера), без отмененных
        const last3daysRevenue = await pool.query(
            `SELECT COALESCE(SUM(${totalField}), 0) as total
             FROM orders
             WHERE business_id=$1 AND ${notCancelledCondition} AND created_at >= (CURRENT_DATE - INTERVAL '2 days')::date`,
            [business_id]
        );

        let last3daysSold = 0;
        try {
            const last3daysSoldResult = await pool.query(
                `SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
                 FROM order_items oi
                 JOIN orders o ON oi.order_id = o.id
                 WHERE o.business_id=$1 AND o.${notCancelledCondition} AND o.created_at >= (CURRENT_DATE - INTERVAL '2 days')::date`,
                [business_id]
            );
            last3daysSold = parseInt(last3daysSoldResult.rows[0].total_sold) || 0;
        } catch (e) {
            if (orderCols.includes('quantity')) {
                const r = await pool.query(
                    `SELECT COALESCE(SUM(quantity), 0) as total_sold
                     FROM orders
                     WHERE business_id=$1 AND ${notCancelledCondition} AND created_at >= (CURRENT_DATE - INTERVAL '2 days')::date`,
                    [business_id]
                );
                last3daysSold = parseInt(r.rows[0].total_sold) || 0;
            }
        }

        // Количество уникальных клиентов
        const hasUserId = orderCols.includes('user_id');
        const hasCustomerId = orderCols.includes('customer_id');
        const customerField = hasUserId ? 'user_id' : (hasCustomerId ? 'customer_id' : null);
        
        let uniqueCustomers = { rows: [{ count: '0' }] };
        if (customerField) {
            uniqueCustomers = await pool.query(
                `SELECT COUNT(DISTINCT ${customerField}) as count FROM orders WHERE business_id=$1 AND ${notCancelledCondition}`,
                [business_id]
            );
        }

        // Средний чек (без отмененных заказов)
        const avgCheck = await pool.query(
            `SELECT COALESCE(AVG(${totalField}), 0) as avg FROM orders WHERE business_id=$1 AND ${notCancelledCondition}`,
            [business_id]
        );

        // Топ-3 популярных предложений (без отмененных заказов)
        let topOffers = [];
        try {
            if (hasModernSchema) {
                // Новая схема: используем order_items
                const topOffersResult = await pool.query(
                    `SELECT 
                        oi.title,
                        COUNT(DISTINCT o.id) as orders_count,
                        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
                     FROM order_items oi
                     JOIN orders o ON oi.order_id = o.id
                     WHERE o.business_id=$1 AND o.${notCancelledCondition}
                     GROUP BY oi.title
                     ORDER BY orders_count DESC
                     LIMIT 3`,
                    [business_id]
                );
                topOffers = topOffersResult.rows;
            } else {
                // Старая схема: используем offers
                const topOffersResult = await pool.query(
                    `SELECT 
                        of.title,
                        COUNT(o.id) as orders_count,
                        SUM(o.${totalField}) as revenue
                     FROM orders o
                     JOIN offers of ON o.offer_id = of.id
                     WHERE o.business_id=$1 AND o.${notCancelledCondition}
                     GROUP BY of.title
                     ORDER BY orders_count DESC
                     LIMIT 3`,
                    [business_id]
                );
                topOffers = topOffersResult.rows;
            }
        } catch (topOffersError) {
            console.log("⚠️ Ошибка при получении топ предложений:", topOffersError.message);
        }

        // График продаж по дням (последние 7 дней, без отмененных заказов)
        const chartData = await pool.query(
            `SELECT 
                TO_CHAR(created_at, 'DD Mon') as day,
                COUNT(*) as orders,
                COALESCE(SUM(${totalField}), 0) as revenue
             FROM orders 
             WHERE business_id=$1 AND ${notCancelledCondition} AND created_at >= NOW() - INTERVAL '7 days'
             GROUP BY TO_CHAR(created_at, 'DD Mon'), DATE(created_at)
             ORDER BY DATE(created_at)`,
            [business_id]
        );

        // Статистика по статусам
        const statusStats = await pool.query(
            `SELECT 
                status,
                COUNT(*) as count
             FROM orders 
             WHERE business_id=$1
             GROUP BY status`,
            [business_id]
        );

        res.send({
            success: true,
            stats: {
                orders_count: parseInt(ordersCount.rows[0].count),
                completed_orders: parseInt(completedOrders.rows[0].count),
                total_revenue: parseFloat(totalRevenue.rows[0].total),
                total_sold: totalSold,
                today_revenue: parseFloat(todayRevenue.rows[0].total),
                today_sold: todaySold,
                last3days_revenue: parseFloat(last3daysRevenue.rows[0].total),
                last3days_sold: last3daysSold,
                unique_customers: parseInt(uniqueCustomers.rows[0].count),
                avg_check: Math.round(parseFloat(avgCheck.rows[0].avg)),
                top_offers: topOffers,
                chart_data: chartData.rows,
                status_stats: statusStats.rows
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в /stats/business:", e);
        res.status(500).json({ 
            success: false, 
            error: "UNKNOWN_ERROR",
            message: "Ошибка при получении статистики"
        });
    }
});

module.exports = statsRouter;

