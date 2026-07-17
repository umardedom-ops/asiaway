-- 4 asosiy dostup roli: shef, menejer, finansist, targetolog (+ mavjud cleaning).
-- Login/parol kimga tegishli bo'lsa, profiles.role shuni belgilaydi.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('shef', 'menejer', 'finansist', 'targetolog', 'cleaning'));

-- Telegram bot obunachilari uchun ism (kim ulanganini bilish uchun, avtomatik)
ALTER TABLE bot_subscribers ADD COLUMN IF NOT EXISTS name TEXT;
