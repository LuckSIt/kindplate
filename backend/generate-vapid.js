#!/usr/bin/env node

/**
 * Скрипт для генерации VAPID ключей для Web Push уведомлений
 * 
 * Использование:
 *   node generate-vapid.js
 * 
 * Скопируйте полученные ключи в файл .env:
 *   VAPID_PUBLIC_KEY=ваш_публичный_ключ
 *   VAPID_PRIVATE_KEY=ваш_приватный_ключ
 *   VAPID_SUBJECT=mailto:admin@kindplate.ru
 */

const webpush = require('web-push');

try {
    const vapidKeys = webpush.generateVAPIDKeys();
    
    console.log('\n✅ VAPID ключи успешно сгенерированы!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Добавьте эти строки в файл backend/.env:\n');
    console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
    console.log(`VAPID_SUBJECT=mailto:admin@kindplate.ru`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📝 О VAPID_SUBJECT:');
    console.log('   - Это контактная информация для идентификации сервера');
    console.log('   - Формат: mailto:ваш-email@example.com или https://ваш-домен.ru');
    console.log('   - Укажите email администратора или техподдержки');
    console.log('   - Это обязательный параметр для Web Push\n');
    console.log('⚠️  ВАЖНО:');
    console.log('   - Не коммитьте .env файл в git!');
    console.log('   - Используйте разные ключи для production и development');
    console.log('   - После добавления ключей перезапустите backend\n');
    
} catch (error) {
    console.error('❌ Ошибка при генерации VAPID ключей:', error.message);
    console.error('\nУбедитесь, что установлена библиотека web-push:');
    console.error('   npm install web-push\n');
    process.exit(1);
}
