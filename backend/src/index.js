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

// Загружаем роуты по одному для диагностики
try {
    const authRouter = require("./routes/auth");
    console.log("✅ authRouter loaded");
} catch (e) {
    console.error("❌ authRouter error:", e.message);
    process.exit(1);
}

try {
    const businessLocationsRouter = require("./routes/business-locations");
    console.log("✅ businessLocationsRouter loaded");
} catch (e) {
    console.error("❌ businessLocationsRouter error:", e.message);
    process.exit(1);
}

try {
    const offersRouter = require("./routes/offers");
    console.log("✅ offersRouter loaded");
} catch (e) {
    console.error("❌ offersRouter error:", e.message);
    process.exit(1);
}

try {
    const ordersRouter = require("./routes/orders");
    console.log("✅ ordersRouter loaded");
} catch (e) {
    console.error("❌ ordersRouter error:", e.message);
    process.exit(1);
}

try {
    const paymentsRouter = require("./routes/payments");
    console.log("✅ paymentsRouter loaded");
} catch (e) {
    console.error("❌ paymentsRouter error:", e.message);
    process.exit(1);
}

try {
    const customerRouter = require("./routes/customer");
    console.log("✅ customerRouter loaded");
} catch (e) {
    console.error("❌ customerRouter error:", e.message);
    process.exit(1);
}

try {
    const customerLocationsRouter = require("./routes/customer-locations");
    console.log("✅ customerLocationsRouter loaded");
} catch (e) {
    console.error("❌ customerLocationsRouter error:", e.message);
    process.exit(1);
}

try {
    const cartRouter = require("./routes/cart");
    console.log("✅ cartRouter loaded");
} catch (e) {
    console.error("❌ cartRouter error:", e.message);
    process.exit(1);
}

try {
    const statsRouter = require("./routes/stats");
    console.log("✅ statsRouter loaded");
} catch (e) {
    console.error("❌ statsRouter error:", e.message);
    process.exit(1);
}

try {
    const favoritesRouter = require("./routes/favorites");
    console.log("✅ favoritesRouter loaded");
} catch (e) {
    console.error("❌ favoritesRouter error:", e.message);
    process.exit(1);
}

try {
    const reviewsRouter = require("./routes/reviews");
    console.log("✅ reviewsRouter loaded");
} catch (e) {
    console.error("❌ reviewsRouter error:", e.message);
    process.exit(1);
}

try {
    const notificationsRouter = require("./routes/notifications");
    console.log("✅ notificationsRouter loaded");
} catch (e) {
    console.error("❌ notificationsRouter error:", e.message);
    process.exit(1);
}

try {
    const subscriptionsRouter = require("./routes/subscriptions");
    console.log("✅ subscriptionsRouter loaded");
} catch (e) {
    console.error("❌ subscriptionsRouter error:", e.message);
    process.exit(1);
}

try {
    const profileRouter = require("./routes/profile");
    console.log("✅ profileRouter loaded");
} catch (e) {
    console.error("❌ profileRouter error:", e.message);
    process.exit(1);
}

try {
    const adminRouter = require("./routes/admin");
    console.log("✅ adminRouter loaded");
} catch (e) {
    console.error("❌ adminRouter error:", e.message);
    process.exit(1);
}

const { businessOnly } = require("./lib/auth");

// ============================================
// БЕЗОПАСНОСТЬ: Helmet и защита заголовков
// ============================================

// Helmet для защиты заголовков HTTP
app.use(helmet({
    contentSecurityPolicy: false, // Используем свой CSP
    crossOriginEmbedderPolicy: false, // Для Yandex Maps
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Собственная политика безопасности контента
app.use(contentSecurityPolicy);

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
            callback(new Error('Доступ запрещен политикой CORS'));
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

app.use(cors(corsOptions));

// Явно обрабатываем OPTIONS запросы для всех маршрутов
app.options('*', cors(corsOptions));

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

// Rate limiting для защиты от брутфорса
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // максимум 5 попыток входа за 15 минут
    message: {
        success: false,
        error: "TOO_MANY_ATTEMPTS",
        message: "Слишком много попыток входа. Попробуйте позже."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Применяем rate limiting только к auth роутам
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

// Раздача статических файлов (фотографии)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(
    cookieSession({
        name: "session",
        keys: [process.env.SECRET_KEY],
        // Cross-site cookies for frontend <-> backend on different domains (Render)
        sameSite: 'none',
        secure: true,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
);
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

// Health check endpoint для Docker/Caddy
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
        res.status(503).json({
            status: "error",
            database: "disconnected",
            timestamp: new Date().toISOString()
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
