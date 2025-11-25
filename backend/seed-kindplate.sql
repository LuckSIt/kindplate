-- KindPlate Seed Data
-- Test users, partners, and offers for development

-- ============================================
-- TEST USERS
-- ============================================

-- Customer user
INSERT INTO users (email, phone, password_hash, name, role, is_active) VALUES
('customer@test.com', '+79991234567', '$2a$10$YourHashedPasswordHere', 'Тестовый Покупатель', 'user', TRUE);

-- Partner user #1
INSERT INTO users (email, phone, password_hash, name, role, is_active) VALUES
('partner1@test.com', '+79991234568', '$2a$10$YourHashedPasswordHere', 'Кафе Цезарь', 'partner', TRUE);

-- Partner user #2
INSERT INTO users (email, phone, password_hash, name, role, is_active) VALUES
('partner2@test.com', '+79991234569', '$2a$10$YourHashedPasswordHere', 'Пекарня Уют', 'partner', TRUE);

-- Partner user #3
INSERT INTO users (email, phone, password_hash, name, role, is_active) VALUES
('partner3@test.com', '+79991234570', '$2a$10$YourHashedPasswordHere', 'Салат Бар', 'partner', TRUE);

-- ============================================
-- TEST PARTNERS
-- ============================================

-- Café Caesar (near Nevsky Prospekt)
INSERT INTO partners (user_id, name, address, latitude, longitude, description, categories, working_hours, is_approved) VALUES
((SELECT id FROM users WHERE email = 'partner1@test.com'),
 'Кафе Цезарь',
 'Невский проспект, 28, Санкт-Петербург',
 59.934280,
 30.346620,
 'Классическая европейская кухня с современными мотивами. Свежие салаты, сырная и мясная нарезка.',
 ARRAY['restaurant', 'cafe'],
 '{"monday": {"open": "09:00", "close": "22:00"}, "tuesday": {"open": "09:00", "close": "22:00"}, "wednesday": {"open": "09:00", "close": "22:00"}, "thursday": {"open": "09:00", "close": "22:00"}, "friday": {"open": "09:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "22:00"}}'::jsonb,
 TRUE);

-- Bakery Uyut (near Sportivnaya)
INSERT INTO partners (user_id, name, address, latitude, longitude, description, categories, working_hours, is_approved) VALUES
((SELECT id FROM users WHERE email = 'partner2@test.com'),
 'Пекарня Уют',
 'Большой проспект П.С., 50, Санкт-Петербург',
 59.959574,
 30.298062,
 'Свежая выпечка каждый день! Хлеб, круассаны, пирожные и торты.',
 ARRAY['bakery'],
 '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "08:00", "close": "21:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'::jsonb,
 TRUE);

-- Salad Bar (near Chernyshevskaya)
INSERT INTO partners (user_id, name, address, latitude, longitude, description, categories, working_hours, is_approved) VALUES
((SELECT id FROM users WHERE email = 'partner3@test.com'),
 'Салат Бар',
 'Улица Чайковского, 15, Санкт-Петербург',
 59.945933,
 30.363064,
 'Здоровое питание для активных людей. Свежие салаты, смузи, веганские блюда.',
 ARRAY['restaurant', 'healthy'],
 '{"monday": {"open": "10:00", "close": "21:00"}, "tuesday": {"open": "10:00", "close": "21:00"}, "wednesday": {"open": "10:00", "close": "21:00"}, "thursday": {"open": "10:00", "close": "21:00"}, "friday": {"open": "10:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "11:00", "close": "21:00"}}'::jsonb,
 TRUE);

-- ============================================
-- TEST OFFERS
-- ============================================

-- Offers for Café Caesar
INSERT INTO offers (partner_id, title, description, price_cents, original_price_cents, quantity_total, quantity_left, available_from, available_to, tags, is_active) VALUES
((SELECT id FROM partners WHERE name = 'Кафе Цезарь'),
 'Салат Цезарь с курицей',
 'Классический салат с курицей, сырными чипсами и соусом Цезарь. Вес: 350г',
 15000,
 35000,
 5,
 5,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '6 hours',
 ARRAY['salad', 'chicken'],
 TRUE);

INSERT INTO offers (partner_id, title, description, price_cents, original_price_cents, quantity_total, quantity_left, available_from, available_to, tags, is_active) VALUES
((SELECT id FROM partners WHERE name = 'Кафе Цезарь'),
 'Сырная тарелка',
 'Ассорти из 4 видов сыра с виноградом и орехами. Вес: 200г',
 25000,
 55000,
 3,
 3,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '4 hours',
 ARRAY['cheese', 'snack'],
 TRUE);

-- Offers for Bakery Uyut
INSERT INTO offers (partner_id, title, description, price_cents, original_price_cents, quantity_total, quantity_left, available_from, available_to, tags, is_active) VALUES
((SELECT id FROM partners WHERE name = 'Пекарня Уют'),
 'Набор круассанов',
 '3 свежих круассана: классический, с шоколадом, с миндалём',
 10000,
 25000,
 10,
 10,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '8 hours',
 ARRAY['bakery', 'breakfast'],
 TRUE);

INSERT INTO offers (partner_id, title, description, price_cents, original_price_cents, quantity_total, quantity_left, available_from, available_to, tags, is_active) VALUES
((SELECT id FROM partners WHERE name = 'Пекарня Уют'),
 'Хлеб бездрожжевой',
 'Цельнозерновой хлеб на закваске, вчерашней выпечки. Вес: 500г',
 5000,
 15000,
 7,
 7,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '12 hours',
 ARRAY['bakery', 'bread', 'healthy'],
 TRUE);

-- Offers for Salad Bar
INSERT INTO offers (partner_id, title, description, price_cents, original_price_cents, quantity_total, quantity_left, available_from, available_to, tags, is_active) VALUES
((SELECT id FROM partners WHERE name = 'Салат Бар'),
 'Веганский боул',
 'Киноа, авокадо, свежие овощи, хумус. Вес: 400г',
 20000,
 45000,
 6,
 6,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '5 hours',
 ARRAY['vegan', 'healthy', 'salad'],
 TRUE);

INSERT INTO offers (partner_id, title, description, price_cents, original_price_cents, quantity_total, quantity_left, available_from, available_to, tags, is_active) VALUES
((SELECT id FROM partners WHERE name = 'Салат Бар'),
 'Смузи-микс (3 шт)',
 'Три смузи: зелёный, ягодный, тропический. По 300мл каждый',
 15000,
 40000,
 4,
 4,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '3 hours',
 ARRAY['smoothie', 'healthy', 'drink'],
 TRUE);

-- ============================================
-- SUMMARY
-- ============================================
-- Created:
-- - 4 users (1 customer + 3 partners)
-- - 3 partners (all approved)
-- - 6 offers (2 per partner)


