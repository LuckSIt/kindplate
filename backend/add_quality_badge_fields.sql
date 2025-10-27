-- Добавление полей для системы бейджа качества "Лучшие у нас"

-- Добавляем поля для метрик качества
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_top BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS repeat_customers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS quality_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Комментарии для полей
COMMENT ON COLUMN users.is_top IS 'Флаг "Лучшие у нас" - показывается бейдж качества';
COMMENT ON COLUMN users.quality_score IS 'Общий балл качества (0-100), рассчитывается крон-джобом';
COMMENT ON COLUMN users.total_orders IS 'Общее количество заказов';
COMMENT ON COLUMN users.completed_orders IS 'Количество успешно завершенных заказов';
COMMENT ON COLUMN users.repeat_customers IS 'Количество повторных клиентов';
COMMENT ON COLUMN users.avg_rating IS 'Средняя оценка (1-5)';
COMMENT ON COLUMN users.quality_updated_at IS 'Время последнего пересчета метрик качества';

-- Индекс для быстрого поиска топовых продавцов
CREATE INDEX IF NOT EXISTS idx_users_is_top ON users(is_top) WHERE is_top = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_quality_score ON users(quality_score DESC);

-- Функция для автоматического обновления quality_updated_at
CREATE OR REPLACE FUNCTION update_quality_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quality_score IS DISTINCT FROM OLD.quality_score OR
       NEW.is_top IS DISTINCT FROM OLD.is_top THEN
        NEW.quality_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления timestamp
DROP TRIGGER IF EXISTS trigger_update_quality_timestamp ON users;
CREATE TRIGGER trigger_update_quality_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_quality_timestamp();

-- Устанавливаем is_top для тестовых данных (для демонстрации)
-- В продакшене это будет делать крон-джоб
UPDATE users 
SET 
    is_top = TRUE,
    quality_score = 85.5,
    total_orders = 150,
    completed_orders = 145,
    repeat_customers = 45,
    avg_rating = 4.8
WHERE is_business = TRUE 
  AND id = 1; -- Первый бизнес-аккаунт для демо

-- Добавляем еще один топовый для разнообразия
UPDATE users 
SET 
    is_top = TRUE,
    quality_score = 92.0,
    total_orders = 200,
    completed_orders = 198,
    repeat_customers = 78,
    avg_rating = 4.9
WHERE is_business = TRUE 
  AND id IN (SELECT id FROM users WHERE is_business = TRUE ORDER BY id LIMIT 1 OFFSET 1);




