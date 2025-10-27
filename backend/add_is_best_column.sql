-- Добавляем поле is_best в таблицу offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS is_best BOOLEAN DEFAULT FALSE;

-- Добавляем поле phone в таблицу users (если его нет)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);



