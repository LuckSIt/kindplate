-- Скрипт для пересоздания базы данных PostgreSQL

-- Удаляем базу данных если она существует
DROP DATABASE IF EXISTS kindplate;

-- Создаем базу данных заново
CREATE DATABASE kindplate;

-- Подключаемся к новой базе данных
\c kindplate;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    coord_0 DECIMAL(10, 6) NOT NULL,
    coord_1 DECIMAL(10, 6) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_business BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    amount INTEGER NOT NULL DEFAULT 0,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price_orig INTEGER NOT NULL,
    price_disc INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_business ON users(is_business);
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON items(owner_id);

-- Вставляем тестовые данные
INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business) VALUES
('Кафе Вкусняшка', 'cafe@test.com', 'Невский проспект, 100', 59.9311, 30.3609, '$2b$10$example', true),
('Тестовый Клиент', 'customer@test.com', 'Садовая улица, 50', 59.9267, 30.3175, '$2b$10$example', false);

-- Вставляем тестовые товары
INSERT INTO items (name, description, amount, owner_id, price_orig, price_disc) VALUES
('Пицца Маргарита', 'Классическая пицца с томатами и моцареллой. Свежая и вкусная!', 5, 1, 500, 200),
('Салат Цезарь', 'Свежий салат с курицей, сыром пармезан и соусом Цезарь', 3, 1, 350, 150),
('Бургер с картофелем', 'Сочный бургер с говядиной и картофелем фри', 4, 1, 450, 180);

-- Проверяем созданные данные
SELECT 'Пользователи:' as info;
SELECT id, name, email, is_business FROM users;

SELECT 'Товары:' as info;
SELECT id, name, amount, price_orig, price_disc FROM items;

