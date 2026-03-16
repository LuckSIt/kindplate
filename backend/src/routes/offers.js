const express = require("express");
const offersRouter = express.Router();
const pool = require("../lib/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../lib/logger");
const storageLib = require("../lib/storage");
const { AppError, asyncHandler } = require("../lib/errorHandler");
const { validateOffer } = require("../lib/validation");
const { sanitizePlainTextFields } = require("../middleware/sanitization");

// Простой in-memory кэш для поиска (можно заменить на Redis)
const searchCache = new Map();
const CACHE_TTL = 60000; // 60 секунд

// Настройка multer для загрузки файлов
const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "../../uploads/offers");
        // Создаем папку если не существует
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: multerStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: function (req, file, cb) {
        // Разрешаем только изображения
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Только изображения (JPEG, PNG, WebP) разрешены!"));
        }
    }
});

// Middleware для обработки ошибок multer
const handleMulterError = (err, req, res, next) => {
    if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: "FILE_TOO_LARGE",
                message: "Размер файла превышает 5MB"
            });
        }
        if (err.message && err.message.includes('Только изображения')) {
            return res.status(400).json({
                success: false,
                error: "INVALID_FILE_TYPE",
                message: err.message
            });
        }
        return res.status(400).json({
            success: false,
            error: "UPLOAD_ERROR",
            message: err.message || "Ошибка загрузки файла"
        });
    }
    next();
};

// ============================================
// СПЕЦИФИЧНЫЕ МАРШРУТЫ (должны быть ДО маршрутов с параметрами)
// ============================================

// GET /offers/search - Расширенный поиск офферов (ПЕРВЫЙ - должен быть до всех маршрутов с параметрами)
offersRouter.get("/search", asyncHandler(async (req, res) => {
    try {
        // Проверяем существование основных таблиц
        const tablesCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('offers', 'users')
        `);
        const existingTables = tablesCheck.rows.map(r => r.table_name);
        
        if (!existingTables.includes('offers') || !existingTables.includes('users')) {
            logger.warn('Таблицы offers или users не найдены');
            return res.json({
                success: true,
                data: {
                    offers: [],
                    meta: {
                        total: 0,
                        page: 1,
                        limit: 20,
                        total_pages: 0
                    }
                }
            });
        }

        // Параметры поиска
        const {
            q, // Поисковый запрос
            lat, // Широта
            lon, // Долгота
            radius_km = 10, // Радиус поиска в км
            pickup_from, // Время начала самовывоза
            pickup_to, // Время окончания самовывоза
            price_min, // Минимальная цена
            price_max, // Максимальная цена
            cuisines, // Массив тегов кухни (строка с запятыми или массив)
            diets, // Массив тегов диет
            allergens, // Массив тегов аллергенов (исключить офферы с этими аллергенами)
            sort = 'distance', // Сортировка: distance, price, rating
            page = 1, // Номер страницы
            limit = 20 // Лимит на страницу
        } = req.query;

        // Валидация
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const offset = (pageNum - 1) * limitNum;

        // Проверка кэша
        const cacheKey = JSON.stringify(req.query);
        const cached = searchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            logger.info(`📦 Возвращаем из кэша: ${cacheKey.substring(0, 50)}...`);
            return res.json({
                success: true,
                data: cached.data,
                meta: cached.meta
            });
        }

        // Проверяем существование таблицы business_locations
        const businessLocationsCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'business_locations'
        `);
        const hasBusinessLocations = businessLocationsCheck.rows.length > 0;

        // Проверяем наличие дополнительных полей в offers
        const offersColumnsCheck = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'offers'
            AND column_name IN ('cuisine_tags', 'diet_tags', 'allergen_tags', 'rating_avg', 'rating_count')
        `);
        const availableColumns = offersColumnsCheck.rows.map(r => r.column_name);
        const hasCuisineTags = availableColumns.includes('cuisine_tags');
        const hasDietTags = availableColumns.includes('diet_tags');
        const hasAllergenTags = availableColumns.includes('allergen_tags');
        const hasRatingAvg = availableColumns.includes('rating_avg');
        const hasRatingCount = availableColumns.includes('rating_count');

        // Проверяем наличие полей в users
        const usersColumnsCheck = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
            AND column_name IN ('cuisine_tags', 'logo_url', 'rating', 'total_reviews', 'phone', 'working_hours', 'website', 'establishment_type')
        `);
        const availableUserColumns = usersColumnsCheck.rows.map(r => r.column_name);
        const userHasCuisineTags = availableUserColumns.includes('cuisine_tags');
        const userHasLogoUrl = availableUserColumns.includes('logo_url');
        const userHasRating = availableUserColumns.includes('rating');
        const userHasTotalReviews = availableUserColumns.includes('total_reviews');
        const userHasPhone = availableUserColumns.includes('phone');
        const userHasWorkingHours = availableUserColumns.includes('working_hours');
        const userHasWebsite = availableUserColumns.includes('website');
        const userHasEstablishmentType = availableUserColumns.includes('establishment_type');

        // Формируем SQL запрос
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
                ${hasCuisineTags ? 'o.cuisine_tags' : 'NULL::text[] as cuisine_tags'},
                ${hasDietTags ? 'o.diet_tags' : 'NULL::text[] as diet_tags'},
                ${hasAllergenTags ? 'o.allergen_tags' : 'NULL::text[] as allergen_tags'},
                ${hasRatingAvg ? 'o.rating_avg' : 'NULL::numeric as rating_avg'},
                ${hasRatingCount ? 'o.rating_count' : '0::integer as rating_count'},
                o.created_at,
                u.id as business_id,
                u.name as business_name,
                u.address as business_address,
                u.coord_0 as business_lat,
                u.coord_1 as business_lon,
                ${userHasLogoUrl ? 'u.logo_url' : 'NULL::text as business_logo_url'} as business_logo_url,
                ${userHasRating ? 'u.rating' : '0::numeric as business_rating'} as business_rating,
                ${userHasTotalReviews ? 'u.total_reviews' : '0::integer as business_total_reviews'} as business_total_reviews,
                ${userHasPhone ? 'u.phone' : 'NULL::text as business_phone'} as business_phone,
                ${userHasWorkingHours ? 'u.working_hours' : 'NULL::text as business_working_hours'} as business_working_hours,
                ${userHasWebsite ? 'u.website' : 'NULL::text as business_website'} as business_website,
                ${userHasEstablishmentType ? 'u.establishment_type' : 'NULL::text as business_establishment_type'} as business_establishment_type
        `;
        
        // Добавляем поля локации только если таблица существует
        if (hasBusinessLocations) {
            query += `,
                bl.id as location_id,
                bl.name as location_name,
                bl.address as location_address,
                bl.lat as location_lat,
                bl.lon as location_lon
            `;
        } else {
            query += `,
                NULL::integer as location_id,
                NULL::text as location_name,
                NULL::text as location_address,
                NULL::numeric as location_lat,
                NULL::numeric as location_lon
            `;
        }

        // Добавляем расчет расстояния, если есть координаты
        if (lat && lon) {
            if (hasBusinessLocations) {
                query += `,
                    (
                        6371 * acos(
                            LEAST(1, GREATEST(-1,
                                cos(radians($1)) * cos(radians(COALESCE(bl.lat, u.coord_0))) *
                                cos(radians(COALESCE(bl.lon, u.coord_1)) - radians($2)) +
                                sin(radians($1)) * sin(radians(COALESCE(bl.lat, u.coord_0)))
                            ))
                        )
                    ) as distance_km
                `;
            } else {
                query += `,
                    (
                        6371 * acos(
                            LEAST(1, GREATEST(-1,
                                cos(radians($1)) * cos(radians(u.coord_0)) *
                                cos(radians(u.coord_1) - radians($2)) +
                                sin(radians($1)) * sin(radians(u.coord_0))
                            ))
                        )
                    ) as distance_km
                `;
            }
        } else {
            query += `, NULL as distance_km`;
        }

        const params = [];
        let paramIndex = 1;
        let whereConditions = `
            FROM offers o
            JOIN users u ON o.business_id = u.id
            ${hasBusinessLocations ? 'LEFT JOIN business_locations bl ON o.location_id = bl.id AND bl.is_active = true' : ''}
            WHERE u.is_business = true
            AND o.is_active = true
            AND o.quantity_available > 0
            AND (u.coord_0 IS NOT NULL AND u.coord_1 IS NOT NULL)
        `;

        // Фильтр по геолокации (радиус)
        if (lat && lon) {
            const latVal = parseFloat(lat);
            const lonVal = parseFloat(lon);
            const radius = parseFloat(radius_km) || 10;
            
            if (isNaN(latVal) || isNaN(lonVal) || latVal < -90 || latVal > 90 || lonVal < -180 || lonVal > 180) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_COORDINATES',
                    message: 'Некорректные координаты'
                });
            }
            
            params.push(latVal, lonVal, radius);
            if (hasBusinessLocations) {
                whereConditions += ` AND (
                    COALESCE(bl.lat, u.coord_0) IS NOT NULL
                    AND COALESCE(bl.lon, u.coord_1) IS NOT NULL
                    AND (
                        6371 * acos(
                            LEAST(1, GREATEST(-1,
                                cos(radians($${paramIndex})) * cos(radians(COALESCE(bl.lat, u.coord_0))) *
                                cos(radians(COALESCE(bl.lon, u.coord_1)) - radians($${paramIndex + 1})) +
                                sin(radians($${paramIndex})) * sin(radians(COALESCE(bl.lat, u.coord_0)))
                            ))
                        ) <= $${paramIndex + 2}
                    )
                )`;
            } else {
                whereConditions += ` AND (
                    6371 * acos(
                        LEAST(1, GREATEST(-1,
                            cos(radians($${paramIndex})) * cos(radians(u.coord_0)) *
                            cos(radians(u.coord_1) - radians($${paramIndex + 1})) +
                            sin(radians($${paramIndex})) * sin(radians(u.coord_0))
                        ))
                    ) <= $${paramIndex + 2}
                )`;
            }
            paramIndex += 3;
        }

        // Поиск по тексту (название оффера, описание, название и адрес заведения, а также название/адрес локации)
        if (q) {
            const searchParam = `%${q}%`;
            
            const textConditions = [
                `o.title ILIKE $${paramIndex}`,
                `o.description ILIKE $${paramIndex}`,
                `u.name ILIKE $${paramIndex}`,
                `u.address ILIKE $${paramIndex}`
            ];

            // Если есть таблица business_locations — добавляем поиск по её названию и адресу
            if (hasBusinessLocations) {
                textConditions.push(
                    `bl.name ILIKE $${paramIndex}`,
                    `bl.address ILIKE $${paramIndex}`
                );
            }

            whereConditions += ` AND (${textConditions.join(' OR ')})`;
            params.push(searchParam);
            paramIndex++;
        }

        // Фильтр по цене
        if (price_min) {
            whereConditions += ` AND o.discounted_price >= $${paramIndex}`;
            params.push(parseFloat(price_min));
            paramIndex++;
        }
        if (price_max) {
            whereConditions += ` AND o.discounted_price <= $${paramIndex}`;
            params.push(parseFloat(price_max));
            paramIndex++;
        }

        // Фильтр по времени самовывоза
        if (pickup_from) {
            whereConditions += ` AND o.pickup_time_start >= $${paramIndex}::time`;
            params.push(pickup_from);
            paramIndex++;
        }
        if (pickup_to) {
            whereConditions += ` AND o.pickup_time_end <= $${paramIndex}::time`;
            params.push(pickup_to);
            paramIndex++;
        }

        // Фильтр по кухне
        if (cuisines && (hasCuisineTags || userHasCuisineTags)) {
            const cuisineArray = Array.isArray(cuisines) ? cuisines : cuisines.split(',').map(c => c.trim());
            if (cuisineArray.length > 0) {
                const conditions = [];
                if (hasCuisineTags) {
                    conditions.push(`o.cuisine_tags && $${paramIndex}::text[]`);
                }
                if (userHasCuisineTags) {
                    conditions.push(`u.cuisine_tags && $${paramIndex}::text[]`);
                }
                if (conditions.length > 0) {
                    whereConditions += ` AND (${conditions.join(' OR ')})`;
                    params.push(cuisineArray);
                    paramIndex++;
                }
            }
        }

        // Фильтр по диетам
        if (diets && hasDietTags) {
            const dietArray = Array.isArray(diets) ? diets : diets.split(',').map(d => d.trim());
            if (dietArray.length > 0) {
                whereConditions += ` AND o.diet_tags && $${paramIndex}::text[]`;
                params.push(dietArray);
                paramIndex++;
            }
        }

        // Исключение аллергенов
        if (allergens && hasAllergenTags) {
            const allergenArray = Array.isArray(allergens) ? allergens : allergens.split(',').map(a => a.trim());
            if (allergenArray.length > 0) {
                whereConditions += ` AND NOT (o.allergen_tags && $${paramIndex}::text[])`;
                params.push(allergenArray);
                paramIndex++;
            }
        }

        // Сортировка
        let orderBy = '';
        switch (sort) {
            case 'price':
                orderBy = ` ORDER BY o.discounted_price ASC`;
                break;
            case 'rating':
                if (hasRatingAvg && hasRatingCount) {
                    orderBy = ` ORDER BY COALESCE(o.rating_avg, 0) DESC, o.rating_count DESC`;
                } else {
                    orderBy = ` ORDER BY o.created_at DESC`;
                }
                break;
            case 'distance':
            default:
                if (lat && lon) {
                    orderBy = ` ORDER BY distance_km ASC`;
                } else {
                    orderBy = ` ORDER BY o.created_at DESC`;
                }
                break;
        }

        // Формируем финальный запрос
        query += whereConditions + orderBy;

        // Подсчет общего количества
        let countQuery = `
            SELECT COUNT(DISTINCT o.id) as count
            FROM offers o
            JOIN users u ON o.business_id = u.id
            ${hasBusinessLocations ? 'LEFT JOIN business_locations bl ON o.location_id = bl.id AND bl.is_active = true' : ''}
            WHERE u.is_business = true
            AND o.is_active = true
            AND o.quantity_available > 0
            AND (u.coord_0 IS NOT NULL AND u.coord_1 IS NOT NULL)
        `;
        
        const whereStart = whereConditions.indexOf('WHERE');
        if (whereStart !== -1) {
            const conditionsAfterWhere = whereConditions.substring(whereStart + 5).trim();
            if (conditionsAfterWhere) {
                countQuery += ' AND ' + conditionsAfterWhere;
            }
        }
        
        const countParams = params.slice();
        
        let totalCount = 0;
        try {
            const countResult = await pool.query(countQuery, countParams);
            totalCount = parseInt(countResult.rows[0]?.count || 0);
        } catch (countError) {
            logger.error('Ошибка подсчета количества:', {
                error: countError.message,
                stack: countError.stack
            });
            totalCount = 0;
        }

        // Добавляем лимит и оффсет
        const finalParamIndex = paramIndex;
        query += ` LIMIT $${finalParamIndex} OFFSET $${finalParamIndex + 1}`;
        params.push(limitNum, offset);

        // Выполняем запрос
        const result = await pool.query(query, params);

        // Форматируем результат
        const offers = result.rows.map(row => {
            const businessLat = row.business_lat != null ? parseFloat(row.business_lat) : null;
            const businessLon = row.business_lon != null ? parseFloat(row.business_lon) : null;
            const businessCoords = (businessLat != null && businessLon != null) ? [businessLat, businessLon] : null;
            
            let locationCoords = null;
            if (row.location_id && row.location_lat != null && row.location_lon != null) {
                const locLat = parseFloat(row.location_lat);
                const locLon = parseFloat(row.location_lon);
                if (!isNaN(locLat) && !isNaN(locLon)) {
                    locationCoords = [locLat, locLon];
                }
            }
            
            return {
                id: row.id,
                title: row.title,
                description: row.description,
                image_url: row.image_url,
                original_price: parseFloat(row.original_price) || 0,
                discounted_price: parseFloat(row.discounted_price) || 0,
                quantity_available: row.quantity_available || 0,
                pickup_time_start: row.pickup_time_start,
                pickup_time_end: row.pickup_time_end,
                is_active: row.is_active,
                cuisine_tags: (row.cuisine_tags && Array.isArray(row.cuisine_tags)) ? row.cuisine_tags : [],
                diet_tags: (row.diet_tags && Array.isArray(row.diet_tags)) ? row.diet_tags : [],
                allergen_tags: (row.allergen_tags && Array.isArray(row.allergen_tags)) ? row.allergen_tags : [],
                rating_avg: row.rating_avg != null ? parseFloat(row.rating_avg) : 0,
                rating_count: row.rating_count != null ? parseInt(row.rating_count) : 0,
                created_at: row.created_at,
                distance_km: row.distance_km ? parseFloat(row.distance_km) : null,
                business: {
                    id: row.business_id,
                    name: row.business_name || '',
                    address: row.business_address || '',
                    coords: businessCoords,
                    logo_url: row.business_logo_url || null,
                    rating: parseFloat(row.business_rating) || 0,
                    total_reviews: row.business_total_reviews || 0,
                    phone: row.business_phone || null,
                    working_hours: row.business_working_hours || null,
                    website: row.business_website || null,
                    establishment_type: row.business_establishment_type || null
                },
                location: row.location_id ? {
                    id: row.location_id,
                    name: row.location_name || '',
                    address: row.location_address || '',
                    coords: locationCoords
                } : null
            };
        });

        const responseData = {
            offers,
            meta: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                total_pages: Math.ceil(totalCount / limitNum)
            }
        };

        // Сохраняем в кэш
        searchCache.set(cacheKey, {
            timestamp: Date.now(),
            data: responseData,
            meta: responseData.meta
        });

        // Очистка старых записей из кэша
        if (searchCache.size > 1000) {
            const now = Date.now();
            for (const [key, value] of searchCache.entries()) {
                if (now - value.timestamp > CACHE_TTL) {
                    searchCache.delete(key);
                }
            }
        }

        logger.info(`🔍 Поиск завершен: найдено ${offers.length} офферов из ${totalCount}`);

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        logger.error('❌ Ошибка в /offers/search:', {
            message: error.message,
            stack: error.stack,
            query: req.query,
            url: req.url
        });
        
        res.status(200).json({
            success: true,
            data: {
                offers: [],
                meta: {
                    total: 0,
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20,
                    total_pages: 0
                }
            },
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}));

// POST /offers/upload-photo/:offerId - Загрузить фото для предложения
offersRouter.post("/upload-photo/:offerId", upload.single("photo"), handleMulterError, asyncHandler(async (req, res) => {
    const offer_id = req.params.offerId;
    const businessId = req.session.userId;

    if (!req.file) {
        throw new AppError("Файл не загружен", 400, "NO_FILE");
    }

    // Проверяем, что оффер принадлежит бизнесу
    const offerCheck = await pool.query(
        "SELECT id, business_id FROM offers WHERE id = $1 AND business_id = $2",
        [offer_id, businessId]
    );

    if (offerCheck.rowCount === 0) {
        throw new AppError("Предложение не найдено", 404, "OFFER_NOT_FOUND");
    }

    // Обновляем image_url (используем относительный путь)
    const image_url = `/uploads/offers/${req.file.filename}`;
    if (storageLib.isS3Enabled()) {
        const key = `offers/${req.file.filename}`;
        const ok = await storageLib.uploadToS3(req.file.path, key, req.file.mimetype || "image/jpeg");
        if (ok) try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    await pool.query(
        "UPDATE offers SET image_url = $1 WHERE id = $2",
        [image_url, offer_id]
    );

    res.json({
        success: true,
        message: "Фото загружено",
        image_url: image_url
    });
}));

// GET /offers/:id/schedule/:scheduleId - Удалить расписание (самый специфичный)
offersRouter.delete("/:id/schedule/:scheduleId", asyncHandler(async (req, res) => {
    const { id, scheduleId } = req.params;
    const businessId = req.session.userId;

    // Проверяем, что расписание принадлежит бизнесу
    const scheduleCheck = await pool.query(
        `SELECT s.id FROM offer_schedules s
         JOIN offers o ON s.offer_id = o.id
         WHERE s.id = $1 AND o.business_id = $2`,
        [scheduleId, businessId]
    );

    if (scheduleCheck.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: "SCHEDULE_NOT_FOUND",
            message: "Расписание не найдено"
        });
    }

    await pool.query(
        `DELETE FROM offer_schedules WHERE id = $1`,
        [scheduleId]
    );

    logger.info(`🗑️ Удалено расписание ${scheduleId} для оффера ${id}`);

    res.json({
        success: true,
        message: "Расписание удалено"
    });
}));

// GET /offers/:id/schedule - Получить расписания для оффера
offersRouter.get("/:id/schedule", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const businessId = req.session.userId;

    // Проверяем, что оффер принадлежит бизнесу
    const offerCheck = await pool.query(
        `SELECT id, business_id FROM offers WHERE id = $1 AND business_id = $2`,
        [id, businessId]
    );

    if (offerCheck.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: "OFFER_NOT_FOUND",
            message: "Оффер не найден"
        });
    }

    const schedules = await pool.query(
        `SELECT id, offer_id, publish_at, unpublish_at, qty_planned, is_active, created_at
         FROM offer_schedules
         WHERE offer_id = $1
         ORDER BY publish_at ASC`,
        [id]
    );

    res.json({
        success: true,
        data: schedules.rows
    });
}));

// POST /offers/:id/schedule - Создать/обновить расписание для оффера
offersRouter.post("/:id/schedule", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { publish_at, unpublish_at, qty_planned } = req.body;
    const businessId = req.session.userId;

    // Валидация
    if (!publish_at) {
        return res.status(400).json({
            success: false,
            error: "INVALID_REQUEST",
            message: "Необходимо указать время публикации"
        });
    }

    const publishDate = new Date(publish_at);
    if (isNaN(publishDate.getTime())) {
        return res.status(400).json({
            success: false,
            error: "INVALID_DATE",
            message: "Неверный формат даты публикации"
        });
    }

    if (publishDate < new Date()) {
        return res.status(400).json({
            success: false,
            error: "INVALID_DATE",
            message: "Время публикации не может быть в прошлом"
        });
    }

    // Проверяем, что оффер принадлежит бизнесу
    const offerCheck = await pool.query(
        `SELECT id, business_id FROM offers WHERE id = $1 AND business_id = $2`,
        [id, businessId]
    );

    if (offerCheck.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: "OFFER_NOT_FOUND",
            message: "Оффер не найден"
        });
    }

    // Создаем расписание
    const result = await pool.query(
        `INSERT INTO offer_schedules (offer_id, business_id, publish_at, unpublish_at, qty_planned)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, offer_id, publish_at, unpublish_at, qty_planned, is_active, created_at`,
        [id, businessId, publishDate, unpublish_at ? new Date(unpublish_at) : null, qty_planned || null]
    );

    logger.info(`📅 Создано расписание для оффера ${id}: ${publishDate.toISOString()}`);

    res.json({
        success: true,
        data: result.rows[0],
        message: "Расписание создано"
    });
}));

// ============================================
// ОСНОВНЫЕ МАРШРУТЫ
// ============================================

// Получить все предложения текущего бизнеса
offersRouter.get("/mine", asyncHandler(async (req, res) => {
    const businessId = req.session?.userId;

    if (!businessId) {
        return res.status(401).json({
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Необходима авторизация"
        });
    }

    try {
        // Поддержка БД без колонки offer_type (до применения миграции add-offer-type.sql)
        let hasOfferType = false;
        try {
            const colCheck = await pool.query(`
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'offers' AND column_name = 'offer_type'
            `);
            hasOfferType = colCheck.rows.length > 0;
        } catch (e) {
            logger.warn("Offer type column check failed:", e.message);
        }

        const offerTypeSelect = hasOfferType ? `COALESCE(offer_type, 'dish') as offer_type` : `'dish'::text as offer_type`;
        const orderBy = hasOfferType ? `ORDER BY offer_type, created_at DESC` : `ORDER BY created_at DESC`;

        const result = await pool.query(
            `SELECT 
                id, 
                title, 
                description, 
                image_url,
                original_price, 
                discounted_price, 
                quantity_available,
                pickup_time_start,
                pickup_time_end,
                is_active,
                ${offerTypeSelect},
                created_at
            FROM offers 
            WHERE business_id = $1 
            ${orderBy}`,
            [businessId]
        );

        logger.info("Offers retrieved", { 
            businessId, 
            count: result.rows.length 
        });

        res.json({
            success: true,
            offers: result.rows,
        });
    } catch (error) {
        logger.error("Error in /business/offers/mine:", {
            error: error.message,
            stack: error.stack,
            businessId
        });
        res.status(500).json({
            success: false,
            error: "DATABASE_ERROR",
            message: "Ошибка при получении предложений"
        });
    }
}));

// Создать новое предложение (с загрузкой фото)
offersRouter.post("/create", upload.single('image'), handleMulterError, sanitizePlainTextFields(['title', 'description']), validateOffer, asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        original_price, 
        discounted_price, 
        quantity_available,
        pickup_time_start,
        pickup_time_end,
        is_active,
        location_id,
        offer_type
    } = req.body;

    // URL загруженного изображения
    const image_url = req.file ? `/uploads/offers/${req.file.filename}` : null;
    if (req.file && storageLib.isS3Enabled()) {
        const key = `offers/${req.file.filename}`;
        const ok = await storageLib.uploadToS3(req.file.path, key, req.file.mimetype || "image/jpeg");
        if (ok) try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    // Валидация location_id (если указан, проверяем что локация принадлежит бизнесу)
    if (location_id) {
        // Проверяем существование таблицы business_locations
        const tableCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'business_locations'
        `);

        if (tableCheck.rows.length > 0) {
            const locationCheck = await pool.query(
                `SELECT id FROM business_locations 
                 WHERE id = $1 AND business_id = $2 AND is_active = true`,
                [location_id, req.session.userId]
            );

            if (locationCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "INVALID_LOCATION",
                    message: "Указанная локация не найдена или не принадлежит вашему бизнесу"
                });
            }
        } else {
            // Таблица не существует, игнорируем location_id
            logger.warn("Table business_locations does not exist, ignoring location_id", { 
                businessId: req.session.userId,
                location_id 
            });
        }
    }

    const typeVal = offer_type === 'special_box' ? 'special_box' : 'dish';
    const result = await pool.query(
        `INSERT INTO offers(
            business_id, 
            location_id,
            title, 
            description, 
            image_url,
            original_price, 
            discounted_price, 
            quantity_available,
            pickup_time_start,
            pickup_time_end,
            is_active,
            offer_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING 
            id, 
            location_id,
            title, 
            description,
            image_url, 
            original_price, 
            discounted_price, 
            quantity_available,
            pickup_time_start,
            pickup_time_end,
            is_active,
            offer_type,
            created_at`,
        [
            req.session.userId,
            location_id || null,
            title,
            description || null,
            image_url,
            original_price,
            discounted_price,
            quantity_available,
            pickup_time_start,
            pickup_time_end,
            is_active !== undefined ? is_active : true,
            typeVal
        ]
    );

    logger.info("Offer created", { 
        offerId: result.rows[0].id, 
        businessId: req.session.userId,
        title,
        hasImage: !!image_url
    });

    res.status(201).json({
        success: true,
        offer: result.rows[0],
        message: "Предложение успешно создано"
    });
}));

// Редактировать предложение (с загрузкой фото)
offersRouter.post("/edit", upload.single('image'), handleMulterError, sanitizePlainTextFields(['title', 'description']), asyncHandler(async (req, res) => {
    const { 
        id, 
        title, 
        description, 
        original_price, 
        discounted_price, 
        quantity_available,
        pickup_time_start,
        pickup_time_end,
        is_active,
        location_id,
        offer_type
    } = req.body;

    // Базовая валидация
    if (!id) {
        throw new AppError("ID предложения обязателен", 400, "MISSING_ID");
    }

    if (!title || title.length < 3) {
        throw new AppError("Название должно содержать минимум 3 символа", 400, "INVALID_TITLE");
    }

    // Проверка владельца
    const checkResult = await pool.query(
        "SELECT business_id, image_url FROM offers WHERE id = $1",
        [id]
    );

    if (checkResult.rowCount === 0) {
        throw new AppError("Предложение не найдено", 404, "OFFER_NOT_FOUND");
    }

    if (checkResult.rows[0].business_id !== req.session.userId) {
        throw new AppError("Нет прав для редактирования", 403, "NO_AUTHORITY");
    }

    // Валидация location_id (если указан, проверяем что локация принадлежит бизнесу)
    if (location_id !== undefined) {
        if (location_id) {
            const locationCheck = await pool.query(
                `SELECT id FROM business_locations 
                 WHERE id = $1 AND business_id = $2 AND is_active = true`,
                [location_id, req.session.userId]
            );

            if (locationCheck.rows.length === 0) {
                throw new AppError("Указанная локация не найдена или не принадлежит вашему бизнесу", 400, "INVALID_LOCATION");
            }
        }
    }

    // URL загруженного изображения (если есть новое)
    const image_url = req.file 
        ? `/uploads/offers/${req.file.filename}` 
        : checkResult.rows[0].image_url; // Оставляем старое
    if (req.file && storageLib.isS3Enabled()) {
        const key = `offers/${req.file.filename}`;
        const ok = await storageLib.uploadToS3(req.file.path, key, req.file.mimetype || "image/jpeg");
        if (ok) try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    const typeVal = offer_type === 'special_box' ? 'special_box' : 'dish';
    const updates = [
        'title = $1',
        'description = $2',
        'image_url = $3',
        'original_price = $4',
        'discounted_price = $5',
        'quantity_available = $6',
        'pickup_time_start = $7',
        'pickup_time_end = $8',
        'is_active = $9',
        'offer_type = $10',
        'updated_at = CURRENT_TIMESTAMP'
    ];
    const values = [
        title, 
        description, 
        image_url,
        original_price, 
        discounted_price, 
        quantity_available,
        pickup_time_start,
        pickup_time_end,
        is_active !== undefined ? is_active : true,
        typeVal
    ];

    if (location_id !== undefined) {
        updates.push('location_id = $' + (values.length + 1));
        values.push(location_id || null);
    }

    values.push(id);

    await pool.query(
        `UPDATE offers 
        SET ${updates.join(', ')}
        WHERE id = $${values.length}`,
        values
    );

    logger.info("Offer updated", { 
        offerId: id, 
        businessId: req.session.userId,
        title,
        hasNewImage: !!req.file
    });

    res.json({
        success: true,
        message: "Предложение успешно обновлено"
    });
}));

// PATCH endpoint для частичного обновления оффера
offersRouter.patch("/:id", upload.single('image'), handleMulterError, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Проверка владельца
    const checkResult = await pool.query(
        "SELECT business_id, image_url FROM offers WHERE id = $1",
        [id]
    );

    if (checkResult.rowCount === 0) {
        throw new AppError("Предложение не найдено", 404, "OFFER_NOT_FOUND");
    }

    if (checkResult.rows[0].business_id !== req.session.userId) {
        throw new AppError("Нет прав для редактирования", 403, "NO_AUTHORITY");
    }

    // Формируем динамический запрос обновления
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        values.push(updates.title);
    }

    if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(updates.description);
    }

    if (req.file) {
        if (storageLib.isS3Enabled()) {
            const key = `offers/${req.file.filename}`;
            const ok = await storageLib.uploadToS3(req.file.path, key, req.file.mimetype || "image/jpeg");
            if (ok) try { fs.unlinkSync(req.file.path); } catch (_) {}
        }
        updateFields.push(`image_url = $${paramIndex++}`);
        values.push(`/uploads/offers/${req.file.filename}`);
    }

    if (updates.original_price !== undefined) {
        updateFields.push(`original_price = $${paramIndex++}`);
        values.push(updates.original_price);
    }

    if (updates.discounted_price !== undefined) {
        updateFields.push(`discounted_price = $${paramIndex++}`);
        values.push(updates.discounted_price);
    }

    if (updates.quantity_available !== undefined) {
        updateFields.push(`quantity_available = $${paramIndex++}`);
        values.push(updates.quantity_available);
    }

    if (updates.pickup_time_start !== undefined) {
        updateFields.push(`pickup_time_start = $${paramIndex++}`);
        values.push(updates.pickup_time_start);
    }

    if (updates.pickup_time_end !== undefined) {
        updateFields.push(`pickup_time_end = $${paramIndex++}`);
        values.push(updates.pickup_time_end);
    }

    if (updates.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        values.push(updates.is_active);
    }

    if (updateFields.length === 0) {
        throw new AppError("Нет данных для обновления", 400, "NO_UPDATES");
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
        UPDATE offers 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
    `;

    const result = await pool.query(query, values);

    logger.info("Offer patched", { 
        offerId: id, 
        businessId: req.session.userId,
        updatedFields: Object.keys(updates)
    });

    res.json({
        success: true,
        offer: result.rows[0],
        message: "Предложение успешно обновлено"
    });
}));

// Удалить предложение
offersRouter.post("/delete", asyncHandler(async (req, res) => {
    const { id } = req.body;

    const checkResult = await pool.query(
        "SELECT business_id FROM offers WHERE id = $1",
        [id]
    );

    if (checkResult.rowCount === 0) {
        throw new AppError("Предложение не найдено", 404, "OFFER_NOT_FOUND");
    }

    if (checkResult.rows[0].business_id !== req.session.userId) {
        throw new AppError("Нет прав для удаления", 403, "NO_AUTHORITY");
    }

    await pool.query("DELETE FROM offers WHERE id = $1", [id]);

    logger.info("Offer deleted", { 
        offerId: id, 
        businessId: req.session.userId 
    });

    res.json({
        success: true,
        message: "Предложение успешно удалено"
    });
}));

// Активировать/деактивировать предложение
offersRouter.post("/toggle", asyncHandler(async (req, res) => {
    const { id, is_active } = req.body;

    const checkResult = await pool.query(
        "SELECT business_id FROM offers WHERE id = $1",
        [id]
    );

    if (checkResult.rowCount === 0) {
        throw new AppError("Предложение не найдено", 404, "OFFER_NOT_FOUND");
    }

    if (checkResult.rows[0].business_id !== req.session.userId) {
        throw new AppError("Нет прав для изменения статуса", 403, "NO_AUTHORITY");
    }

    await pool.query(
        "UPDATE offers SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [is_active, id]
    );

    logger.info("Offer status toggled", { 
        offerId: id, 
        businessId: req.session.userId,
        isActive: is_active 
    });

    res.json({
        success: true,
        message: `Предложение ${is_active ? 'активировано' : 'деактивировано'}`
    });
}));

// Дубликат удален - маршрут уже определен выше в секции специфичных маршрутов

// Публичные предложения для клиентов
offersRouter.get("/", asyncHandler(async (req, res) => {
    try {
        console.log("🔍 Запрос /customer/offers");

        // Проверяем наличие таблиц
        const tablesCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = ANY($1)
        `, [[ 'offers', 'businesses', 'users' ]]);
        const have = tablesCheck.rows.map(r => r.table_name);

        if (!have.includes('offers')) {
            console.warn('⚠️ Таблица offers отсутствует. Возвращаем пустой список.');
            return res.json({ success: true, data: [] });
        }

        // Выясняем доступные колонки и строим SELECT динамически
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
        const activeCond = has('is_active') ? 'o.is_active = true' : '1=1';

        let query;
        if (have.includes('businesses')) {
            // Современная схема: JOIN businesses
            query = `
                SELECT 
                    o.id,
                    o.business_id,
                    ${titleSel} as title,
                    ${descSel} as description,
                    ${imageSel} as image_url,
                    ${origPriceSel} as original_price,
                    ${discPriceSel} as discounted_price,
                    ${qtySel} as quantity_available,
                    ${startSel} as pickup_time_start,
                    ${endSel} as pickup_time_end,
                    ${createdSel} as created_at,
                    b.name AS business_name,
                    b.address AS business_address,
                    b.coord_0,
                    b.coord_1,
                    b.phone AS business_phone,
                    b.email AS business_email
                FROM offers o
                LEFT JOIN businesses b ON o.business_id = b.id
                WHERE ${activeCond}
                ORDER BY ${createdSel} DESC
            `;
        } else {
            // Legacy схема: JOIN users (business_id указывает на users.id)
            query = `
                SELECT 
                    o.id,
                    o.business_id,
                    ${titleSel} as title,
                    ${descSel} as description,
                    ${imageSel} as image_url,
                    ${origPriceSel} as original_price,
                    ${discPriceSel} as discounted_price,
                    ${qtySel} as quantity_available,
                    ${startSel} as pickup_time_start,
                    ${endSel} as pickup_time_end,
                    ${createdSel} as created_at,
                    u.name AS business_name,
                    u.address AS business_address,
                    u.coord_0,
                    u.coord_1,
                    NULL::text AS business_phone,
                    u.email AS business_email
                FROM offers o
                LEFT JOIN users u ON o.business_id = u.id
                WHERE ${activeCond}
                ORDER BY ${createdSel} DESC
            `;
        }

        const result = await pool.query(query);
        console.log(`✅ Найдено ${result.rows.length} предложений`);

        return res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("❌ Ошибка в /customer/offers:", error);
        return res.status(200).json({ success: true, data: [] });
    }
}));



module.exports = offersRouter;

