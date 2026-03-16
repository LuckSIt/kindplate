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

        // Определяем доступные колонки в offers
        const offersColsRes = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'offers'
        `);
        const offerCols = offersColsRes.rows.map(r => r.column_name);
        const has = (c) => offerCols.includes(c);

        const titleSel = has('title') ? 'o.title' : (has('name') ? 'o.name' : 'NULL::text');
        const descSel = has('description') ? 'o.description' : 'NULL::text';
        const imageSel = has('image_url') ? 'o.image_url' : (has('photo_url') ? 'o.photo_url' : 'NULL::text');
        const origPriceSel = has('original_price') ? 'o.original_price' : (has('price_orig') ? 'o.price_orig' : 'NULL::numeric');
        const discPriceSel = has('discounted_price') ? 'o.discounted_price' : (has('price_disc') ? 'o.price_disc' : 'NULL::numeric');
        const qtySel = has('quantity_available') ? 'o.quantity_available' : (has('quantity') ? 'o.quantity' : 'NULL::int');
        const startSel = has('pickup_time_start') ? 'o.pickup_time_start' : 'NULL::time';
        const endSel = has('pickup_time_end') ? 'o.pickup_time_end' : 'NULL::time';
        const createdSel = has('created_at') ? 'o.created_at' : 'NOW()';
        const activeCond = has('is_active') ? 'AND o.is_active = true' : '';
        const qtyCond = offerCols.includes('quantity_available') ? 'AND o.quantity_available > 0' : '';

        // Проверяем наличие колонок working_hours и website
        const userColsRes = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);
        const userCols = userColsRes.rows.map(r => r.column_name);
        const hasUserCol = (c) => userCols.includes(c);

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
                ${hasUserCol('working_hours') ? 'u.working_hours' : 'NULL::text AS working_hours'},
                ${hasUserCol('website') ? 'u.website' : 'NULL::text AS website'},
                ${qualityFields}
                o.id as offer_id,
                ${titleSel} as title,
                ${descSel} as description,
                ${imageSel} as image_url,
                ${origPriceSel} as original_price,
                ${discPriceSel} as discounted_price,
                ${qtySel} as quantity_available,
                ${startSel} as pickup_time_start,
                ${endSel} as pickup_time_end,
                ${createdSel} as created_at
            FROM users u
            LEFT JOIN offers o ON u.id = o.business_id 
                ${activeCond}
                ${qtyCond}
            WHERE u.is_business = true
            ORDER BY ${createdSel} DESC`
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
                    working_hours: row.working_hours,
                    website: row.website,
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

        // Возвращаем все заведения, включая без предложений (для отображения на карте)
        const allSellers = Object.values(sellers);

        // Получаем бейджи для всех бизнесов (если таблица существует)
        const badgesByBusiness = {};
        if (allSellers.length > 0) {
            try {
                const businessIds = allSellers.map(s => s.id);
                const badgesResult = await pool.query(
                    `SELECT 
                        business_id,
                        badge_key,
                        awarded_at,
                        expires_at,
                        metadata
                    FROM quality_badges
                    WHERE business_id = ANY($1)
                    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                    ORDER BY awarded_at DESC`,
                    [businessIds]
                );
                
                // Группируем бейджи по business_id
                badgesResult.rows.forEach(row => {
                    if (!badgesByBusiness[row.business_id]) {
                        badgesByBusiness[row.business_id] = [];
                    }
                    badgesByBusiness[row.business_id].push({
                        key: row.badge_key,
                        awarded_at: row.awarded_at,
                        expires_at: row.expires_at,
                        metadata: row.metadata
                    });
                });
            } catch (badgeError) {
                // Таблица quality_badges может не существовать - это нормально
                console.log('⚠️ Таблица quality_badges не найдена, пропускаем бейджи');
            }
        }
        
        // Добавляем бейджи к продавцам
        allSellers.forEach(seller => {
            seller.badges = badgesByBusiness[seller.id] || [];
        });

        console.log("✅ Все заведения (включая без предложений):", allSellers.length);

        res.send({
            success: true,
            sellers: allSellers,
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/sellers:", e);
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

// ============================================
// СПЕЦИФИЧНЫЕ МАРШРУТЫ (должны быть ДО маршрутов с параметрами)
// ============================================

// GET /customer/vendors/:id/offers - Получить предложения конкретного заведения
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
                COALESCE(o.offer_type, 'dish') as offer_type,
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
            offer_type: row.offer_type === 'special_box' ? 'special_box' : 'dish',
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

// GET /customer/offers/:id - Получить конкретное предложение по ID
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
                o.business_id,
                u.name as business_name,
                u.address as business_address,
                u.coord_0,
                u.coord_1,
                u.logo_url as business_logo_url
            FROM offers o
            JOIN users u ON o.business_id = u.id
            WHERE o.id = $1 AND o.is_active = true`,
            [offerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "OFFER_NOT_FOUND",
                message: "Предложение не найдено"
            });
        }

        const offer = result.rows[0];

        res.send({
            success: true,
            data: {
                id: offer.id,
                title: offer.title,
                description: offer.description,
                image_url: offer.image_url,
                original_price: parseFloat(offer.original_price),
                discounted_price: parseFloat(offer.discounted_price),
                quantity_available: offer.quantity_available,
                pickup_time_start: offer.pickup_time_start,
                pickup_time_end: offer.pickup_time_end,
                business: {
                    id: offer.business_id,
                    name: offer.business_name,
                    address: offer.business_address,
                    coords: [offer.coord_0, offer.coord_1],
                    logo_url: offer.business_logo_url
                },
                discount_percent: Math.round((1 - parseFloat(offer.discounted_price) / parseFloat(offer.original_price)) * 100)
            }
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

// ============================================
// ОСНОВНЫЕ МАРШРУТЫ
// ============================================

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

        // Проверяем наличие колонок working_hours и website
        const userColsRes = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);
        const userCols = userColsRes.rows.map(r => r.column_name);
        const hasUserCol = (c) => userCols.includes(c);

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
                ${hasUserCol('working_hours') ? 'u.working_hours' : 'NULL::text AS working_hours'},
                ${hasUserCol('website') ? 'u.website' : 'NULL::text AS website'},
                ${hasUserCol('phone') ? 'u.phone' : 'NULL::text AS phone'},
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
        
        // Получаем бейджи качества (если таблица существует)
        let badges = [];
        try {
            const badgesResult = await pool.query(
                `SELECT 
                    badge_key,
                    awarded_at,
                    expires_at,
                    metadata
                FROM quality_badges
                WHERE business_id = $1
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                ORDER BY awarded_at DESC`,
                [vendorId]
            );
            
            badges = badgesResult.rows.map(row => ({
                key: row.badge_key,
                awarded_at: row.awarded_at,
                expires_at: row.expires_at,
                metadata: row.metadata
            }));
        } catch (badgeError) {
            // Таблица quality_badges может не существовать - это нормально
            console.log('⚠️ Таблица quality_badges не найдена, пропускаем бейджи');
        }
        
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
                badges: badges,
                address: vendor.address,
                coords: [vendor.coord_0, vendor.coord_1],
                logo_url: vendor.logo_url,
                rating: parseFloat(vendor.rating) || 0,
                total_reviews: vendor.total_reviews || 0,
                phone: vendor.phone || null,
                working_hours: vendor.working_hours || null,
                website: vendor.website || null
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

// Дубликаты удалены - маршруты уже определены выше в секции специфичных маршрутов

module.exports = customerRouter;
