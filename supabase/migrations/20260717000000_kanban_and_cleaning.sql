-- Task 1: Add source and utm_data to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS utm_data JSONB;

-- Eslatma: xona tozalik holati uchun mavjud apartments.kanban_status
-- ('available'/'occupied'/'dirty'/'cleaning') ishlatiladi — alohida
-- cleaning_status ustuni KERAK EMAS (split-brain oldini olish uchun olib tashlandi).
