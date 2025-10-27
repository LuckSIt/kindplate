-- Миграция: Добавление системы ролей
-- Дата: 2025-01-27

-- Добавляем колонку role
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Добавляем ограничение на допустимые значения
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'business', 'customer'));
    END IF;
END $$;

-- Обновляем существующих пользователей
-- Бизнесы получают роль 'business'
UPDATE users 
SET role = 'business' 
WHERE is_business = TRUE AND role IS NULL;

-- Клиенты получают роль 'customer'
UPDATE users 
SET role = 'customer' 
WHERE (is_business = FALSE OR is_business IS NULL) AND role IS NULL;

-- Создаем первого администратора
-- ВАЖНО: Пароль нужно будет установить вручную или через другой механизм
-- Пока создаем админа без пароля (если в вашей таблице нет поля password)
-- Если есть поле hash или password_hash, замените 'password' на правильное имя

DO $$
DECLARE
    password_column TEXT;
BEGIN
    -- Проверяем, какая колонка используется для пароля
    SELECT column_name INTO password_column
    FROM information_schema.columns
    WHERE table_name = 'users' 
    AND column_name IN ('password', 'hash', 'password_hash')
    LIMIT 1;
    
    IF password_column IS NOT NULL THEN
        -- Если нашли колонку для пароля, вставляем с паролем
        EXECUTE format('
            INSERT INTO users (email, %I, name, address, coord_0, coord_1, role, is_business, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (email) DO UPDATE 
            SET role = $7, name = $3, address = $4, coord_0 = $5, coord_1 = $6
        ', password_column)
        USING 
            'admin@kindplate.ru',
            '$2b$10$8ZqJZ5Z5Z5Z5Z5Z5Z5Z5ZuKjX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5a',
            'Администратор KindPlate',
            'Санкт-Петербург, Россия',
            59.9311,  -- Широта Санкт-Петербурга
            30.3609,  -- Долгота Санкт-Петербурга
            'admin',
            false;
        
        RAISE NOTICE '✅ Админ создан с паролем';
    ELSE
        -- Если нет колонки для пароля, создаем без пароля
        INSERT INTO users (email, name, address, coord_0, coord_1, role, is_business, created_at)
        VALUES (
            'admin@kindplate.ru',
            'Администратор KindPlate',
            'Санкт-Петербург, Россия',
            59.9311,  -- Широта Санкт-Петербурга
            30.3609,  -- Долгота Санкт-Петербурга
            'admin',
            false,
            NOW()
        )
        ON CONFLICT (email) DO UPDATE 
        SET role = 'admin',
            name = 'Администратор KindPlate',
            address = 'Санкт-Петербург, Россия',
            coord_0 = 59.9311,
            coord_1 = 30.3609;
        
        RAISE NOTICE '⚠️  Админ создан БЕЗ пароля - установите пароль вручную!';
    END IF;
END $$;

-- Добавляем индекс для быстрого поиска по ролям
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Логирование
DO $$
DECLARE
    admin_count INT;
    business_count INT;
    customer_count INT;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
    SELECT COUNT(*) INTO business_count FROM users WHERE role = 'business';
    SELECT COUNT(*) INTO customer_count FROM users WHERE role = 'customer';
    
    RAISE NOTICE '✅ Миграция ролей завершена';
    RAISE NOTICE '📊 Статистика:';
    RAISE NOTICE '   - Админов: %', admin_count;
    RAISE NOTICE '   - Бизнесов: %', business_count;
    RAISE NOTICE '   - Клиентов: %', customer_count;
END $$;

