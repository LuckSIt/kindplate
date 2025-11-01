-- Удаляем старые таблицы если они есть
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    coord_0 DECIMAL(10, 6) NOT NULL,
    coord_1 DECIMAL(10, 6) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_business BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'business', 'customer')),
    logo_url VARCHAR(500),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров (для старого функционала панели бизнеса)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    amount INTEGER NOT NULL DEFAULT 0,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price_orig INTEGER NOT NULL,
    price_disc INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы предложений (новый функционал ResQ Club)
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    original_price DECIMAL(10, 2) NOT NULL,
    discounted_price DECIMAL(10, 2) NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    pickup_time_start TIME NOT NULL,
    pickup_time_end TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, ready, completed, cancelled
    pickup_code VARCHAR(10),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы избранного
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, business_id)
);

-- Создание таблицы отзывов
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых данных
INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role)
VALUES ('Администратор KindPlate', 'admin@kindplate.ru', 'Санкт-Петербург, Россия', 59.9311, 30.3609, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', false, 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role)
VALUES ('Тестовый Бизнес', 'business@kindplate.ru', 'Санкт-Петербург, Невский пр., 1', 59.935, 30.32, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', true, 'business')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role)
VALUES ('Тестовый Пользователь', 'user@kindplate.ru', 'Санкт-Петербург, ул. Пушкина, 10', 59.94, 30.35, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', false, 'customer')
ON CONFLICT (email) DO NOTHING;

-- Вставляем предложения для тестового бизнеса
INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, image_url, is_active)
VALUES (
    (SELECT id FROM users WHERE email = 'business@kindplate.ru'),
    'Комплексный обед',
    'Вкусный и сытный обед из трех блюд',
    500.00,
    250.00,
    10,
    '18:00:00',
    '20:00:00',
    '/uploads/offers/1761334761092-911158504.jpg',
    TRUE
)
ON CONFLICT DO NOTHING;

INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, image_url, is_active)
VALUES (
    (SELECT id FROM users WHERE email = 'business@kindplate.ru'),
    'Выпечка дня',
    'Свежая выпечка со скидкой',
    200.00,
    100.00,
    5,
    '19:00:00',
    '21:00:00',
    '/uploads/offers/1761334778332-98632195.jpg',
    TRUE
)
ON CONFLICT DO NOTHING;

INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, image_url, is_active)
VALUES (
    (SELECT id FROM users WHERE email = 'business@kindplate.ru'),
    'Салат Цезарь',
    'Классический салат с курицей и пармезаном',
    300.00,
    150.00,
    8,
    '17:00:00',
    '22:00:00',
    '/uploads/offers/1761334761092-911158504.jpg',
    TRUE
)
ON CONFLICT DO NOTHING;

-- Индексы для оптимизации
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_business ON users(is_business);
CREATE INDEX idx_items_owner_id ON items(owner_id);
CREATE INDEX idx_offers_business_id ON offers(business_id);
CREATE INDEX idx_offers_is_active ON offers(is_active);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_business_id ON favorites(business_id);
CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
