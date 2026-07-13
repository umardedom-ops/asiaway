-- To'lov (Payme / Click) uchun bookings jadvaliga ustunlar.
-- Supabase SQL Editor'da ishga tushiring. Idempotent.

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_provider text
  CHECK (payment_provider IN ('payme','click','simulate'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_transaction_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_state integer DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_created_ms bigint;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_perform_ms bigint;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_cancel_ms bigint;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reason integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount_tiyin bigint;

CREATE INDEX IF NOT EXISTS idx_bookings_payment_tx ON bookings(payment_transaction_id);

-- 'pending' holatдаги eski (to'lanmagan) sayt bronlari sanalarni band qilib qolmasligi
-- uchun createBooking ichida 2 soatdan eski pending+payment_provider bronlar bekor qilinadi.
