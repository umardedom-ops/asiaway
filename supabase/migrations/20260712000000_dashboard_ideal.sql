-- 1. Profiles for RBAC (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'farrosh' CHECK (role IN ('shef', 'menejer', 'farrosh')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admin All Profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Apartments Kanban Status
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS kanban_status text DEFAULT 'available' CHECK (kanban_status IN ('occupied', 'dirty', 'cleaning', 'available'));

-- Realtime for Apartments (Kanban)
ALTER PUBLICATION supabase_realtime ADD TABLE apartments;

-- 3. Bookings and Clients Relationship
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit NUMERIC DEFAULT 0;

-- 4. Transactions (Income/Expense/Salary unified)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'salary', 'cost')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admin All Transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Tasks - Add Proof Image
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- 6. Trigger to automatically create Client when Booking is confirmed from Site/CRM
-- This can be handled in application logic (Next.js), but good to have LTV calculation
-- Trigger to update LTV in clients
CREATE OR REPLACE FUNCTION update_client_ltv()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'income' AND NEW.client_id IS NOT NULL THEN
    UPDATE clients SET total_spent = total_spent + NEW.amount WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_client_ltv_trigger ON transactions;
CREATE TRIGGER update_client_ltv_trigger
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_client_ltv();
