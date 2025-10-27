-- Создание таблицы отзывов

DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Один пользователь может оставить только один отзыв на один заказ
    UNIQUE (user_id, order_id)
);

-- Комментарии для полей
COMMENT ON TABLE reviews IS 'Отзывы клиентов о заведениях';
COMMENT ON COLUMN reviews.user_id IS 'ID клиента, оставившего отзыв';
COMMENT ON COLUMN reviews.business_id IS 'ID заведения, которому оставлен отзыв';
COMMENT ON COLUMN reviews.order_id IS 'ID заказа, за который оставлен отзыв (может быть NULL для общих отзывов)';
COMMENT ON COLUMN reviews.rating IS 'Оценка от 1 до 5 звезд';
COMMENT ON COLUMN reviews.comment IS 'Текст отзыва (необязательно)';

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Индекс для получения последних отзывов заведения
CREATE INDEX IF NOT EXISTS idx_reviews_business_created ON reviews(business_id, created_at DESC);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_reviews_timestamp ON reviews;
CREATE TRIGGER trigger_update_reviews_timestamp
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reviews_updated_at();

-- Функция для обновления средней оценки заведения
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем rating и total_reviews для заведения
    UPDATE users
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
        )
    WHERE id = COALESCE(NEW.business_id, OLD.business_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления рейтинга заведения
DROP TRIGGER IF EXISTS trigger_update_business_rating_on_insert ON reviews;
CREATE TRIGGER trigger_update_business_rating_on_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

DROP TRIGGER IF EXISTS trigger_update_business_rating_on_update ON reviews;
CREATE TRIGGER trigger_update_business_rating_on_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

DROP TRIGGER IF EXISTS trigger_update_business_rating_on_delete ON reviews;
CREATE TRIGGER trigger_update_business_rating_on_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

-- Добавляем тестовые отзывы (если есть пользователи и бизнесы)
DO $$
DECLARE
    customer_id INTEGER;
    business_id INTEGER;
BEGIN
    -- Получаем ID первого клиента
    SELECT id INTO customer_id FROM users WHERE is_business = FALSE LIMIT 1;
    
    -- Получаем ID первого бизнеса
    SELECT id INTO business_id FROM users WHERE is_business = TRUE LIMIT 1;
    
    -- Если есть и клиент, и бизнес, добавляем тестовые отзывы
    IF customer_id IS NOT NULL AND business_id IS NOT NULL THEN
        INSERT INTO reviews (user_id, business_id, rating, comment) VALUES
        (customer_id, business_id, 5, 'Отличное заведение! Всегда свежие продукты и приятные цены. Рекомендую!'),
        (customer_id, business_id, 4, 'Хорошее качество, быстрое обслуживание. Единственный минус - иногда долго ждать.')
        ON CONFLICT (user_id, order_id) DO NOTHING;
        
        RAISE NOTICE 'Добавлены тестовые отзывы';
    END IF;
END $$;

