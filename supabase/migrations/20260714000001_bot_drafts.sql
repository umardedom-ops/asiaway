-- Telegram botда to'ldirilgan shablon vaqtincha shu yerda turadi.
-- Menejer/shef "CRM ga" yoki "Bronga" tugmasini bosgunicha saqlanadi.
-- Supabase SQL Editor'да ishga tushiring. Idempotent.

CREATE TABLE IF NOT EXISTS bot_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_drafts_chat ON bot_drafts(chat_id);

ALTER TABLE bot_drafts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admin All Bot Drafts" ON bot_drafts FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
