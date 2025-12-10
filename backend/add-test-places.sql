-- Скрипт для добавления тестовых мест на карту
-- Можно запустить командой: psql -d kindplate -f add-test-places.sql

-- Дополнительные тестовые бизнесы для отображения на карте
INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role, rating)
VALUES ('Кофейня "Утро"', 'coffee@kindplate.ru', 'Санкт-Петербург, Невский пр., 78', 59.9322, 30.3489, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', true, 'business', 4.8)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role, rating)
VALUES ('Пекарня "Хлеб & Ко"', 'bakery@kindplate.ru', 'Санкт-Петербург, ул. Рубинштейна, 15', 59.9286, 30.3456, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', true, 'business', 4.6)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role, rating)
VALUES ('Суши "Токио"', 'sushi@kindplate.ru', 'Санкт-Петербург, Лиговский пр., 30', 59.9198, 30.3548, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', true, 'business', 4.5)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business, role, rating)
VALUES ('Пиццерия "Манхэттен"', 'pizza@kindplate.ru', 'Санкт-Петербург, Садовая ул., 42', 59.9256, 30.3167, '$2b$10$l3mE4KN9iGuNJMVEi0gHgOOKdB7Y38rlzBB/SmtLdeZ8HGPqhrlfe', true, 'business', 4.7)
ON CONFLICT (email) DO NOTHING;

-- Предложения для Кофейни "Утро"
INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Капучино + Круассан', 'Ароматный капучино и свежий круассан', 380.00, 190.00, 15, '18:00:00', '21:00:00', TRUE
FROM users WHERE email = 'coffee@kindplate.ru'
ON CONFLICT DO NOTHING;

INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Американо + Маффин', 'Классический американо и шоколадный маффин', 320.00, 160.00, 10, '17:00:00', '20:00:00', TRUE
FROM users WHERE email = 'coffee@kindplate.ru'
ON CONFLICT DO NOTHING;

-- Предложения для Пекарни "Хлеб & Ко"
INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Набор выпечки', 'Ассорти из 5 видов свежей выпечки', 450.00, 225.00, 8, '19:00:00', '22:00:00', TRUE
FROM users WHERE email = 'bakery@kindplate.ru'
ON CONFLICT DO NOTHING;

INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Хлеб свежий', 'Свежеиспечённый хлеб дня', 180.00, 90.00, 20, '18:00:00', '21:00:00', TRUE
FROM users WHERE email = 'bakery@kindplate.ru'
ON CONFLICT DO NOTHING;

-- Предложения для Суши "Токио"
INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Сет Филадельфия', '24 ролла с лососем и сливочным сыром', 1200.00, 600.00, 5, '20:00:00', '23:00:00', TRUE
FROM users WHERE email = 'sushi@kindplate.ru'
ON CONFLICT DO NOTHING;

INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Мисо суп', 'Традиционный японский суп с тофу', 180.00, 90.00, 12, '19:00:00', '22:00:00', TRUE
FROM users WHERE email = 'sushi@kindplate.ru'
ON CONFLICT DO NOTHING;

-- Предложения для Пиццерии "Манхэттен"
INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Пицца Маргарита 40см', 'Классическая пицца с томатами и моцареллой', 800.00, 400.00, 6, '20:00:00', '23:00:00', TRUE
FROM users WHERE email = 'pizza@kindplate.ru'
ON CONFLICT DO NOTHING;

INSERT INTO offers (business_id, title, description, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end, is_active)
SELECT id, 'Комбо пицца + напиток', 'Любая средняя пицца + кола', 650.00, 325.00, 10, '18:00:00', '22:00:00', TRUE
FROM users WHERE email = 'pizza@kindplate.ru'
ON CONFLICT DO NOTHING;

-- Выведем результат
SELECT 'Добавлено бизнесов:' as info, COUNT(*) as count FROM users WHERE email IN ('coffee@kindplate.ru', 'bakery@kindplate.ru', 'sushi@kindplate.ru', 'pizza@kindplate.ru');
SELECT 'Всего предложений:' as info, COUNT(*) as count FROM offers WHERE is_active = true;

