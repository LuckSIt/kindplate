const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function recreateDatabase() {
    console.log('🚀 Starting KindPlate database recreation...\n');

    // Connect to postgres database to drop/create kindplate
    const adminClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'postgres'
    });

    try {
        await adminClient.connect();
        console.log('✅ Connected to PostgreSQL');

        // Terminate existing connections
        console.log('🔌 Terminating existing connections...');
        await adminClient.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'kindplate'
            AND pid <> pg_backend_pid();
        `);

        // Drop and create database
        console.log('🗑️  Dropping existing database...');
        await adminClient.query('DROP DATABASE IF EXISTS kindplate;');
        
        console.log('📦 Creating new database...');
        await adminClient.query('CREATE DATABASE kindplate;');
        
        await adminClient.end();
        console.log('✅ Database recreated\n');

        // Connect to new kindplate database
        const kindplateClient = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
            database: 'kindplate'
        });

        await kindplateClient.connect();
        console.log('✅ Connected to kindplate database');

        // Enable required extensions
        console.log('🔧 Enabling PostgreSQL extensions...');
        await kindplateClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        await kindplateClient.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
        await kindplateClient.query('CREATE EXTENSION IF NOT EXISTS "cube";');
        await kindplateClient.query('CREATE EXTENSION IF NOT EXISTS "earthdistance";');
        console.log('✅ Extensions enabled');

        // Execute init.sql
        console.log('📋 Creating schema...');
        const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        await kindplateClient.query(initSQL);
        console.log('✅ Schema created');

        // Execute seed data
        console.log('🌱 Seeding test data...');
        const seedSQL = fs.readFileSync(path.join(__dirname, 'seed-kindplate.sql'), 'utf8');
        // Hash password: "123456" with bcrypt
        const hashedPassword = '$2a$10$rZJ9PThVq5KVZ5TZyh5NxOY7b3VqH1e1eqXnXFvJQZ5YqZ5YqZ5Yq';
        const seedSQLWithPassword = seedSQL.replace(/\$2a\$10\$YourHashedPasswordHere/g, hashedPassword);
        await kindplateClient.query(seedSQLWithPassword);
        console.log('✅ Test data seeded');

        // Show summary
        const userCount = await kindplateClient.query('SELECT COUNT(*) FROM users;');
        const partnerCount = await kindplateClient.query('SELECT COUNT(*) FROM partners;');
        const offerCount = await kindplateClient.query('SELECT COUNT(*) FROM offers;');

        console.log('\n📊 Summary:');
        console.log(`   Users: ${userCount.rows[0].count}`);
        console.log(`   Partners: ${partnerCount.rows[0].count}`);
        console.log(`   Offers: ${offerCount.rows[0].count}`);

        console.log('\n🔑 Test credentials:');
        console.log('   Customer: customer@test.com / 123456');
        console.log('   Partner 1: partner1@test.com / 123456');
        console.log('   Partner 2: partner2@test.com / 123456');
        console.log('   Partner 3: partner3@test.com / 123456');

        await kindplateClient.end();
        console.log('\n✅ Database setup complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

recreateDatabase();


