-- Миграция: добавление колонки establishment_type в таблицу users (тип заведения для бизнеса)
-- Выполнить, если колонки ещё нет (например, БД создана до появления поля в init.sql).

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'establishment_type'
    ) THEN
        ALTER TABLE users ADD COLUMN establishment_type VARCHAR(100);
        RAISE NOTICE 'Колонка establishment_type добавлена';
    ELSE
        RAISE NOTICE 'Колонка establishment_type уже существует';
    END IF;
END $$;
