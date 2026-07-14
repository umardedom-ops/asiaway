-- ========================================================
-- FIX: bitta Telegram foydalanuvchi BIR NECHTA botga (rolga) obuna bo'la olsin.
--
-- Muammo: bot_subscribers.chat_id PRIMARY KEY edi. Telegramda bir odamning
-- chat_id'si BARCHA botlarda bir xil. Shuning uchun shef botiga ulangach,
-- menejer botiga ulanganda upsert(onConflict: chat_id) eski qator USTIGA yozib,
-- rolni almashtirib yuborardi. Natijada bir odam faqat bitta rolga ega bo'lardi
-- va qolgan botlarga xabar ketmasdi.
--
-- Yechim: PK -> id (uuid), (chat_id, role) juftligi UNIQUE.
-- Supabase SQL Editor'da ishga tushiring. Idempotent.
-- ========================================================

-- 1. Eski primary key'ni olib tashlaymiz (chat_id ustidagi)
ALTER TABLE bot_subscribers DROP CONSTRAINT IF EXISTS bot_subscribers_pkey;

-- 2. Yangi id ustuni (surrogate PK)
ALTER TABLE bot_subscribers ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
UPDATE bot_subscribers SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE bot_subscribers ALTER COLUMN id SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE bot_subscribers ADD PRIMARY KEY (id);
EXCEPTION WHEN others THEN NULL; -- allaqachon bor bo'lsa
END $$;

-- 3. Bir odam + bir rol = bitta yozuv (lekin turli rollar bemalol)
CREATE UNIQUE INDEX IF NOT EXISTS uq_bot_subscribers_chat_role
  ON bot_subscribers(chat_id, role);

-- 4. Rolga qidiruv tez bo'lsin (notifyRole shu bo'yicha o'qiydi)
CREATE INDEX IF NOT EXISTS idx_bot_subscribers_role ON bot_subscribers(role);
