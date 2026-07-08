-- ========================================================
-- ASIA WAY — BOSHQARUV TIZIMI (moliya + xodimlar + vazifalar + kanallar)
-- Property-management: kvartirani arendaga olishdan mijozni kuzatishgacha.
-- Supabase SQL Editor'ga nusxalab "Run" bosing. Idempotent (qayta ishga tushsa xato bermaydi).
-- ========================================================

-- ---------- 1. Mavjud jadvallarga yangi ustunlar ----------

-- Apartments: BIZ egadan qancha arendaga olamiz (tan narx) + ega ma'lumoti
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS monthly_lease_cost numeric DEFAULT 0 CHECK (monthly_lease_cost >= 0);
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS owner_phone text;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS lease_start_date date;

-- Bookings: qaysi kanaldan keldi (Airbnb / Booking / Instagram / WhatsApp / Telegram / to'g'ridan-to'g'ri)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS channel text DEFAULT 'direct'
  CHECK (channel IN ('airbnb','booking','instagram','whatsapp','telegram','direct','other'));

-- Leads: manba + izoh (sayt formasi va CRM shulardan foydalanadi)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'sayt';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text;
-- Status ro'yxatini kengaytiramiz (yangi/aloqada/kutmoqda/yopilgan)
DO $$
BEGIN
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
  ALTER TABLE leads ADD CONSTRAINT leads_status_check
    CHECK (status IN ('new','contacted','waiting','won','lost','closed'));
EXCEPTION WHEN others THEN NULL;
END $$;

-- ---------- 2. Xodimlar (menejer, tozalovchilar, ...) ----------
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'cleaner'
    CHECK (role IN ('manager','cleaner','maintenance','driver','other')),
  phone text,
  monthly_salary numeric DEFAULT 0 CHECK (monthly_salary >= 0),
  active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ---------- 3. Vazifalar (KPI uchun manba) ----------
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  apartment_id uuid REFERENCES apartments(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES staff(id) ON DELETE SET NULL,
  type text DEFAULT 'cleaning'
    CHECK (type IN ('cleaning','checkin','checkout','maintenance','shopping','other')),
  status text DEFAULT 'todo'
    CHECK (status IN ('todo','in_progress','done','cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ---------- 4. Xarajatlar (arenda / kommunal / ish haqi / tozalash / ...) ----------
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('rent','utilities','salary','cleaning','supplies','marketing','repair','other')),
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'USD',
  spent_on date NOT NULL DEFAULT current_date,
  apartment_id uuid REFERENCES apartments(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- ---------- 5. Mijozlar (guest lifecycle — takroriy mehmonlarni birlashtirish) ----------
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  channel text DEFAULT 'direct',
  stage text DEFAULT 'lead'
    CHECK (stage IN ('lead','contacted','booked','staying','checked_out','repeat')),
  total_stays integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ---------- Indexlar ----------
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(spent_on DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_bookings_channel ON bookings(channel);

-- ---------- RLS: faqat autentifikatsiyalangan admin ko'radi/tahrirlaydi ----------
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Admin All Staff" ON staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$
BEGIN
  CREATE POLICY "Admin All Tasks" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$
BEGIN
  CREATE POLICY "Admin All Expenses" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$
BEGIN
  CREATE POLICY "Admin All Clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
