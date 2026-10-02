-- ============================================================
-- iCal SINXRONIZATSIYA — Airbnb / Booking.com va boshqa platformalar
-- Supabase SQL Editor'da ishga tushiring. Idempotent.
--
-- Qanday ishlaydi:
--   IMPORT: har kvartira uchun platformadagi iCal havola (ical_feeds) saqlanadi.
--           Cron havolani o'qiydi va band sanalarni bookings'ga yozadi
--           (channel = 'airbnb' / 'booking', external_uid = platformadagi UID).
--   EXPORT: /api/ical/<apartment_id>.ics — sayt bronlari platformalarga beriladi.
--
-- Eslatma: multi-tenant migratsiyasi (tenants, tenant_id) bazada qo'llanmagan,
-- shuning uchun bu jadval ham boshqalari kabi tenant'siz.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ical_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'other'
    CHECK (channel IN ('airbnb','booking','instagram','whatsapp','telegram','direct','other')),
  url text NOT NULL CHECK (url ~* '^https?://'),
  last_synced_at timestamptz,
  last_status text CHECK (last_status IN ('ok','error')),
  last_error text,
  last_event_count integer,
  -- Telegramga xabar berilgan to'qnashuvlar (har 15 daqiqada takrorlanmasin)
  notified_conflicts text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (apartment_id, url)
);

CREATE INDEX IF NOT EXISTS idx_ical_feeds_apartment ON public.ical_feeds(apartment_id);

ALTER TABLE public.ical_feeds ENABLE ROW LEVEL SECURITY;

-- Havolalarda platformaning maxfiy kaliti bor — faqat tizimga kirgan xodimlar ko'radi
-- (anonim mehmon o'qiy olmaydi; cron service kaliti bilan ishlaydi)
DROP POLICY IF EXISTS "ical_feeds_auth_all" ON public.ical_feeds;
CREATE POLICY "ical_feeds_auth_all" ON public.ical_feeds
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bookings: platformadan kelgan bron qaysi hodisaga (UID) tegishli
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS external_uid text,
  ADD COLUMN IF NOT EXISTS ical_feed_id uuid REFERENCES public.ical_feeds(id) ON DELETE SET NULL;

-- Bitta platforma hodisasi ikki marta import qilinmasin
CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_apartment_external_uid
  ON public.bookings(apartment_id, external_uid)
  WHERE external_uid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_ical_feed ON public.bookings(ical_feed_id);
