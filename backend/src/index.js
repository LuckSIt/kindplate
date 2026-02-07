require("dotenv").config();

const express = require("express");
const cookieSession = require("cookie-session");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const fs = require("fs");

const pool = require("./lib/db");
const logger = require("./lib/logger");

// Логируем критичные переменные окружения при старте (без паролей)
if (process.env.NODE_ENV !== 'production') {
    logger.info('🔧 Переменные окружения:');
    logger.info(`   PORT: ${process.env.PORT || 'не установлен (будет использован 5000)'}`);
    logger.info(`   NODE_ENV: ${process.env.NODE_ENV || 'не установлен'}`);
    logger.info(`   DB_HOST: ${process.env.DB_HOST || 'не установлен'}`);
    logger.info(`   DB_NAME: ${process.env.DB_NAME || 'не установлен'}`);
    logger.info(`   DB_USER: ${process.env.DB_USER || 'не установлен'}`);
    logger.info(`   DB_PORT: ${process.env.DB_PORT || 'не установлен'}`);
    logger.info(`   SECRET_KEY: ${process.env.SECRET_KEY ? 'установлен' : 'не установлен'}`);
    logger.info(`   FRONTEND_ORIGIN: ${process.env.FRONTEND_ORIGIN || 'не установлен'}`);
}
const { errorHandler, notFound } = require("./lib/errorHandler");
const { 
    xssProtection, 
    contentSecurityPolicy, 
    noSqlInjectionProtection, 
    sqlInjectionProtection 
} = require("./middleware/security");

const app = express();

// Behind Render's proxy to get correct protocol and set secure cookies
app.set('trust proxy', 1);

// Создаем папку для логов если не существует
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

// Загружаем роуты
const authRouter = require("./routes/auth");
const businessLocationsRouter = require("./routes/business-locations");
const offersRouter = require("./routes/offers");
const ordersRouter = require("./routes/orders");
const paymentsRouter = require("./routes/payments");
const customerRouter = require("./routes/customer");
const customerLocationsRouter = require("./routes/customer-locations");
const cartRouter = require("./routes/cart");
const statsRouter = require("./routes/stats");
const favoritesRouter = require("./routes/favorites");
const reviewsRouter = require("./routes/reviews");
const notificationsRouter = require("./routes/notifications");
const subscriptionsRouter = require("./routes/subscriptions");
const profileRouter = require("./routes/profile");
const adminRouter = require("./routes/admin");

const { businessOnly } = require("./lib/auth");

// ============================================
// CORS - ДОЛЖЕН БЫТЬ ПЕРВЫМ, ДО ВСЕХ ОСТАЛЬНЫХ MIDDLEWARE
// ============================================

// CORS с ограничениями
const corsOptions = {
    origin: function(origin, callback) {
        const envOrigin = process.env.FRONTEND_ORIGIN;
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://localhost:5173",
            "http://172.20.10.2:5173",
            "https://app-kindplate.ru", // Явно добавляем продакшен домен
            envOrigin
        ].filter(Boolean);

        // Разрешаем запросы без origin (например, мобильные приложения, curl)
        if (!origin) return callback(null, true);

        // Разрешаем домены Render *.onrender.com по https
        const isRender = /^https?:\/\/[^.]+\.onrender\.com$/i.test(origin);
        if (isRender) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            logger.info(`✅ CORS разрешён для: ${origin}`);
            callback(null, true);
        } else {
            logger.warn(`❌ CORS блокировка от источника: ${origin}`);
            logger.warn(`   Разрешённые источники: ${allowedOrigins.join(', ')}`);
            logger.warn(`   FRONTEND_ORIGIN из env: ${envOrigin || 'не задан'}`);
            // В продакшене разрешаем все для отладки, но логируем
            if (process.env.NODE_ENV === 'production') {
                logger.warn(`⚠️ PRODUCTION: Разрешаем CORS для ${origin} (нужно добавить в allowedOrigins)`);
                callback(null, true);
            } else {
                callback(new Error('Доступ запрещен политикой CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Применяем CORS ПЕРВЫМ
app.use(cors(corsOptions));

// Явная обработка OPTIONS запросов (preflight) для всех маршрутов.
// В Express 5 (path-to-regexp v6) нельзя использовать голый '*' и синтаксис '/:path*',
// поэтому используем корректный wildcard-формат '/*path'.
app.options('/*path', cors(corsOptions));

// Дополнительный middleware для гарантированной отправки CORS заголовков при ошибках
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://localhost:5173",
            "http://172.20.10.2:5173",
            "https://app-kindplate.ru",
            process.env.FRONTEND_ORIGIN
        ].filter(Boolean);
        
        const isRender = /^https?:\/\/[^.]+\.onrender\.com$/i.test(origin);
        if (allowedOrigins.includes(origin) || isRender || process.env.NODE_ENV === 'production') {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        }
    }
    next();
});

// ============================================
// БЕЗОПАСНОСТЬ: Helmet и защита заголовков
// ============================================

// Helmet для защиты заголовков HTTP (после CORS, чтобы не блокировать CORS заголовки)
app.use(helmet({
    contentSecurityPolicy: false, // Используем свой CSP
    crossOriginEmbedderPolicy: false, // Для Yandex Maps
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false // Для корректной работы CORS
}));

// Собственная политика безопасности контента
app.use(contentSecurityPolicy);

// OPTIONS запросы обрабатываются автоматически через cors middleware

// ============================================
// БЕЗОПАСНОСТЬ: Парсинг и валидация данных
// ============================================

// Ограничение размера body (защита от DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS Protection - очистка от вредоносного кода
app.use(xssProtection);

// NoSQL Injection Protection
app.use(noSqlInjectionProtection);

// SQL Injection Protection
app.use(sqlInjectionProtection);

// Rate limiting для защиты от брутфорса теперь настроен непосредственно в маршрутах auth.
// Здесь дополнительный лимитер НЕ используем, чтобы не дублировать ограничение.

// Раздача статических файлов (фотографии) с кешированием
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
    maxAge: '7d',             // Кешировать изображения 7 дней
    etag: true,               // Включить ETag для условных запросов
    lastModified: true,       // Включить Last-Modified заголовок
    immutable: false,         // Файлы могут обновляться
    setHeaders: (res, filePath) => {
        // CORS для изображений (чтобы браузеры могли кешировать кросс-доменные)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        // Определяем тип контента
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        } else if (filePath.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
    }
}));
// Определяем настройки кук в зависимости от окружения
// Для продакшена используем 'none' для кросс-доменных запросов
// Для разработки используем 'lax' для локальных запросов
const isProduction = process.env.NODE_ENV === 'production';
const cookieSameSite = isProduction ? 'none' : 'lax';
const cookieSecure = isProduction; // В продакшене всегда true, в разработке зависит от протокола

logger.info(`🍪 Cookie settings: sameSite=${cookieSameSite}, secure=${cookieSecure}, NODE_ENV=${process.env.NODE_ENV}`);

app.use(
    cookieSession({
        name: "session",
        keys: [process.env.SECRET_KEY],
        sameSite: cookieSameSite,
        secure: cookieSecure,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней (для PWA важно длительное хранение сессии)
        // Не устанавливаем domain, чтобы куки работали на всех поддоменах
        // Это важно для мобильных устройств
    })
);

// Middleware для логирования информации о сессии (только для отладки)
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
        const hasSession = req.session && req.session.userId !== undefined;
        const origin = req.headers.origin || 'no origin';
        
        if (req.path === '/auth/me' || req.path.startsWith('/auth/')) {
            logger.info(`🔐 Auth request: path=${req.path}, hasSession=${hasSession}, isMobile=${isMobile}, origin=${origin}`);
        }
    }
    next();
});
// Регистрируем роуты
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/admin", adminRouter);
app.use("/business/locations", businessOnly, businessLocationsRouter);
app.use("/business/offers", businessOnly, offersRouter);
app.use("/offers", offersRouter); // Публичный эндпоинт для поиска
app.use("/orders", ordersRouter);
app.use("/payments", paymentsRouter);
app.use("/customer", customerRouter);
app.use("/customer", customerLocationsRouter);
app.use("/customer", cartRouter);
app.use("/stats", statsRouter);
app.use("/favorites", favoritesRouter);
app.use("/reviews", reviewsRouter);
app.use("/notifications", notificationsRouter);
app.use("/subscriptions", subscriptionsRouter);

// Health check endpoint для Docker/Caddy (должен быть доступен без авторизации)
app.get("/health", async (req, res) => {
    try {
        // Проверяем подключение к БД
        await pool.query('SELECT 1');
        res.status(200).json({
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        // Даже при ошибке БД возвращаем 200, чтобы Caddy не считал сервис недоступным
        // (проблема может быть временной)
        res.status(200).json({
            status: "degraded",
            database: "disconnected",
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Базовый маршрут API
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "KindPlate API работает!",
        version: "1.0.0",
        endpoints: {
            auth: "/auth",
            business: "/business",
            offers: "/business/offers",
            orders: "/orders",
            customer: "/customer",
            stats: "/stats",
            favorites: "/favorites",
            reviews: "/reviews"
        }
    });
});

// Обработчик для несуществующих маршрутов
app.use(notFound);

// Централизованный обработчик ошибок
app.use(errorHandler);

// Запускаем планировщик офферов
const { startScheduler } = require('./jobs/offer-scheduler');
const { startQualityBadgesJob } = require('./jobs/quality-badges');
if (process.env.ENABLE_OFFER_SCHEDULER !== 'false') {
    startScheduler();
}

// Запускаем джоб обновления бейджей качества (если включен)
if (process.env.ENABLE_QUALITY_BADGES_JOB !== 'false') {
    startQualityBadgesJob();
    logger.info('✅ Джоб обновления бейджей качества запущен');
}

// Функция проверки подключения к БД
async function checkDatabaseConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        logger.info('✅ Подключение к базе данных успешно');
        return true;
    } catch (error) {
        logger.error('❌ Ошибка подключения к базе данных:', error);
        return false;
    }
}

// Функция запуска сервера
async function startServer() {
    // Проверяем наличие PORT
    const port = process.env.PORT || 5000;
    if (!process.env.PORT) {
        logger.warn(`⚠️ PORT не установлен, используем порт по умолчанию: ${port}`);
    }

    // Проверяем подключение к БД перед запуском
    logger.info('🔍 Проверка подключения к базе данных...');
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
        logger.error('❌ Не удалось подключиться к базе данных. Проверьте настройки подключения.');
        logger.error('   DB_HOST:', process.env.DB_HOST || 'не установлен');
        logger.error('   DB_NAME:', process.env.DB_NAME || 'не установлен');
        logger.error('   DB_USER:', process.env.DB_USER || 'не установлен');
        logger.error('   DB_PORT:', process.env.DB_PORT || 'не установлен');
        process.exit(1);
    }

    // Запускаем сервер
    try {
        app.listen(port, "0.0.0.0", () => {
            logger.info(`🚀 Сервер запущен на порту ${port}`);
            console.log("app is running on all interfaces");
        });
    } catch (error) {
        logger.error('❌ Ошибка при запуске сервера:', error);
        process.exit(1);
    }
}

// Обработка ошибок при запуске
process.on('uncaughtException', (error) => {
    logger.error('❌ Необработанное исключение:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Необработанный rejection:', reason);
    logger.error('   Promise:', promise);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('🛑 Получен сигнал SIGTERM, завершаем работу...');
    pool.end(() => {
        logger.info('✅ Подключение к БД закрыто');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('🛑 Получен сигнал SIGINT, завершаем работу...');
    pool.end(() => {
        logger.info('✅ Подключение к БД закрыто');
        process.exit(0);
    });
});

// Запускаем сервер
startServer();
