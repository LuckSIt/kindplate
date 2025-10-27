/**
 * JWT Token Management using JOSE
 * Управление JWT токенами для аутентификации
 */

const { SignJWT, jwtVerify } = require('jose');
const crypto = require('crypto');

// Secret key для подписи JWT (в production должен быть в .env)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Время жизни токенов
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 минут
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 дней

/**
 * Создать Access Token
 * @param {Object} payload - Данные для токена (userId, email, isBusiness)
 * @returns {Promise<string>} JWT токен
 */
async function createAccessToken(payload) {
    const token = await new SignJWT({
        userId: payload.userId,
        email: payload.email,
        isBusiness: payload.isBusiness || false,
        type: 'access'
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .setIssuer('kindplate-api')
        .setAudience('kindplate-client')
        .sign(JWT_SECRET_KEY);

    return token;
}

/**
 * Создать Refresh Token
 * @param {Object} payload - Данные для токена (userId)
 * @returns {Promise<string>} JWT токен
 */
async function createRefreshToken(payload) {
    const token = await new SignJWT({
        userId: payload.userId,
        type: 'refresh'
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .setIssuer('kindplate-api')
        .setAudience('kindplate-client')
        .sign(JWT_SECRET_KEY);

    return token;
}

/**
 * Верифицировать JWT токен
 * @param {string} token - JWT токен
 * @returns {Promise<Object>} Декодированный payload
 */
async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
            issuer: 'kindplate-api',
            audience: 'kindplate-client'
        });
        return payload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Создать пару токенов (access + refresh)
 * @param {Object} user - Данные пользователя
 * @returns {Promise<Object>} Объект с accessToken и refreshToken
 */
async function createTokenPair(user) {
    const [accessToken, refreshToken] = await Promise.all([
        createAccessToken({
            userId: user.id,
            email: user.email,
            isBusiness: user.is_business
        }),
        createRefreshToken({
            userId: user.id
        })
    ]);

    return { accessToken, refreshToken };
}

/**
 * Декодировать токен без верификации (для отладки)
 * @param {string} token - JWT токен
 * @returns {Object} Декодированный payload
 */
function decodeToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload;
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyToken,
    createTokenPair,
    decodeToken
};




