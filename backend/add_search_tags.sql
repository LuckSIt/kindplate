-- Миграция для расширенного поиска
-- Добавляет теги кухни, диеты, аллергены и рейтинги

-- 1. Добавляем поля тегов в таблицу offers
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS cuisine_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS diet_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allergen_tags TEXT[] DEFAULT '{}';

-- 2. Добавляем поля рейтинга в таблицу offers (или вычисляем из reviews)
-- Для упрощения будем вычислять на лету, но можно и хранить
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 3. Добавляем теги в таблицу users (для бизнесов)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cuisine_tags TEXT[] DEFAULT '{}';

-- 4. Создаем индексы для быстрого поиска по тегам
CREATE INDEX IF NOT EXISTS idx_offers_cuisine_tags ON offers USING GIN (cuisine_tags);
CREATE INDEX IF NOT EXISTS idx_offers_diet_tags ON offers USING GIN (diet_tags);
CREATE INDEX IF NOT EXISTS idx_offers_allergen_tags ON offers USING GIN (allergen_tags);
CREATE INDEX IF NOT EXISTS idx_offers_rating_avg ON offers(rating_avg);
CREATE INDEX IF NOT EXISTS idx_offers_price ON offers(discounted_price);
CREATE INDEX IF NOT EXISTS idx_users_cuisine_tags ON users USING GIN (cuisine_tags);

-- 5. Индексы для геопоиска (используем coord_0, coord_1 из users)
CREATE INDEX IF NOT EXISTS idx_users_coords ON users(coord_0, coord_1) WHERE is_business = true;

-- 6. Функция для обновления рейтинга оффера (вызывается при изменении отзывов)
CREATE OR REPLACE FUNCTION update_offer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE offers o
    SET 
        rating_avg = COALESCE((
            SELECT AVG(rating)::DECIMAL(3, 2)
            FROM reviews r
            WHERE r.business_id = o.business_id
            AND EXISTS (
                SELECT 1 FROM order_items oi
                WHERE oi.order_id = r.order_id
                AND oi.offer_id = o.id
            )
        ), 0.00),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews r
            WHERE r.business_id = o.business_id
            AND EXISTS (
                SELECT 1 FROM order_items oi
                WHERE oi.order_id = r.order_id
                AND oi.offer_id = o.id
            )
        )
    WHERE o.id = (
        SELECT DISTINCT oi.offer_id
        FROM order_items oi
        WHERE oi.order_id = COALESCE(NEW.order_id, OLD.order_id)
        LIMIT 1
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления рейтинга
DROP TRIGGER IF EXISTS trigger_update_offer_rating ON reviews;
CREATE TRIGGER trigger_update_offer_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_offer_rating();

-- Комментарии
COMMENT ON COLUMN offers.cuisine_tags IS 'Теги кухни: ["итальянская", "японская", "русская"]';
COMMENT ON COLUMN offers.diet_tags IS 'Теги диет: ["веган", "безглютен", "кето"]';
COMMENT ON COLUMN offers.allergen_tags IS 'Теги аллергенов: ["орехи", "молочное", "глютен"]';
COMMENT ON COLUMN offers.rating_avg IS 'Средний рейтинг оффера';
COMMENT ON COLUMN offers.rating_count IS 'Количество отзывов оффера';

