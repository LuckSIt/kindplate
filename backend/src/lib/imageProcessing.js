/**
 * Утилиты для обработки и оптимизации изображений
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Конфигурация размеров для разных типов изображений
 */
const IMAGE_CONFIGS = {
    offer: {
        sizes: [
            { width: 400, suffix: '-thumb' },
            { width: 800, suffix: '-medium' },
            { width: 1200, suffix: '-large' },
        ],
        quality: {
            webp: 85,
            jpeg: 90,
        },
    },
    avatar: {
        sizes: [
            { width: 100, suffix: '-small' },
            { width: 200, suffix: '-medium' },
        ],
        quality: {
            webp: 90,
            jpeg: 95,
        },
    },
    logo: {
        sizes: [
            { width: 200, suffix: '-small' },
            { width: 400, suffix: '-medium' },
        ],
        quality: {
            webp: 90,
            jpeg: 95,
        },
    },
};

/**
 * Обрабатывает загруженное изображение: создает WebP версии и thumbnails
 * @param {string} filePath - Путь к оригинальному файлу
 * @param {string} type - Тип изображения (offer, avatar, logo)
 * @returns {Promise<Object>} - Объект с путями к созданным файлам
 */
async function processImage(filePath, type = 'offer') {
    const config = IMAGE_CONFIGS[type] || IMAGE_CONFIGS.offer;
    const parsedPath = path.parse(filePath);
    const results = {
        original: filePath,
        webp: [],
        thumbnails: [],
    };

    try {
        // Загружаем изображение
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // Создаем WebP версию оригинала
        const webpOriginalPath = path.join(
            parsedPath.dir,
            `${parsedPath.name}.webp`
        );
        await image
            .webp({ quality: config.quality.webp })
            .toFile(webpOriginalPath);
        results.webp.push(webpOriginalPath);

        // Создаем thumbnails и их WebP версии
        for (const size of config.sizes) {
            const thumbPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${size.suffix}${parsedPath.ext}`
            );
            const thumbWebpPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${size.suffix}.webp`
            );

            // JPEG/PNG thumbnail
            await sharp(filePath)
                .resize(size.width, null, {
                    withoutEnlargement: true,
                    fit: 'inside',
                })
                .jpeg({ quality: config.quality.jpeg })
                .toFile(thumbPath);
            results.thumbnails.push(thumbPath);

            // WebP thumbnail
            await sharp(filePath)
                .resize(size.width, null, {
                    withoutEnlargement: true,
                    fit: 'inside',
                })
                .webp({ quality: config.quality.webp })
                .toFile(thumbWebpPath);
            results.webp.push(thumbWebpPath);
        }

        return results;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

/**
 * Валидация MIME типов изображений
 */
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
];

/**
 * Проверяет, является ли MIME тип допустимым
 */
function isValidImageMimeType(mimetype) {
    return ALLOWED_MIME_TYPES.includes(mimetype);
}

/**
 * Проверяет реальный тип файла (не только по расширению)
 * Использует sharp для проверки, что файл действительно изображение
 */
async function validateImageFile(filePath) {
    try {
        const metadata = await sharp(filePath).metadata();
        return {
            valid: true,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            size: metadata.size,
        };
    } catch (error) {
        return {
            valid: false,
            error: 'Invalid image file',
        };
    }
}

/**
 * Удаляет все связанные файлы изображения (оригинал + WebP + thumbnails)
 */
async function deleteImageFiles(originalPath) {
    const parsedPath = path.parse(originalPath);
    const filesToDelete = [originalPath];

    // Добавляем WebP версию
    filesToDelete.push(
        path.join(parsedPath.dir, `${parsedPath.name}.webp`)
    );

    // Добавляем thumbnails
    for (const type of Object.keys(IMAGE_CONFIGS)) {
        const config = IMAGE_CONFIGS[type];
        for (const size of config.sizes) {
            filesToDelete.push(
                path.join(
                    parsedPath.dir,
                    `${parsedPath.name}${size.suffix}${parsedPath.ext}`
                )
            );
            filesToDelete.push(
                path.join(
                    parsedPath.dir,
                    `${parsedPath.name}${size.suffix}.webp`
                )
            );
        }
    }

    // Удаляем все файлы
    const deletePromises = filesToDelete.map(async (file) => {
        try {
            await fs.unlink(file);
        } catch (err) {
            // Игнорируем ошибки, если файл не существует
            if (err.code !== 'ENOENT') {
                console.error(`Error deleting ${file}:`, err);
            }
        }
    });

    await Promise.all(deletePromises);
}

/**
 * Генерирует URL для различных версий изображения
 */
function generateImageUrls(originalUrl, baseUrl = '') {
    const parsedUrl = path.parse(originalUrl);
    const result = {
        original: originalUrl,
        webp: `${parsedUrl.dir}/${parsedUrl.name}.webp`,
        thumbnails: {},
    };

    // Генерируем URLs для thumbnails
    for (const type of Object.keys(IMAGE_CONFIGS)) {
        const config = IMAGE_CONFIGS[type];
        for (const size of config.sizes) {
            const suffix = size.suffix.replace('-', '');
            result.thumbnails[suffix] = {
                jpeg: `${parsedUrl.dir}/${parsedUrl.name}${size.suffix}${parsedUrl.ext}`,
                webp: `${parsedUrl.dir}/${parsedUrl.name}${size.suffix}.webp`,
            };
        }
    }

    return result;
}

module.exports = {
    processImage,
    isValidImageMimeType,
    validateImageFile,
    deleteImageFiles,
    generateImageUrls,
    ALLOWED_MIME_TYPES,
    IMAGE_CONFIGS,
};

