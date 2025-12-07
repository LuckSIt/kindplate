const express = require("express");
const statsRouter = express.Router();
const pool = require("../lib/db");

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send({ success: false, error: "NOT_AUTHENTICATED" });
    }
    next();
};

// GET /stats/customer - Статистика для клиента
statsRouter.get("/customer", requireAuth, async (req, res) => {
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

// GET /stats/business - Статистика для бизнеса
statsRouter.get("/business", requireAuth, async (req, res) => {
    try {
        const business_id = req.session?.userId;
        
        if (!business_id) {
            return res.status(401).json({
                success: false,
                error: "NOT_AUTHENTICATED",
                message: "Необходима авторизация"
            });
        }

        // Общее количество заказов
        const ordersCount = await pool.query(
            `SELECT COUNT(*) as count FROM orders WHERE business_id=$1`,
            [business_id]
        );

        // Завершенные заказы
        const completedOrders = await pool.query(
            `SELECT COUNT(*) as count FROM orders WHERE business_id=$1 AND status='completed'`,
            [business_id]
        );

        // Общий доход
        const totalRevenue = await pool.query(
            `SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE business_id=$1 AND status='completed'`,
            [business_id]
        );

        // Количество уникальных клиентов
        const uniqueCustomers = await pool.query(
            `SELECT COUNT(DISTINCT customer_id) as count FROM orders WHERE business_id=$1`,
            [business_id]
        );

        // Средний чек
        const avgCheck = await pool.query(
            `SELECT COALESCE(AVG(total_price), 0) as avg FROM orders WHERE business_id=$1 AND status='completed'`,
            [business_id]
        );

        // Топ-3 популярных предложений
        const topOffers = await pool.query(
            `SELECT 
                of.title,
                COUNT(o.id) as orders_count,
                SUM(o.total_price) as revenue
             FROM orders o
             JOIN offers of ON o.offer_id = of.id
             WHERE o.business_id=$1 AND o.status='completed'
             GROUP BY of.title
             ORDER BY orders_count DESC
             LIMIT 3`,
            [business_id]
        );

        // График продаж по дням (последние 7 дней)
        const chartData = await pool.query(
            `SELECT 
                TO_CHAR(created_at, 'DD Mon') as day,
                COUNT(*) as orders,
                COALESCE(SUM(total_price), 0) as revenue
             FROM orders 
             WHERE business_id=$1 AND created_at >= NOW() - INTERVAL '7 days'
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
                unique_customers: parseInt(uniqueCustomers.rows[0].count),
                avg_check: Math.round(parseFloat(avgCheck.rows[0].avg)),
                top_offers: topOffers.rows,
                chart_data: chartData.rows,
                status_stats: statusStats.rows
            }
        });
    } catch (e) {
        logger.error("❌ Ошибка в /stats/business:", {
            error: e.message,
            stack: e.stack,
            business_id: req.session?.userId
        });
        res.status(500).json({ 
            success: false, 
            error: "UNKNOWN_ERROR",
            message: "Ошибка при получении статистики"
        });
    }
});

module.exports = statsRouter;

