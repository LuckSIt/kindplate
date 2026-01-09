-- Миграция: Добавление полей phone, working_hours и website в таблицу users
-- Выполнить эту миграцию для добавления недостающих колонок

-- Добавляем колонку phone, если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Колонка phone добавлена';
    ELSE
        RAISE NOTICE 'Колонка phone уже существует';
    END IF;
END $$;

-- Добавляем колонку working_hours, если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'working_hours'
    ) THEN
        ALTER TABLE users ADD COLUMN working_hours VARCHAR(200);
        RAISE NOTICE 'Колонка working_hours добавлена';
    ELSE
        RAISE NOTICE 'Колонка working_hours уже существует';
    END IF;
END $$;

-- Добавляем колонку website, если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'website'
    ) THEN
        ALTER TABLE users ADD COLUMN website VARCHAR(500);
        RAISE NOTICE 'Колонка website добавлена';
    ELSE
        RAISE NOTICE 'Колонка website уже существует';
    END IF;
END $$;
