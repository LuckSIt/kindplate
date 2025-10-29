const { Pool } = require("pg");

let config;

if (process.env.DATABASE_URL) {
    // Render PostgreSQL
    config = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
} else {
    // Local development
    config = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'kindplate',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
    };
}

const pool = new Pool(config);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test connection
pool.connect()
    .then(async client => {
        console.log('✅ Подключение к базе данных успешно');
        
        // Check if tables exist
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'businesses', 'offers', 'orders', 'cart_items', 'favorites')
        `);
        
        if (result.rows.length === 0) {
            console.log('📋 Создаем таблицы...');
            await initDatabase();
        } else {
            console.log('✅ Таблицы уже существуют');
        }
        
        client.release();
    })
    .catch(err => {
        console.error('❌ Ошибка подключения к базе данных:', err);
        process.exit(1);
    });

// Database initialization function
async function initDatabase() {
    const client = await pool.connect();
    try {
        // Create tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                address TEXT,
                coord_0 DECIMAL(10, 8),
                coord_1 DECIMAL(11, 8),
                password_hash VARCHAR(255) NOT NULL,
                is_business BOOLEAN NOT NULL DEFAULT FALSE,
                role VARCHAR(50) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS businesses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                address TEXT NOT NULL,
                coord_0 DECIMAL(10, 8) NOT NULL,
                coord_1 DECIMAL(11, 8) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                website VARCHAR(255),
                opening_hours JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS offers (
                id SERIAL PRIMARY KEY,
                business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                original_price DECIMAL(10, 2) NOT NULL,
                discounted_price DECIMAL(10, 2) NOT NULL,
                pickup_time_start TIME NOT NULL,
                pickup_time_end TIME NOT NULL,
                image_url VARCHAR(500),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
                offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                pickup_code VARCHAR(10),
                payment_status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, offer_id)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, business_id)
            );
        `);

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_offers_business_id ON offers(business_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_favorites_business_id ON favorites(business_id);');

        // Insert admin user
        await client.query(`
            INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role) 
            VALUES ('Администратор KindPlate', 'admin@kindplate.ru', 'Санкт-Петербург, Россия', 59.9311, 30.3609, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', false, 'admin')
            ON CONFLICT (email) DO NOTHING;
        `);

        console.log('✅ База данных инициализирована успешно');
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = pool;
