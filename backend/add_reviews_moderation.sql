-- Миграция для добавления модерации и фото к отзывам

-- Добавляем поля для модерации
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false;

-- Обновляем существующие отзывы - помечаем их как опубликованные
UPDATE reviews 
SET status = 'published' 
WHERE status IS NULL OR status = 'pending';

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_verified_purchase ON reviews(is_verified_purchase) WHERE is_verified_purchase = true;
CREATE INDEX IF NOT EXISTS idx_reviews_moderated_at ON reviews(moderated_at) WHERE moderated_at IS NOT NULL;

-- Комментарии
COMMENT ON COLUMN reviews.photos IS 'Массив URL фотографий к отзыву';
COMMENT ON COLUMN reviews.status IS 'Статус модерации: pending, published, rejected';
COMMENT ON COLUMN reviews.moderated_at IS 'Дата и время модерации';
COMMENT ON COLUMN reviews.moderated_by IS 'ID администратора, который провел модерацию';
COMMENT ON COLUMN reviews.is_verified_purchase IS 'Флаг, что отзыв оставлен после покупки';

