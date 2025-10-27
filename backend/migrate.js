const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kindplate',
  password: '12345678',
  port: 5432,
});

async function migrate() {
  try {
    console.log('🔄 Выполняем миграцию...');
    
    // Добавляем поле is_best в таблицу offers
    await pool.query('ALTER TABLE offers ADD COLUMN IF NOT EXISTS is_best BOOLEAN DEFAULT FALSE');
    console.log('✅ Добавлено поле is_best в таблицу offers');
    
    // Добавляем поле phone в таблицу users
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
    console.log('✅ Добавлено поле phone в таблицу users');
    
    // Обновляем несколько предложений как "лучшие" для тестирования
    await pool.query(`
      UPDATE offers 
      SET is_best = true 
      WHERE id IN (
        SELECT id FROM offers 
        WHERE business_id IN (SELECT id FROM users WHERE is_business = true) 
        ORDER BY RANDOM() 
        LIMIT 3
      )
    `);
    console.log('✅ Обновлены некоторые предложения как "лучшие"');
    
    console.log('🎉 Миграция завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  } finally {
    await pool.end();
  }
}

migrate();



