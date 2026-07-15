DROP POLICY IF EXISTS "Admin All Profiles" ON profiles;

-- Har kim FAQAT o'z profilini o'qiy oladi
DO $$ BEGIN
  CREATE POLICY "read own profile" ON profiles
    FOR SELECT TO authenticated USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- MUHIM: UPDATE/INSERT/DELETE policy BERMAYMIZ. Ya'ni foydalanuvchi rolni
-- o'zgartira olmaydi. Rol berish faqat service_role (Supabase panel yoki server skript) orqali.
