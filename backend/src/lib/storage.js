/**
 * Абстракция хранилища загрузок: локальный диск или S3-совместимое хранилище.
 * При настройке S3 файлы сохраняются в облаке и не пропадают после перезапуска.
 */

const fs = require("fs");
const logger = require("./logger");

let s3Client = null;

function isS3Enabled() {
    return Boolean(
        process.env.S3_BUCKET &&
        process.env.S3_ACCESS_KEY_ID &&
        process.env.S3_SECRET_ACCESS_KEY
    );
}

function getS3Client() {
    if (!isS3Enabled()) return null;
    if (s3Client) return s3Client;

    try {
        const { S3Client } = require("@aws-sdk/client-s3");
        const region = process.env.S3_REGION || "ru-central1";
        const cfg = {
            region,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
        };
        if (process.env.S3_ENDPOINT) {
            cfg.endpoint = process.env.S3_ENDPOINT;
            cfg.forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
        }
        s3Client = new S3Client(cfg);
        logger.info("S3 storage enabled", { bucket: process.env.S3_BUCKET, region });
        return s3Client;
    } catch (err) {
        logger.error("S3 client init failed", err);
        return null;
    }
}

const bucket = () => process.env.S3_BUCKET || "";

/**
 * Загрузить файл с диска в S3.
 * @param {string} localPath - полный путь к файлу
 * @param {string} key - ключ в бакете, например "offers/123.jpg"
 * @param {string} [contentType] - MIME-тип
 * @returns {Promise<boolean>} true если успешно
 */
async function uploadToS3(localPath, key, contentType) {
    const client = getS3Client();
    if (!client) return false;

    try {
        const { PutObjectCommand } = require("@aws-sdk/client-s3");
        const stat = fs.statSync(localPath);
        const stream = fs.createReadStream(localPath);
        const cmd = new PutObjectCommand({
            Bucket: bucket(),
            Key: key,
            Body: stream,
            ContentLength: stat.size,
            ContentType: contentType || "application/octet-stream",
        });
        await client.send(cmd);
        logger.info("Uploaded to S3", { key });
        return true;
    } catch (err) {
        logger.error("S3 upload failed", { key, error: err.message });
        return false;
    }
}

/**
 * Получить read stream объекта из S3 (для отдачи клиенту).
 * @param {string} key - ключ, например "offers/123.jpg"
 * @returns {Promise<{ stream: Readable, contentType?: string } | null>}
 */
async function getS3Stream(key) {
    const client = getS3Client();
    if (!client) return null;

    try {
        const { GetObjectCommand } = require("@aws-sdk/client-s3");
        const resp = await client.send(
            new GetObjectCommand({ Bucket: bucket(), Key: key })
        );
        if (!resp.Body) return null;
        return {
            stream: resp.Body,
            contentType: resp.ContentType,
            contentLength: resp.ContentLength,
        };
    } catch (err) {
        if (err.name === "NoSuchKey") return null;
        logger.error("S3 get failed", { key, error: err.message });
        return null;
    }
}

/**
 * Создать бакет при старте, если его ещё нет (для MinIO и др.).
 */
async function ensureBucket() {
    const client = getS3Client();
    if (!client || !bucket()) return;

    try {
        const { CreateBucketCommand } = require("@aws-sdk/client-s3");
        await client.send(new CreateBucketCommand({ Bucket: bucket() }));
        logger.info("S3 bucket created", { bucket: bucket() });
    } catch (err) {
        if (err.name === "BucketAlreadyExists" || err.name === "BucketAlreadyOwnedByYou") return;
        logger.warn("S3 bucket ensure failed", { bucket: bucket(), error: err.message });
    }
}

/**
 * Преобразовать URL-путь загрузки в S3-ключ.
 * Пример: /uploads/offers/123.jpg -> offers/123.jpg
 */
function pathToS3Key(urlPath) {
    const normalized = urlPath.replace(/^\/+/, "").toLowerCase();
    if (normalized.startsWith("uploads/")) return normalized.slice("uploads/".length);
    return normalized;
}

module.exports = {
    isS3Enabled,
    getS3Client,
    uploadToS3,
    getS3Stream,
    pathToS3Key,
    ensureBucket,
};
