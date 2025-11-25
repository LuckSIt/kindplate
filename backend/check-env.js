require('dotenv').config();

console.log('🔍 Проверяем переменные окружения:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'НЕ УСТАНОВЛЕН');
console.log('DB_PORT:', process.env.DB_PORT);
console.log('PORT:', process.env.PORT);
console.log('SECRET_KEY:', process.env.SECRET_KEY ? '***' : 'НЕ УСТАНОВЛЕН');

