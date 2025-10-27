# 🔒 Безопасность KindPlate Backend

## Обзор

Этот документ описывает меры безопасности, реализованные в backend KindPlate для защиты от распространенных уязвимостей и атак.

---

## 🛡️ Реализованные меры защиты

### 1. **HTTP Headers Security (Helmet)**

Используется пакет `helmet` для установки безопасных HTTP заголовков:

```javascript
app.use(helmet({
    contentSecurityPolicy: false, // Используем кастомный CSP
    crossOriginEmbedderPolicy: false, // Для Yandex Maps
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

**Что защищает:**
- XSS атаки
- Clickjacking
- MIME-type sniffing
- DNS prefetch control

---

### 2. **Content Security Policy (CSP)**

Кастомная политика безопасности контента:

```javascript
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api-maps.yandex.ru;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: http:;
  connect-src 'self' https://api-maps.yandex.ru https://geocode-maps.yandex.ru;
```

**Что защищает:**
- XSS через инъекцию скриптов
- Загрузка контента с недоверенных источников

---

### 3. **CORS Protection**

Строгая политика CORS с белым списком доменов:

```javascript
cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:5173",
            // ... другие разрешенные домены
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Доступ запрещен политикой CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
})
```

**Что защищает:**
- CSRF атаки
- Несанкционированный доступ с других доменов

---

### 4. **XSS Protection**

Middleware для очистки входящих данных от вредоносного кода:

**Файл:** `src/middleware/security.js`

```javascript
const xssProtection = (req, res, next) => {
    // Очищает body, query, params от:
    // - <script> тегов
    // - <iframe> тегов
    // - onclick и других event handlers
    // - javascript: протокола
};
```

**Что защищает:**
- Stored XSS
- Reflected XSS
- DOM-based XSS

---

### 5. **SQL Injection Protection**

**Основная защита:** Параметризованные запросы через `pg`

```javascript
// ✅ ПРАВИЛЬНО (защищено)
pool.query("SELECT * FROM users WHERE email = $1", [email]);

// ❌ НЕПРАВИЛЬНО (уязвимо)
pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Дополнительная защита:** Middleware для обнаружения SQL-инъекций в query параметрах

**Файл:** `src/middleware/security.js`

---

### 6. **NoSQL Injection Protection**

Защита от NoSQL инъекций (для будущего использования MongoDB):

```javascript
const noSqlInjectionProtection = (req, res, next) => {
    // Удаляет операторы $where, $ne, $gt и т.д.
};
```

---

### 7. **Rate Limiting**

Защита от брутфорса и DDoS:

```javascript
// Для аутентификации
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // максимум 5 попыток
    message: "Слишком много попыток входа. Попробуйте позже."
});

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);
```

**Применяется к:**
- `/auth/login`
- `/auth/register`
- Можно добавить к любым чувствительным эндпоинтам

---

### 8. **Input Validation (Zod)**

Валидация всех входящих данных через Zod схемы:

**Файл:** `src/middleware/validation.js`

```javascript
const { validateBody, validateQuery, validateParams, schemas } = require('../middleware/validation');

// Использование
router.post('/register', 
    validateBody(z.object({
        email: schemas.email,
        password: schemas.password,
        name: z.string().min(2).max(100)
    })),
    async (req, res) => { /* ... */ }
);
```

**Преимущества:**
- Типобезопасность
- Автоматическая санитизация
- Детальные сообщения об ошибках
- Защита от неожиданных полей

---

### 9. **File Upload Security**

Ограничения на загрузку файлов (Multer):

**Файл:** `src/middleware/upload.js`

```javascript
const upload = multer({
    storage: multer.diskStorage({ /* ... */ }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1,
        fields: 10,
        fieldSize: 1024 * 1024 // 1MB на текстовое поле
    },
    fileFilter: function (req, file, cb) {
        // Только изображения
        const allowedTypes = /jpeg|jpg|png|webp/;
        if (allowedTypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Недопустимый тип файла"));
        }
    }
});
```

**Что защищает:**
- Загрузка вредоносных файлов
- DoS через большие файлы
- Исполнение произвольного кода

---

### 10. **Password Security**

Хеширование паролей с bcrypt:

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// При регистрации
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// При входе
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Характеристики:**
- 10 раундов соления (2^10 итераций)
- Устойчивость к rainbow table атакам
- Автоматическое соление

---

### 11. **Session Security**

Безопасные сессии с `cookie-session`:

```javascript
app.use(cookieSession({
    name: "session",
    keys: [process.env.SECRET_KEY], // Из переменных окружения
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    httpOnly: true, // Защита от XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only в продакшене
    sameSite: 'strict' // Защита от CSRF
}));
```

---

### 12. **JWT Security (опционально)**

Для API токенов используется JOSE:

**Файл:** `src/lib/jwt.js`

```javascript
const { SignJWT, jwtVerify } = require('jose');

// Access token: короткий срок жизни (15 мин)
// Refresh token: длинный срок (7 дней)
```

---

## 📋 Чеклист безопасности

### Backend

- [x] Helmet для HTTP заголовков
- [x] Content Security Policy
- [x] CORS с белым списком
- [x] XSS Protection middleware
- [x] SQL Injection Protection (параметризованные запросы)
- [x] NoSQL Injection Protection
- [x] Rate Limiting на auth endpoints
- [x] Input Validation (Zod)
- [x] File Upload ограничения
- [x] Password hashing (bcrypt)
- [x] Secure sessions (httpOnly, sameSite)
- [x] JWT с коротким TTL
- [x] Централизованная обработка ошибок
- [x] Логирование (Winston)
- [ ] HTTPS в продакшене
- [ ] Environment variables для секретов
- [ ] Database backups

### Frontend

- [x] Санитизация пользовательского ввода
- [x] Защита от XSS при рендеринге
- [x] HTTPS-only cookies
- [ ] SameSite cookies
- [ ] Subresource Integrity (SRI) для CDN

---

## 🚨 Известные ограничения

1. **HTTPS не настроен** - требуется reverse proxy (nginx) в продакшене
2. **Нет защиты от DDoS** - рекомендуется Cloudflare или аналог
3. **Нет 2FA** - планируется в будущем
4. **Email не верифицируется** - планируется добавить

---

## 🔧 Рекомендации для продакшена

### 1. Environment Variables

Создайте `.env` файл с реальными секретами:

```env
SECRET_KEY=very-long-random-string-min-32-chars
DB_PASSWORD=strong-database-password
JWT_SECRET=another-strong-secret
NODE_ENV=production
```

### 2. HTTPS

Настройте nginx как reverse proxy с Let's Encrypt:

```nginx
server {
    listen 443 ssl http2;
    server_name api.kindplate.ru;
    
    ssl_certificate /etc/letsencrypt/live/api.kindplate.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kindplate.ru/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. Database Security

```sql
-- Создайте отдельного пользователя для приложения
CREATE USER kindplate_app WITH PASSWORD 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kindplate_app;

-- Отключите суперпользователя
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM postgres;
```

### 4. Firewall

```bash
# Разрешить только необходимые порты
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 5000/tcp   # Backend не должен быть доступен напрямую
ufw enable
```

### 5. Monitoring

Установите мониторинг:
- **Sentry** для отслеживания ошибок
- **Grafana** для метрик производительности
- **Fail2Ban** для защиты от брутфорса SSH

---

## 📞 Контакты по безопасности

Если вы обнаружили уязвимость, пожалуйста, сообщите нам:

- **Email:** security@kindplate.ru
- **Telegram:** @kindplate_security

**Мы гарантируем:**
- Ответ в течение 24 часов
- Конфиденциальность до исправления
- Благодарность в credits (по желанию)

---

## 📚 Полезные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

**Последнее обновление:** 27 октября 2025 г.

