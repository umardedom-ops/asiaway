-- ========================================================
-- FAZA 3 — BIZNES-MANTIQ TUZATISHLARI (audit: AUDIT-2026-07-15.md)
-- Supabase SQL Editor'da ishga tushiring. Idempotent.
-- ========================================================

-- --------------------------------------------------------
-- 3.1 (H1) IKKI MARTA BRON — DB darajasida to'sib qo'yamiz.
-- Sabab: kodda "bandligini tekshir → insert" atomar emas. Ikki so'rov bir vaqtda
-- kelsa ikkalasi ham bo'sh deb topadi va bitta xona ikki mehmonga sotiladi.
-- Yechim: Postgres EXCLUDE constraint — bazaning o'zi ruxsat bermaydi.
-- --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Avval mavjud ustma-ust bronlar bo'lsa constraint qo'shilmaydi.
-- Tekshirish (qo'lda ko'rish uchun):
--   SELECT a.id, b.id FROM bookings a JOIN bookings b
--     ON a.apartment_id = b.apartment_id AND a.id < b.id
--    AND a.booking_status <> 'cancelled' AND b.booking_status <> 'cancelled'
--    AND daterange(a.check_in, a.check_out, '[)') && daterange(b.check_in, b.check_out, '[)');

DO $$
BEGIN
  ALTER TABLE bookings ADD CONSTRAINT no_double_booking
    EXCLUDE USING gist (
      apartment_id WITH =,
      daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (booking_status <> 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;              -- allaqachon bor
  WHEN exclusion_violation THEN
    RAISE NOTICE 'DIQQAT: mavjud ustma-ust bronlar bor — avval ularni tozalang, keyin qayta ishga tushiring.';
END $$;

-- --------------------------------------------------------
-- 3.4 (H7) VALYUTA KURSINI BRONGA MUZLATISH
-- Sabab: PAYMENT_USD_RATE env'da (default 12500). Kurs o'zgarsa, allaqachon
-- yaratilgan bronning to'lov summasi ham o'zgarib ketadi → mijoz noto'g'ri to'laydi.
-- Yechim: bron yaratilganda kurs bronga yoziladi va to'lovda SHU kurs ishlatiladi.
-- --------------------------------------------------------
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fx_rate numeric CHECK (fx_rate > 0);

-- --------------------------------------------------------
-- 3.6 (M6) O'LIK VA XAVFLI TRIGGER — o'chiramiz.
-- `transactions` jadvali hech qayerda ishlatilmaydi, lekin triggeri
-- clients.total_spent ni oshiradi. Ilova kodi ham oshiradi (clients-sync.ts)
-- → kelajakda transactions ishlatilsa summa IKKI MARTA sanaladi.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS update_client_ltv_trigger ON transactions;
DROP FUNCTION IF EXISTS update_client_ltv();

-- --------------------------------------------------------
-- 3.6 (M5) MIJOZ LTV — haqiqiy manbadan hisoblanadigan VIEW.
-- Sabab: clients.total_spent / total_stays har bronda oshadi, lekin bron BEKOR
-- qilinsa kamaymaydi → LTV noto'g'ri o'sib boradi.
-- Yechim: haqiqatni bookings'dan hisoblaydigan view. Kod asta-sekin shunga o'tadi.
-- --------------------------------------------------------
CREATE OR REPLACE VIEW client_stats AS
SELECT
  c.id                                                   AS client_id,
  c.full_name,
  c.phone,
  COUNT(b.id) FILTER (WHERE b.booking_status <> 'cancelled')          AS stays,
  COALESCE(SUM(b.total_price) FILTER (WHERE b.booking_status <> 'cancelled'), 0) AS booked_total,
  COALESCE((
    SELECT SUM(p.amount * CASE WHEN p.kind = 'refund' THEN -1 ELSE 1 END)
    FROM payments p WHERE p.client_id = c.id
  ), 0)                                                  AS paid_total
FROM clients c
LEFT JOIN bookings b ON b.guest_phone = c.phone AND c.phone IS NOT NULL
GROUP BY c.id, c.full_name, c.phone;

-- --------------------------------------------------------
-- Foydali indekslar (audit: M4 — limitsiz so'rovlar sekin)
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_status_dates
  ON bookings(booking_status, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_checked_in_at ON bookings(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
