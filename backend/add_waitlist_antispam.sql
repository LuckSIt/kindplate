-- Миграция для антиспам защиты waitlist уведомлений
-- Добавляет таблицу для отслеживания последних уведомлений

-- Таблица для отслеживания последних уведомлений (антиспам)
CREATE TABLE IF NOT EXISTS waitlist_notifications_log (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) DEFAULT 'offer_live', -- 'offer_live', 'batch_available'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(offer_id, user_id, notification_type) -- Одно уведомление на комбинацию
);

-- Индекс для быстрого поиска последних уведомлений
CREATE INDEX IF NOT EXISTS idx_waitlist_notifications_offer_user ON waitlist_notifications_log(offer_id, user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_notifications_sent_at ON waitlist_notifications_log(sent_at);

-- Комментарии
COMMENT ON TABLE waitlist_notifications_log IS 'Лог отправленных уведомлений для антиспам защиты';
COMMENT ON COLUMN waitlist_notifications_log.notification_type IS 'Тип уведомления: offer_live, batch_available';

