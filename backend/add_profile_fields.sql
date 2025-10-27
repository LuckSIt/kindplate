-- Добавление полей для профиля пользователя
-- Телефон и согласия на обработку данных

-- Добавляем поле phone (телефон)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Добавляем согласие на оферту
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;

-- Добавляем согласие на обработку персональных данных
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT FALSE;

-- Добавляем дату последнего обновления профиля
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Создаем функцию для автоматического обновления profile_updated_at
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления даты
DROP TRIGGER IF EXISTS update_users_profile_updated_at ON users;
CREATE TRIGGER update_users_profile_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (
        OLD.name IS DISTINCT FROM NEW.name OR
        OLD.email IS DISTINCT FROM NEW.email OR
        OLD.phone IS DISTINCT FROM NEW.phone OR
        OLD.address IS DISTINCT FROM NEW.address
    )
    EXECUTE FUNCTION update_profile_updated_at();

-- Добавим индекс на phone для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

COMMENT ON COLUMN users.phone IS 'Телефон пользователя (опционально)';
COMMENT ON COLUMN users.terms_accepted IS 'Согласие с офертой';
COMMENT ON COLUMN users.privacy_accepted IS 'Согласие на обработку персональных данных';
COMMENT ON COLUMN users.profile_updated_at IS 'Дата последнего обновления профиля';




