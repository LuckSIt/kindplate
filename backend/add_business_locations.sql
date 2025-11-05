-- Миграция для множественных локаций бизнесов
-- Добавляет таблицу business_locations и связь с offers

-- 1. Создаем таблицу локаций бизнесов
CREATE TABLE IF NOT EXISTS business_locations (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Название локации (например, "Филиал на Невском")
    address TEXT NOT NULL, -- Полный адрес
    lat DECIMAL(10, 8) NOT NULL, -- Широта
    lon DECIMAL(11, 8) NOT NULL, -- Долгота
    opening_hours JSONB, -- График работы (опционально)
    phone VARCHAR(50), -- Телефон локации (опционально)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, name) -- Одно название локации на бизнес
);

-- 2. Добавляем location_id в таблицу offers
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES business_locations(id) ON DELETE SET NULL;

-- 3. Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_active ON business_locations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_business_locations_coords ON business_locations(lat, lon);
CREATE INDEX IF NOT EXISTS idx_offers_location_id ON offers(location_id);

-- 4. Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_business_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_locations_updated_at
    BEFORE UPDATE ON business_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_business_locations_updated_at();

-- 5. Миграция существующих данных (если есть)
-- Создаем дефолтную локацию для каждого бизнеса на основе его координат
INSERT INTO business_locations (business_id, name, address, lat, lon, is_active)
SELECT 
    id,
    'Основная локация',
    address,
    coord_0,
    coord_1,
    true
FROM users
WHERE is_business = true
AND NOT EXISTS (
    SELECT 1 FROM business_locations bl WHERE bl.business_id = users.id
);

-- Связываем существующие офферы с дефолтной локацией бизнеса
UPDATE offers o
SET location_id = (
    SELECT bl.id 
    FROM business_locations bl 
    WHERE bl.business_id = o.business_id 
    AND bl.name = 'Основная локация'
    LIMIT 1
)
WHERE o.location_id IS NULL;

-- Комментарии
COMMENT ON TABLE business_locations IS 'Локации бизнесов (филиалы, точки продаж)';
COMMENT ON COLUMN business_locations.opening_hours IS 'График работы в формате JSON: {"monday": {"open": "09:00", "close": "21:00"}, ...}';
COMMENT ON COLUMN offers.location_id IS 'ID локации, к которой привязан оффер';

