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

const authRouter = require("./routes/auth");
const businessRouter = require("./routes/business");
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
app.use("/business", businessOnly, businessRouter);
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

app.listen(process.env.PORT, "0.0.0.0", () => {
    logger.info(`🚀 Сервер запущен на порту ${process.env.PORT}`);
    console.log("app is running on all interfaces");
});
