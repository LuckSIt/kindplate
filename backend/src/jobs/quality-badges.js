const cron = require('node-cron');
const pool = require('../lib/db');
const logger = require('../lib/logger');

/**
 * Джоб для автоматического обновления бейджей качества продавцов
 * Запускается каждый день в 3:00 ночи
 */
function startQualityBadgesJob() {
    // Запускаем каждый день в 3:00 ночи
    cron.schedule('0 3 * * *', async () => {
        logger.info('🔄 Запуск обновления бейджей качества продавцов...');
        
        try {
            // Получаем всех бизнесов
            const businessesResult = await pool.query(
                'SELECT id FROM users WHERE is_business = true'
            );
            
            const businesses = businessesResult.rows;
            logger.info(`📊 Найдено ${businesses.length} бизнесов для обновления бейджей`);
            
            let updated = 0;
            let errors = 0;
            
            // Обновляем бейджи для каждого бизнеса
            for (const business of businesses) {
                try {
                    await pool.query('SELECT update_business_badges($1)', [business.id]);
                    updated++;
                    
                    if (updated % 10 === 0) {
                        logger.info(`✅ Обновлено бейджей для ${updated}/${businesses.length} бизнесов...`);
                    }
                } catch (error) {
                    logger.error(`❌ Ошибка обновления бейджей для бизнеса ${business.id}:`, error.message);
                    errors++;
                }
            }
            
            logger.info(`✅ Обновление бейджей завершено: ${updated} успешно, ${errors} ошибок`);
        } catch (error) {
            logger.error('❌ Критическая ошибка при обновлении бейджей:', error);
        }
    }, {
        timezone: 'Europe/Moscow'
    });
    
    logger.info('✅ Джоб обновления бейджей качества запущен (ежедневно в 3:00)');
}

/**
 * Обновить бейджи для конкретного бизнеса (можно вызывать вручную)
 */
async function updateBusinessBadges(businessId) {
    try {
        await pool.query('SELECT update_business_badges($1)', [businessId]);
        logger.info(`✅ Бейджи обновлены для бизнеса ${businessId}`);
        return true;
    } catch (error) {
        logger.error(`❌ Ошибка обновления бейджей для бизнеса ${businessId}:`, error);
        return false;
    }
}

module.exports = {
    startQualityBadgesJob,
    updateBusinessBadges
};

