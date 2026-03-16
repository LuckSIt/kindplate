-- Добавляем тип предложения: dish (блюдо) или special_box (спецбокс)
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_type VARCHAR(20) NOT NULL DEFAULT 'dish' CHECK (offer_type IN ('dish', 'special_box'));
