-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text UNIQUE,
  bot_token_shef text,
  bot_token_manager text,
  bot_token_cleaner text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- 2. Insert a default tenant (Asia Way)
INSERT INTO public.tenants (id, name, subdomain) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Asia Way', 'asiaway')
ON CONFLICT DO NOTHING;

-- 3. Add tenant_id to profiles and set default
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
UPDATE public.profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 4. Add tenant_id to all operational tables
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.apartment_images ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.bot_drafts ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.bot_subscribers ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- Update existing data
UPDATE public.apartments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.apartment_images SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.bookings SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.leads SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.clients SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.payments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.expenses SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.tasks SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.bot_drafts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.bot_subscribers SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- Make NOT NULL after update
ALTER TABLE public.apartments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.clients ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.payments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.expenses ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.tasks ALTER COLUMN tenant_id SET NOT NULL;

-- 5. RLS Policies using custom function for better performance
CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Drop old policies
DROP POLICY IF EXISTS "Public Read Apartments" ON apartments;
DROP POLICY IF EXISTS "Admin All Apartments" ON apartments;
DROP POLICY IF EXISTS "Public Read Images" ON apartment_images;
DROP POLICY IF EXISTS "Admin All Images" ON apartment_images;
DROP POLICY IF EXISTS "Public Insert Bookings" ON bookings;
DROP POLICY IF EXISTS "Public Read Bookings" ON bookings;
DROP POLICY IF EXISTS "Admin All Bookings" ON bookings;
DROP POLICY IF EXISTS "Public Insert Leads" ON leads;
DROP POLICY IF EXISTS "Admin All Leads" ON leads;

-- Create new tenant-aware policies
-- Apartments
CREATE POLICY "Tenant read apartments" ON apartments FOR SELECT USING (tenant_id = public.current_tenant_id());
CREATE POLICY "Tenant all apartments" ON apartments FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());

-- Bookings
CREATE POLICY "Tenant read bookings" ON bookings FOR SELECT USING (tenant_id = public.current_tenant_id());
CREATE POLICY "Tenant all bookings" ON bookings FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());

-- Leads
CREATE POLICY "Tenant read leads" ON leads FOR SELECT USING (tenant_id = public.current_tenant_id());
CREATE POLICY "Tenant all leads" ON leads FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());

-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant all clients" ON clients FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant all payments" ON payments FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());

-- Expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant all expenses" ON expenses FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());

-- Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant all tasks" ON tasks FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());

-- Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin all tenants" ON tenants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Triggers to auto-set tenant_id on INSERT
CREATE OR REPLACE FUNCTION public.set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.current_tenant_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_tenant_id_apartments BEFORE INSERT ON apartments FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_apartment_images BEFORE INSERT ON apartment_images FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_bookings BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_leads BEFORE INSERT ON leads FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_clients BEFORE INSERT ON clients FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_payments BEFORE INSERT ON payments FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_expenses BEFORE INSERT ON expenses FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_tasks BEFORE INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_bot_drafts BEFORE INSERT ON bot_drafts FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_bot_subscribers BEFORE INSERT ON bot_subscribers FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
