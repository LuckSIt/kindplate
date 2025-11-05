-- Миграция для системы бейджей качества продавцов

-- Создаем таблицу бейджей качества
CREATE TABLE IF NOT EXISTS quality_badges (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key VARCHAR(50) NOT NULL, -- 'top_rated', 'fast_delivery', 'reliable', 'eco_champion', etc.
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- NULL = не истекает, или конкретная дата
    metadata JSONB, -- Дополнительные данные (метрики, значения)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, badge_key) -- Один бейдж каждого типа на бизнес
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_quality_badges_business_id ON quality_badges(business_id);
CREATE INDEX IF NOT EXISTS idx_quality_badges_badge_key ON quality_badges(badge_key);
CREATE INDEX IF NOT EXISTS idx_quality_badges_expires_at ON quality_badges(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quality_badges_active ON quality_badges(business_id, badge_key) WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP;

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_quality_badges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quality_badges_updated_at
    BEFORE UPDATE ON quality_badges
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_badges_updated_at();

-- Функция для расчета метрик бизнеса
CREATE OR REPLACE FUNCTION calculate_business_metrics(business_id_param INTEGER)
RETURNS TABLE (
    avg_rating DECIMAL(3,2),
    total_reviews INTEGER,
    on_time_delivery_rate DECIMAL(5,2),
    total_orders INTEGER,
    completed_orders INTEGER,
    incident_count INTEGER,
    avg_response_time_hours DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Средний рейтинг
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::DECIMAL(3,2) as avg_rating,
        
        -- Общее количество отзывов
        COUNT(DISTINCT r.id)::INTEGER as total_reviews,
        
        -- Процент своевременной выдачи (заказы выполненные в срок)
        -- Своевременной считается если заказ выполнен в течение 2 часов после создания
        -- Проверяем наличие нужных полей динамически
        COALESCE(
            CASE 
                WHEN COUNT(DISTINCT CASE WHEN o.status IN ('completed', 'picked_up') THEN o.id END) > 0 THEN
                    ROUND(
                        (COUNT(DISTINCT CASE 
                            WHEN o.status IN ('completed', 'picked_up')
                            AND (o.created_at + INTERVAL '2 hours' >= COALESCE(o.updated_at, o.created_at))
                            THEN o.id 
                        END)::numeric / 
                        NULLIF(COUNT(DISTINCT CASE WHEN o.status IN ('completed', 'picked_up') THEN o.id END)::numeric, 0)) * 100,
                        2
                    )
                ELSE 0
            END,
            0
        )::DECIMAL(5,2) as on_time_delivery_rate,
        
        -- Общее количество заказов
        COUNT(DISTINCT o.id)::INTEGER as total_orders,
        
        -- Завершенные заказы
        COUNT(DISTINCT CASE WHEN o.status IN ('completed', 'picked_up') THEN o.id END)::INTEGER as completed_orders,
        
        -- Количество инцидентов (отмененные заказы, жалобы)
        (COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) +
         COUNT(DISTINCT CASE WHEN r.rating <= 2 THEN r.id END))::INTEGER as incident_count,
        
        -- Среднее время ответа (в часах) - разница между created_at и updated_at
        -- Если updated_at не менялся, считаем что ответ был мгновенным
        COALESCE(
            ROUND(
                AVG(CASE 
                    WHEN o.updated_at > o.created_at 
                    THEN EXTRACT(EPOCH FROM (o.updated_at - o.created_at)) / 3600
                    ELSE 0
                END)::numeric,
                2
            ),
            0
        )::DECIMAL(10,2) as avg_response_time_hours
        
    FROM users u
    LEFT JOIN reviews r ON r.business_id = u.id AND r.status = 'published'
    LEFT JOIN orders o ON o.business_id = u.id
    WHERE u.id = business_id_param
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;

-- Функция для присвоения/снятия бейджей
CREATE OR REPLACE FUNCTION update_business_badges(business_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    metrics RECORD;
    badge_expires_at TIMESTAMP;
BEGIN
    -- Получаем метрики бизнеса
    SELECT * INTO metrics FROM calculate_business_metrics(business_id_param);
    
    -- Бейдж "Топ рейтинг" - рейтинг >= 4.5 и минимум 10 отзывов
    IF metrics.avg_rating >= 4.5 AND metrics.total_reviews >= 10 THEN
        INSERT INTO quality_badges (business_id, badge_key, metadata, expires_at)
        VALUES (
            business_id_param,
            'top_rated',
            jsonb_build_object(
                'avg_rating', metrics.avg_rating,
                'total_reviews', metrics.total_reviews
            ),
            NULL -- Не истекает
        )
        ON CONFLICT (business_id, badge_key)
        DO UPDATE SET
            metadata = EXCLUDED.metadata,
            updated_at = CURRENT_TIMESTAMP;
    ELSE
        DELETE FROM quality_badges 
        WHERE business_id = business_id_param AND badge_key = 'top_rated';
    END IF;
    
    -- Бейдж "Быстрая выдача" - >= 90% своевременной выдачи и минимум 20 заказов
    IF metrics.on_time_delivery_rate >= 90 AND metrics.completed_orders >= 20 THEN
        INSERT INTO quality_badges (business_id, badge_key, metadata, expires_at)
        VALUES (
            business_id_param,
            'fast_delivery',
            jsonb_build_object(
                'on_time_rate', metrics.on_time_delivery_rate,
                'completed_orders', metrics.completed_orders
            ),
            NULL
        )
        ON CONFLICT (business_id, badge_key)
        DO UPDATE SET
            metadata = EXCLUDED.metadata,
            updated_at = CURRENT_TIMESTAMP;
    ELSE
        DELETE FROM quality_badges 
        WHERE business_id = business_id_param AND badge_key = 'fast_delivery';
    END IF;
    
    -- Бейдж "Надежный продавец" - низкие инциденты (< 5% отмен) и минимум 50 заказов
    IF metrics.total_orders >= 50 AND 
       (metrics.incident_count::numeric / NULLIF(metrics.total_orders, 0) * 100) < 5 THEN
        INSERT INTO quality_badges (business_id, badge_key, metadata, expires_at)
        VALUES (
            business_id_param,
            'reliable',
            jsonb_build_object(
                'incident_rate', ROUND((metrics.incident_count::numeric / NULLIF(metrics.total_orders, 0) * 100)::numeric, 2),
                'total_orders', metrics.total_orders
            ),
            NULL
        )
        ON CONFLICT (business_id, badge_key)
        DO UPDATE SET
            metadata = EXCLUDED.metadata,
            updated_at = CURRENT_TIMESTAMP;
    ELSE
        DELETE FROM quality_badges 
        WHERE business_id = business_id_param AND badge_key = 'reliable';
    END IF;
    
    -- Бейдж "Эко-чемпион" - много завершенных заказов (предотвращение отходов)
    IF metrics.completed_orders >= 100 THEN
        INSERT INTO quality_badges (business_id, badge_key, metadata, expires_at)
        VALUES (
            business_id_param,
            'eco_champion',
            jsonb_build_object(
                'completed_orders', metrics.completed_orders
            ),
            NULL
        )
        ON CONFLICT (business_id, badge_key)
        DO UPDATE SET
            metadata = EXCLUDED.metadata,
            updated_at = CURRENT_TIMESTAMP;
    ELSE
        DELETE FROM quality_badges 
        WHERE business_id = business_id_param AND badge_key = 'eco_champion';
    END IF;
    
    -- Бейдж "Быстрый ответ" - среднее время ответа < 1 часа
    IF metrics.avg_response_time_hours < 1 AND metrics.total_orders >= 10 THEN
        INSERT INTO quality_badges (business_id, badge_key, metadata, expires_at)
        VALUES (
            business_id_param,
            'quick_response',
            jsonb_build_object(
                'avg_response_hours', metrics.avg_response_time_hours
            ),
            NULL
        )
        ON CONFLICT (business_id, badge_key)
        DO UPDATE SET
            metadata = EXCLUDED.metadata,
            updated_at = CURRENT_TIMESTAMP;
    ELSE
        DELETE FROM quality_badges 
        WHERE business_id = business_id_param AND badge_key = 'quick_response';
    END IF;
    
    -- Удаляем истекшие бейджи
    DELETE FROM quality_badges 
    WHERE business_id = business_id_param 
    AND expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Комментарии
COMMENT ON TABLE quality_badges IS 'Бейджи качества продавцов (автоматически присваиваемые)';
COMMENT ON COLUMN quality_badges.badge_key IS 'Ключ бейджа: top_rated, fast_delivery, reliable, eco_champion, quick_response';
COMMENT ON COLUMN quality_badges.metadata IS 'Дополнительные данные: метрики, значения критериев';
COMMENT ON FUNCTION calculate_business_metrics IS 'Расчет метрик бизнеса для присвоения бейджей';
COMMENT ON FUNCTION update_business_badges IS 'Обновление бейджей для конкретного бизнеса на основе метрик';

