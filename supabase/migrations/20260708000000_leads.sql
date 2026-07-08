-- ========================================================
-- ASIA WAY — LEADS (aloqa / qayta aloqaga chiqish so'rovlari)
-- Saytdagi aloqa formasi shu jadvalga yozadi.
-- Supabase SQL Editor'ga nusxalab, "Run" bosing.
-- ========================================================

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  telegram text,
  email text,
  message text,
  lang text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

-- RLS: jamoat faqat qo'shishi (Insert) mumkin, faqat admin ko'radi/tahrirlaydi
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Insert Leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin All Leads" ON leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
