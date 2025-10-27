const express = require("express");
const offersRouter = express.Router();
const pool = require("../lib/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../lib/logger");
const { AppError, asyncHandler } = require("../lib/errorHandler");
const { validateOffer } = require("../lib/validation");
const { sanitizePlainTextFields } = require("../middleware/sanitization");

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
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
    storage: storage,
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

// Получить все предложения текущего бизнеса
offersRouter.get("/mine", asyncHandler(async (req, res) => {
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
            created_at
        FROM offers 
        WHERE business_id = $1 
        ORDER BY created_at DESC`,
        [req.session.userId]
    );

    logger.info("Offers retrieved", { 
        businessId: req.session.userId, 
        count: result.rows.length 
    });

    res.json({
        success: true,
        offers: result.rows,
    });
}));

// Создать новое предложение (с загрузкой фото)
offersRouter.post("/create", upload.single('image'), sanitizePlainTextFields(['title', 'description']), validateOffer, asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        original_price, 
        discounted_price, 
        quantity_available,
        pickup_time_start,
        pickup_time_end,
        is_active
    } = req.body;

    // URL загруженного изображения
    const image_url = req.file ? `/uploads/offers/${req.file.filename}` : null;

    const result = await pool.query(
        `INSERT INTO offers(
            business_id, 
            title, 
            description, 
            image_url,
            original_price, 
            discounted_price, 
            quantity_available,
            pickup_time_start,
            pickup_time_end,
            is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING 
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
            created_at`,
        [
            req.session.userId,
            title,
            description || null,
            image_url,
            original_price,
            discounted_price,
            quantity_available,
            pickup_time_start,
            pickup_time_end,
            is_active !== undefined ? is_active : true
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
offersRouter.post("/edit", upload.single('image'), sanitizePlainTextFields(['title', 'description']), asyncHandler(async (req, res) => {
    const { 
        id, 
        title, 
        description, 
        original_price, 
        discounted_price, 
        quantity_available,
        pickup_time_start,
        pickup_time_end,
        is_active
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

    // URL загруженного изображения (если есть новое)
    const image_url = req.file 
        ? `/uploads/offers/${req.file.filename}` 
        : checkResult.rows[0].image_url; // Оставляем старое

    await pool.query(
        `UPDATE offers 
        SET 
            title = $1, 
            description = $2,
            image_url = $3, 
            original_price = $4, 
            discounted_price = $5, 
            quantity_available = $6,
            pickup_time_start = $7,
            pickup_time_end = $8,
            is_active = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10`,
        [
            title, 
            description, 
            image_url,
            original_price, 
            discounted_price, 
            quantity_available,
            pickup_time_start,
            pickup_time_end,
            is_active !== undefined ? is_active : true,
            id
        ]
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
offersRouter.patch("/:id", upload.single('image'), asyncHandler(async (req, res) => {
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

// POST /upload-photo/:offer_id - Загрузить фото для предложения
offersRouter.post("/upload-photo/:offer_id", upload.single("photo"), asyncHandler(async (req, res) => {
    const { offer_id } = req.params;
    const business_id = req.session.userId;

    if (!req.file) {
        throw new AppError("Файл не загружен", 400, "NO_FILE_UPLOADED");
    }

    // Проверка что предложение принадлежит текущему бизнесу
    const checkResult = await pool.query(
        `SELECT id, image_url FROM offers WHERE id = $1 AND business_id = $2`,
        [offer_id, business_id]
    );

    if (checkResult.rowCount === 0) {
        // Удаляем загруженный файл если предложение не найдено
        fs.unlinkSync(req.file.path);
        throw new AppError("Предложение не найдено", 404, "OFFER_NOT_FOUND");
    }

    // Удаляем старое фото если существует
    const oldImageUrl = checkResult.rows[0].image_url;
    if (oldImageUrl) {
        const oldImagePath = path.join(__dirname, "../../uploads/offers", path.basename(oldImageUrl));
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    // Формируем URL для фото
    const imageUrl = `/uploads/offers/${req.file.filename}`;

    // Обновляем запись в БД
    await pool.query(
        `UPDATE offers SET image_url = $1 WHERE id = $2`,
        [imageUrl, offer_id]
    );

    logger.info("Photo uploaded", { 
        offerId: offer_id, 
        businessId: business_id,
        imageUrl 
    });

    res.json({ 
        success: true, 
        image_url: imageUrl,
        message: "Фото успешно загружено"
    });
}));

module.exports = offersRouter;

