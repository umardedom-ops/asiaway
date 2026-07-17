-- ============================================================
-- Attribution sinxronizatsiyasi: lead → booking hech narsa yo'qolmasin
-- + Meta CAPI dedup + kirish jurnali (rollar uchun)
-- Idempotent: bir necha marta RUN qilinsa ham xato bermaydi.
-- ============================================================

-- Bookings: marketing attribution + izoh + CAPI dedup
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS utm_data JSONB,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS capi_sent_at TIMESTAMPTZ;

-- Leads: saytdan kelgan UTM belgilar (keyin bookingga ko'chadi)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS utm_data JSONB;

-- Kirish jurnali: kim, qachon, qaysi rol bilan tizimga kirdi (anketa)
CREATE TABLE IF NOT EXISTS public.login_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  role text,
  name text,
  purpose text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "login_journal_auth_all" ON public.login_journal;
CREATE POLICY "login_journal_auth_all" ON public.login_journal
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_login_journal_created ON public.login_journal(created_at DESC);
