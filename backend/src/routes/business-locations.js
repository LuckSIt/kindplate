const express = require("express");
const businessLocationsRouter = express.Router();
const pool = require("../lib/db");
const logger = require("../lib/logger");
const { asyncHandler } = require("../lib/errorHandler");

// ============================================
// CRUD ОПЕРАЦИИ ДЛЯ ЛОКАЦИЙ БИЗНЕСОВ
// ============================================

// GET /business/locations - Получить все локации текущего бизнеса
businessLocationsRouter.get("/", asyncHandler(async (req, res) => {
    const businessId = req.session.userId;

    const result = await pool.query(
        `SELECT 
            id, 
            business_id,
            name, 
            address, 
            lat, 
            lon, 
            opening_hours,
            phone,
            is_active,
            created_at,
            updated_at
         FROM business_locations
         WHERE business_id = $1
         ORDER BY created_at DESC`,
        [businessId]
    );

    logger.info("Business locations retrieved", { 
        businessId, 
        count: result.rows.length 
    });

    res.json({
        success: true,
        locations: result.rows
    });
}));

// GET /business/locations/:id - Получить конкретную локацию
businessLocationsRouter.get("/:id", asyncHandler(async (req, res) => {
    const locationId = req.params.id;
    const businessId = req.session.userId;

    const result = await pool.query(
        `SELECT 
            id, 
            business_id,
            name, 
            address, 
            lat, 
            lon, 
            opening_hours,
            phone,
            is_active,
            created_at,
            updated_at
         FROM business_locations
         WHERE id = $1 AND business_id = $2`,
        [locationId, businessId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: "LOCATION_NOT_FOUND",
            message: "Локация не найдена или у вас нет доступа"
        });
    }

    res.json({
        success: true,
        location: result.rows[0]
    });
}));

// POST /business/locations - Создать новую локацию
businessLocationsRouter.post("/", asyncHandler(async (req, res) => {
    const businessId = req.session.userId;
    const { name, address, lat, lon, opening_hours, phone } = req.body;

    // Валидация
    if (!name || !address || lat === undefined || lon === undefined) {
        return res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "Необходимо указать name, address, lat, lon"
        });
    }

    // Проверка, что локация с таким именем не существует
    const existingCheck = await pool.query(
        `SELECT id FROM business_locations 
         WHERE business_id = $1 AND name = $2`,
        [businessId, name]
    );

    if (existingCheck.rows.length > 0) {
        return res.status(409).json({
            success: false,
            error: "DUPLICATE_NAME",
            message: "Локация с таким названием уже существует"
        });
    }

    const result = await pool.query(
        `INSERT INTO business_locations 
         (business_id, name, address, lat, lon, opening_hours, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, business_id, name, address, lat, lon, opening_hours, phone, is_active, created_at, updated_at`,
        [businessId, name, address, lat, lon, opening_hours || null, phone || null]
    );

    logger.info("Business location created", { 
        locationId: result.rows[0].id, 
        businessId,
        name 
    });

    res.status(201).json({
        success: true,
        location: result.rows[0],
        message: "Локация успешно создана"
    });
}));

// PUT /business/locations/:id - Обновить локацию
businessLocationsRouter.put("/:id", asyncHandler(async (req, res) => {
    const locationId = req.params.id;
    const businessId = req.session.userId;
    const { name, address, lat, lon, opening_hours, phone, is_active } = req.body;

    // Проверка владения
    const ownershipCheck = await pool.query(
        `SELECT id FROM business_locations 
         WHERE id = $1 AND business_id = $2`,
        [locationId, businessId]
    );

    if (ownershipCheck.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: "LOCATION_NOT_FOUND",
            message: "Локация не найдена или у вас нет доступа"
        });
    }

    // Проверка на дубликат имени (если имя изменяется)
    if (name) {
        const existingCheck = await pool.query(
            `SELECT id FROM business_locations 
             WHERE business_id = $1 AND name = $2 AND id != $3`,
            [businessId, name, locationId]
        );

        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "DUPLICATE_NAME",
                message: "Локация с таким названием уже существует"
            });
        }
    }

    // Строим запрос динамически
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
    }
    if (address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(address);
    }
    if (lat !== undefined) {
        updates.push(`lat = $${paramIndex++}`);
        values.push(lat);
    }
    if (lon !== undefined) {
        updates.push(`lon = $${paramIndex++}`);
        values.push(lon);
    }
    if (opening_hours !== undefined) {
        updates.push(`opening_hours = $${paramIndex++}`);
        values.push(opening_hours ? JSON.stringify(opening_hours) : null);
    }
    if (phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(phone);
    }
    if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(is_active);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            error: "NO_UPDATES",
            message: "Не указаны поля для обновления"
        });
    }

    values.push(locationId, businessId);

    const result = await pool.query(
        `UPDATE business_locations 
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex++} AND business_id = $${paramIndex++}
         RETURNING id, business_id, name, address, lat, lon, opening_hours, phone, is_active, created_at, updated_at`,
        values
    );

    logger.info("Business location updated", { 
        locationId, 
        businessId 
    });

    res.json({
        success: true,
        location: result.rows[0],
        message: "Локация успешно обновлена"
    });
}));

// DELETE /business/locations/:id - Удалить локацию
businessLocationsRouter.delete("/:id", asyncHandler(async (req, res) => {
    const locationId = req.params.id;
    const businessId = req.session.userId;

    // Проверка владения
    const ownershipCheck = await pool.query(
        `SELECT id FROM business_locations 
         WHERE id = $1 AND business_id = $2`,
        [locationId, businessId]
    );

    if (ownershipCheck.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: "LOCATION_NOT_FOUND",
            message: "Локация не найдена или у вас нет доступа"
        });
    }

    // Проверяем, есть ли офферы, привязанные к этой локации
    const offersCheck = await pool.query(
        `SELECT COUNT(*) as count FROM offers WHERE location_id = $1`,
        [locationId]
    );

    if (parseInt(offersCheck.rows[0].count) > 0) {
        return res.status(409).json({
            success: false,
            error: "LOCATION_HAS_OFFERS",
            message: "Невозможно удалить локацию: к ней привязаны офферы. Сначала удалите или переместите офферы."
        });
    }

    await pool.query(
        `DELETE FROM business_locations 
         WHERE id = $1 AND business_id = $2`,
        [locationId, businessId]
    );

    logger.info("Business location deleted", { 
        locationId, 
        businessId 
    });

    res.json({
        success: true,
        message: "Локация успешно удалена"
    });
}));

module.exports = businessLocationsRouter;

