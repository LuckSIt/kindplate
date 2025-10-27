const express = require("express");
const customerRouter = express.Router();
const pool = require("../lib/db");

customerRouter.get("/sellers", async (req, res) => {
    try {
        console.log("🔍 Запрос /customer/sellers");
        
        // Оптимизированный запрос с JOIN для получения всех данных за один раз
        // Проверяем наличие колонок качества
        let hasQualityFields = false;
        try {
            const columnCheck = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'is_top'
            `);
            hasQualityFields = columnCheck.rows.length > 0;
        } catch (e) {
            console.log('⚠️ Не удалось проверить наличие полей качества');
        }

        const qualityFields = hasQualityFields ? `
            COALESCE(u.is_top, false) as is_top,
            COALESCE(u.quality_score, 0) as quality_score,
            COALESCE(u.total_orders, 0) as total_orders,
            COALESCE(u.completed_orders, 0) as completed_orders,
            COALESCE(u.repeat_customers, 0) as repeat_customers,
            COALESCE(u.avg_rating, 0) as avg_rating,
        ` : `
            false as is_top,
            0 as quality_score,
            0 as total_orders,
            0 as completed_orders,
            0 as repeat_customers,
            0 as avg_rating,
        `;

        const result = await pool.query(
            `SELECT 
                u.id as business_id,
                u.name,
                u.address,
                u.coord_0,
                u.coord_1,
                u.logo_url,
                u.rating,
                u.total_reviews,
                ${qualityFields}
                o.id as offer_id,
                o.title,
                o.description,
                o.image_url,
                o.original_price,
                o.discounted_price,
                o.quantity_available,
                o.pickup_time_start,
                o.pickup_time_end,
                o.created_at
            FROM users u
            LEFT JOIN offers o ON u.id = o.business_id 
                AND o.is_active = true 
                AND o.quantity_available > 0
            WHERE u.is_business = true
            ORDER BY o.created_at DESC`
        );
        console.log("📦 Результаты запроса:", result.rows.length);

        const sellers = {};

        // Создаем объекты заведений и добавляем предложения
        result.rows.forEach((row) => {
            if (!sellers[row.business_id]) {
                sellers[row.business_id] = {
                    id: row.business_id,
                    name: row.name,
                    address: row.address,
                    coords: [row.coord_0, row.coord_1],
                    logo_url: row.logo_url,
                    rating: parseFloat(row.rating) || 0,
                    total_reviews: row.total_reviews || 0,
                    is_top: row.is_top || false,
                    quality_score: parseFloat(row.quality_score) || 0,
                    quality_metrics: {
                        total_orders: row.total_orders || 0,
                        completed_orders: row.completed_orders || 0,
                        repeat_customers: row.repeat_customers || 0,
                        avg_rating: parseFloat(row.avg_rating) || 0
                    },
                    offers: []
                };
            }

            // Добавляем предложение если оно есть
            if (row.offer_id) {
                sellers[row.business_id].offers.push({
                    id: row.offer_id,
                    title: row.title,
                    description: row.description,
                    image_url: row.image_url,
                    original_price: parseFloat(row.original_price),
                    discounted_price: parseFloat(row.discounted_price),
                    quantity_available: row.quantity_available,
                    pickup_time_start: row.pickup_time_start,
                    pickup_time_end: row.pickup_time_end,
                    discount_percent: Math.round((1 - parseFloat(row.discounted_price) / parseFloat(row.original_price)) * 100),
                    created_at: row.created_at
                });
            }
        });

        // Фильтруем заведения без предложений
        const sellersWithOffers = Object.values(sellers).filter(
            seller => seller.offers.length > 0
        );

        console.log("✅ Заведения с предложениями:", sellersWithOffers.length);

        res.send({
            success: true,
            sellers: sellersWithOffers,
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/sellers:", e);
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

// Получить конкретное заведение по ID
customerRouter.get("/vendors/:id", async (req, res) => {
    try {
        const vendorId = req.params.id;
        console.log("🔍 Запрос /customer/vendors/:id", vendorId);
        
        // Проверяем наличие колонок качества
        let hasQualityFields = false;
        try {
            const columnCheck = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'is_top'
            `);
            hasQualityFields = columnCheck.rows.length > 0;
        } catch (e) {
            console.log('⚠️ Не удалось проверить наличие полей качества');
        }

        const qualityFields = hasQualityFields ? `
            COALESCE(u.is_top, false) as is_top,
            COALESCE(u.quality_score, 0) as quality_score,
            COALESCE(u.total_orders, 0) as total_orders,
            COALESCE(u.completed_orders, 0) as completed_orders,
            COALESCE(u.repeat_customers, 0) as repeat_customers,
            COALESCE(u.avg_rating, 0) as avg_rating
        ` : `
            false as is_top,
            0 as quality_score,
            0 as total_orders,
            0 as completed_orders,
            0 as repeat_customers,
            0 as avg_rating
        `;

        // Получаем данные заведения
        const vendorResult = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.address,
                u.coord_0,
                u.coord_1,
                u.logo_url,
                u.rating,
                u.total_reviews,
                ${qualityFields}
            FROM users u
            WHERE u.id = $1 AND u.is_business = true`,
            [vendorId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "VENDOR_NOT_FOUND",
                message: "Заведение не найдено"
            });
        }

        const vendor = vendorResult.rows[0];
        
        res.send({
            success: true,
            data: {
                id: vendor.id,
                name: vendor.name,
                is_top: vendor.is_top || false,
                quality_score: parseFloat(vendor.quality_score) || 0,
                quality_metrics: {
                    total_orders: vendor.total_orders || 0,
                    completed_orders: vendor.completed_orders || 0,
                    repeat_customers: vendor.repeat_customers || 0,
                    avg_rating: parseFloat(vendor.avg_rating) || 0
                },
                address: vendor.address,
                coords: [vendor.coord_0, vendor.coord_1],
                logo_url: vendor.logo_url,
                rating: parseFloat(vendor.rating) || 0,
                total_reviews: vendor.total_reviews || 0,
                phone: null
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/vendors/:id:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Получить предложения конкретного заведения
customerRouter.get("/vendors/:id/offers", async (req, res) => {
    try {
        const vendorId = req.params.id;
        const active = req.query.active === 'true';
        console.log("🔍 Запрос /customer/vendors/:id/offers", { vendorId, active });
        
        let query = `
            SELECT 
                o.id,
                o.title,
                o.description,
                o.image_url,
                o.original_price,
                o.discounted_price,
                o.quantity_available,
                o.pickup_time_start,
                o.pickup_time_end,
                o.is_active,
                false as is_best,
                o.created_at
            FROM offers o
            WHERE o.business_id = $1
        `;
        
        const params = [vendorId];
        
        if (active) {
            query += ` AND o.is_active = true AND o.quantity_available > 0`;
        }
        
        query += ` ORDER BY o.created_at DESC`;

        const result = await pool.query(query, params);
        
        const offers = result.rows.map(row => ({
            id: row.id,
            business_id: parseInt(vendorId),
            title: row.title,
            description: row.description,
            image_url: row.image_url,
            original_price: parseFloat(row.original_price),
            discounted_price: parseFloat(row.discounted_price),
            quantity_available: row.quantity_available,
            pickup_time_start: row.pickup_time_start,
            pickup_time_end: row.pickup_time_end,
            is_active: row.is_active,
            is_best: row.is_best || false,
            created_at: row.created_at,
            discount_percent: Math.round((1 - parseFloat(row.discounted_price) / parseFloat(row.original_price)) * 100)
        }));

        res.send({
            success: true,
            data: {
                offers: offers
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/vendors/:id/offers:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

// Получить конкретное предложение по ID
customerRouter.get("/offers/:id", async (req, res) => {
    try {
        const offerId = req.params.id;
        console.log("🔍 Запрос /customer/offers/:id", offerId);

        const result = await pool.query(
            `SELECT 
                o.id,
                o.title,
                o.description,
                o.image_url,
                o.original_price,
                o.discounted_price,
                o.quantity_available,
                o.pickup_time_start,
                o.pickup_time_end,
                o.is_active,
                false as is_best,
                o.created_at,
                u.id as business_id,
                u.name as business_name,
                u.address as business_address,
                u.coord_0,
                u.coord_1,
                u.logo_url as business_logo_url,
                u.rating as business_rating,
                u.total_reviews as business_total_reviews
            FROM offers o
            JOIN users u ON o.business_id = u.id
            WHERE o.id = $1 AND u.is_business = true`,
            [offerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "OFFER_NOT_FOUND",
                message: "Предложение не найдено"
            });
        }

        const row = result.rows[0];
        const offer = {
            id: row.id,
            title: row.title,
            description: row.description,
            image_url: row.image_url,
            original_price: parseFloat(row.original_price),
            discounted_price: parseFloat(row.discounted_price),
            quantity_available: row.quantity_available,
            pickup_time_start: row.pickup_time_start,
            pickup_time_end: row.pickup_time_end,
            is_active: row.is_active,
            is_best: row.is_best || false,
            created_at: row.created_at,
            business: {
                id: row.business_id,
                name: row.business_name,
                address: row.business_address,
                coords: [row.coord_0, row.coord_1],
                logo_url: row.business_logo_url,
                rating: parseFloat(row.business_rating) || 0,
                total_reviews: row.business_total_reviews || 0
            }
        };

        res.send({
            success: true,
            data: offer
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/offers/:id:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

module.exports = customerRouter;
