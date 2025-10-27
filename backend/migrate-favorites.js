const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'kplate',
    user: 'postgres',
    password: '12345678'
  });

  try {
    console.log('🔄 Running favorites tables migration...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'add_favorites_tables.sql'), 'utf8');
    await pool.query(sql);
    
    console.log('✅ Favorites tables created successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();



