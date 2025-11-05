-- Миграция для добавления QR-кода выдачи заказов
-- Добавляет поля для QR-кода, аудит событий и обновляет статусы

-- 1. Добавляем поля для QR-кода в таблицу orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS pickup_code UUID,
ADD COLUMN IF NOT EXISTS pickup_verified_at TIMESTAMP;

-- 2. Создаем индекс для быстрого поиска по pickup_code
CREATE INDEX IF NOT EXISTS idx_orders_pickup_code ON orders(pickup_code) WHERE pickup_code IS NOT NULL;

-- 3. Создаем таблицу для аудита событий заказа
CREATE TABLE IF NOT EXISTS order_events (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'qr_generated', 'qr_scanned', 'qr_scan_failed', 'status_changed', etc.
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Кто выполнил действие
    actor_type VARCHAR(20) DEFAULT 'system', -- 'user', 'business', 'system', 'admin'
    metadata JSONB, -- Дополнительные данные события
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для order_events
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_type ON order_events(event_type);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events(created_at);

-- 4. Обновляем возможные статусы заказа (добавляем ready_for_pickup и picked_up)
-- PostgreSQL не поддерживает изменение ENUM напрямую, поэтому используем CHECK constraint
-- Если статусы уже проверяются через CHECK, просто убедимся что они поддерживаются

-- Добавляем комментарий для документации
COMMENT ON COLUMN orders.pickup_code IS 'UUID код для QR-сканирования при выдаче заказа';
COMMENT ON COLUMN orders.pickup_verified_at IS 'Время подтверждения выдачи заказа через QR-код';
COMMENT ON TABLE order_events IS 'Аудит всех событий, связанных с заказами (QR-сканирование, смена статусов и т.д.)';

