const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Настройка multer для загрузки фото отзывов
const storage = multer.memoryStorage(); // Используем память для обработки через Sharp

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB максимум
        files: 5 // Максимум 5 фото на отзыв
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

// Middleware для обработки и сжатия фото
async function processReviewPhotos(req, res, next) {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    const uploadDir = path.join(__dirname, '../../uploads/reviews');
    // Создаем папку если не существует
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const processedPhotos = [];
    const errors = [];

    // Обрабатываем каждое фото
    for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        try {
            // Генерируем уникальное имя файла
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `review-${uniqueSuffix}.jpg`;
            const filepath = path.join(uploadDir, filename);

            // Сжимаем и оптимизируем изображение
            await sharp(file.buffer)
                .resize(1200, 1200, { 
                    fit: 'inside', 
                    withoutEnlargement: true 
                }) // Максимальный размер 1200x1200
                .jpeg({ 
                    quality: 85, 
                    progressive: true 
                }) // Конвертируем в JPEG с качеством 85%
                .toFile(filepath);

            // Сохраняем относительный путь
            processedPhotos.push(`/uploads/reviews/${filename}`);
        } catch (error) {
            console.error(`Ошибка обработки фото ${i + 1}:`, error);
            errors.push(`Фото ${i + 1}: ${error.message}`);
        }
    }

    if (errors.length > 0 && processedPhotos.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'PHOTO_PROCESSING_ERROR',
            message: 'Не удалось обработать фото: ' + errors.join(', ')
        });
    }

    // Сохраняем обработанные фото в req.body для дальнейшего использования
    req.body.photos = processedPhotos;
    
    if (errors.length > 0) {
        req.body.photoErrors = errors;
    }

    next();
}

module.exports = {
    upload: upload.array('photos', 5), // До 5 фото
    processReviewPhotos
};

