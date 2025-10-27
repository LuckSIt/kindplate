/**
 * File Upload Middleware with Security
 * Ограничения на размер и тип файлов для безопасности
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../lib/logger");

/**
 * Создает настроенный multer с ограничениями безопасности
 * @param {string} uploadDir - Директория для загрузки
 * @param {number} maxSize - Максимальный размер файла в байтах (по умолчанию 5MB)
 * @param {RegExp} allowedTypes - Разрешенные типы файлов
 */
const createUploadMiddleware = (uploadDir, maxSize = 5 * 1024 * 1024, allowedTypes = /jpeg|jpg|png|webp/) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const fullPath = path.join(__dirname, "../..", uploadDir);
            
            // Создаем папку если не существует
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
            
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            // Генерируем безопасное уникальное имя файла
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname).toLowerCase();
            
            // Санитизируем расширение
            const safeExt = ext.replace(/[^a-z0-9.]/gi, '');
            
            cb(null, uniqueSuffix + safeExt);
        }
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: maxSize, // Максимальный размер файла
            files: 1, // Максимум 1 файл за раз
            fields: 10, // Максимум 10 полей в форме
            fieldSize: 1024 * 1024 // Максимум 1MB на текстовое поле
        },
        fileFilter: function (req, file, cb) {
            // Проверяем расширение файла
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);

            if (mimetype && extname) {
                logger.info('✅ Файл прошел валидацию', {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                });
                return cb(null, true);
            } else {
                logger.warn('❌ Файл не прошел валидацию', {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    allowedTypes: allowedTypes.toString()
                });
                cb(new Error(`Недопустимый тип файла. Разрешены только: ${allowedTypes.source}`));
            }
        }
    });
};

/**
 * Предустановленные конфигурации загрузки
 */
const uploadConfigs = {
    // Загрузка фото предложений
    offers: createUploadMiddleware(
        "uploads/offers",
        5 * 1024 * 1024, // 5MB
        /jpeg|jpg|png|webp/
    ),

    // Загрузка аватаров пользователей
    avatars: createUploadMiddleware(
        "uploads/avatars",
        2 * 1024 * 1024, // 2MB
        /jpeg|jpg|png|webp/
    ),

    // Загрузка логотипов бизнеса
    logos: createUploadMiddleware(
        "uploads/logos",
        3 * 1024 * 1024, // 3MB
        /jpeg|jpg|png|svg|webp/
    )
};

/**
 * Middleware для обработки ошибок загрузки файлов
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Ошибки Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Файл слишком большой',
                message: 'Максимальный размер файла: 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Слишком много файлов',
                message: 'Можно загрузить только 1 файл за раз'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Неожиданное поле файла',
                message: 'Проверьте имя поля для загрузки файла'
            });
        }
        
        return res.status(400).json({
            error: 'Ошибка загрузки файла',
            message: err.message
        });
    }
    
    if (err) {
        // Другие ошибки (например, из fileFilter)
        logger.error('Ошибка загрузки файла:', err);
        return res.status(400).json({
            error: 'Ошибка загрузки файла',
            message: err.message
        });
    }
    
    next();
};

/**
 * Валидация загруженного изображения
 * Дополнительная проверка после загрузки с использованием sharp
 */
const validateImageDimensions = (maxWidth = 4096, maxHeight = 4096, minWidth = 100, minHeight = 100) => {
    return async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            const { validateImageFile } = require('../lib/imageProcessing');
            
            // Проверяем, что файл действительно является изображением
            const validation = await validateImageFile(req.file.path);
            
            if (!validation.valid) {
                // Удаляем невалидный файл
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    logger.error('Не удалось удалить файл:', unlinkError);
                }
                
                return res.status(400).json({
                    error: 'Недопустимый файл изображения',
                    message: 'Файл не является корректным изображением'
                });
            }
            
            // Проверяем размеры изображения
            if (validation.width > maxWidth || validation.height > maxHeight) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    error: 'Изображение слишком большое',
                    message: `Максимальные размеры: ${maxWidth}x${maxHeight}px. Ваше: ${validation.width}x${validation.height}px`
                });
            }
            
            if (validation.width < minWidth || validation.height < minHeight) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    error: 'Изображение слишком маленькое',
                    message: `Минимальные размеры: ${minWidth}x${minHeight}px. Ваше: ${validation.width}x${validation.height}px`
                });
            }
            
            // Сохраняем метаданные в req для дальнейшего использования
            req.imageMetadata = {
                format: validation.format,
                width: validation.width,
                height: validation.height,
            };
            
            logger.info('✅ Изображение валидно', {
                filename: req.file.filename,
                ...req.imageMetadata
            });
            
            next();
        } catch (error) {
            logger.error('Ошибка валидации изображения:', error);
            
            // Удаляем файл в случае ошибки
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    logger.error('Не удалось удалить файл:', unlinkError);
                }
            }
            
            return res.status(500).json({
                error: 'Ошибка обработки изображения',
                message: error.message
            });
        }
    };
};

module.exports = {
    createUploadMiddleware,
    uploadConfigs,
    handleUploadError,
    validateImageDimensions
};

