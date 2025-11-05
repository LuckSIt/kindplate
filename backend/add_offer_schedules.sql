-- Миграция для расписания публикации офферов
-- Создает таблицы для расписаний и подписок пользователей

-- 1. Таблица расписаний публикации офферов
CREATE TABLE IF NOT EXISTS offer_schedules (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publish_at TIMESTAMP NOT NULL, -- Время публикации
    unpublish_at TIMESTAMP, -- Время окончания публикации (опционально)
    qty_planned INTEGER, -- Запланированное количество (опционально)
    is_active BOOLEAN DEFAULT true, -- Активно ли расписание
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(offer_id, publish_at) -- Один оффер не может быть запланирован дважды на одно время
);

-- Индексы для offer_schedules
CREATE INDEX IF NOT EXISTS idx_offer_schedules_offer_id ON offer_schedules(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_schedules_business_id ON offer_schedules(business_id);
CREATE INDEX IF NOT EXISTS idx_offer_schedules_publish_at ON offer_schedules(publish_at);
CREATE INDEX IF NOT EXISTS idx_offer_schedules_active ON offer_schedules(is_active) WHERE is_active = true;

-- 2. Таблица подписок пользователей на уведомления о новых офферах
CREATE TABLE IF NOT EXISTS waitlist_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope_type VARCHAR(20) NOT NULL, -- 'offer', 'category', 'area', 'business'
    scope_id INTEGER, -- ID оффера/категории/бизнеса (опционально)
    area_geojson JSONB, -- Гео-зона для подписки типа 'area' (опционально)
    latitude DECIMAL(10, 8), -- Широта для подписки по геолокации
    longitude DECIMAL(11, 8), -- Долгота для подписки по геолокации
    radius_km INTEGER DEFAULT 5, -- Радиус в км для подписки по геолокации
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Уникальный ключ зависит от типа подписки
    -- Для offer, category, business: (user_id, scope_type, scope_id)
    -- Для area: (user_id, scope_type) - одна подписка по области
);

-- Индексы для waitlist_subscriptions
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON waitlist_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_scope ON waitlist_subscriptions(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_active ON waitlist_subscriptions(is_active) WHERE is_active = true;

-- 3. Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_offer_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_offer_schedules_updated_at
    BEFORE UPDATE ON offer_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_offer_schedules_updated_at();

CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON waitlist_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_offer_schedules_updated_at();

-- Комментарии для документации
COMMENT ON TABLE offer_schedules IS 'Расписание публикации офферов по времени';
COMMENT ON TABLE waitlist_subscriptions IS 'Подписки пользователей на уведомления о новых офферах';
COMMENT ON COLUMN waitlist_subscriptions.scope_type IS 'Тип подписки: offer, category, area, business';
COMMENT ON COLUMN waitlist_subscriptions.area_geojson IS 'GeoJSON полигон для подписки по геолокации';

