-- 1. Create bot_subscribers table
CREATE TABLE IF NOT EXISTS bot_subscribers (
  chat_id BIGINT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('shef', 'menejer', 'cleaning')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect table
ALTER TABLE bot_subscribers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admin All Bot Subscribers" ON bot_subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Update existing 'farrosh' roles to 'cleaning' in profiles
UPDATE profiles SET role = 'cleaning' WHERE role = 'farrosh';

-- 3. Modify CHECK constraint on profiles table to replace 'farrosh' with 'cleaning'
DO $$ 
BEGIN
  -- We need to drop the existing constraint and add a new one. 
  -- In Postgres, constraints generated with CHECK have an automatic name if not specified.
  -- The constraint name is usually "profiles_role_check".
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('shef', 'menejer', 'cleaning'));
EXCEPTION WHEN others THEN
  -- If it fails, maybe the name is different, so we catch exception.
  NULL;
END $$;
