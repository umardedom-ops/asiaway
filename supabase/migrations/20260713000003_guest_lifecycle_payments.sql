-- ========================================================
-- ASIA WAY — Mehmon hayotiy sikli + Kirim kassasi (payments)
-- CRM → Bron → Joylashtirish (check-in) → Checkout oqimi + har to'lov jurnali.
-- Supabase SQL Editor'ga nusxalab "Run" bosing. Idempotent.
-- ========================================================

-- 1. Joylashtirish (check-in) vaqti — "hozir turgan mehmonlar" shu bo'yicha aniqlanadi
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

-- Qaysi lead'dan kelgan (CRM → Bron kuzatuvi uchun)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_checked_in ON bookings(checked_in_at);

-- 2. Kirim kassasi — har bir mehmon to'lovi (avtomat yoki qo'lda), sana+soatgacha
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  guest_name text,
  amount numeric NOT NULL CHECK (amount >= 0),
  method text NOT NULL DEFAULT 'naqd'
    CHECK (method IN ('naqd','karta','payme','click','otkazma','boshqa')),
  kind text NOT NULL DEFAULT 'payment'
    CHECK (kind IN ('deposit','payment','refund')),
  note text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admin All Payments" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
