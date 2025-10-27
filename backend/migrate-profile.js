require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runMigration() {
    console.log('🔄 Running profile fields migration...');
    try {
        const client = await pool.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'add_profile_fields.sql'), 'utf8');
        await client.query(sql);
        client.release();
        console.log('✅ Profile fields migration completed successfully.');
    } catch (error) {
        console.error('❌ Error during profile fields migration:', error);
    } finally {
        await pool.end();
    }
}

runMigration();




