-- ========================================================
-- bot_subscribers jadvaliga 'lang' ustunini qo'shish
-- Telegram bot foydalanuvchilarining tillarini (uz/ru) saqlaydi
-- ========================================================

ALTER TABLE bot_subscribers 
ADD COLUMN IF NOT EXISTS lang VARCHAR(10) DEFAULT 'uz';
