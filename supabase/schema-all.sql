-- ============================================================
-- ASIA WAY — TO'LIQ BAZA SXEMASI (bir marta paste qilib Run bosing)
-- Supabase → SQL Editor → New query → hammasini nusxalab → Run
-- Jadvallar + RLS + 9 ta apartament (to'g'ri UUID bilan) seed.
-- ============================================================

-- 1. Apartments (view va bed_config ustunlari BILAN — frontend shularni o'qiydi)
CREATE TABLE IF NOT EXISTS apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  view text,
  bed_config text,
  address text,
  district text,
  price_per_day numeric NOT NULL CHECK (price_per_day >= 0),
  price_per_month numeric CHECK (price_per_month >= 0),
  deposit_amount numeric NOT NULL CHECK (deposit_amount >= 0),
  area_m2 numeric CHECK (area_m2 > 0),
  rooms integer CHECK (rooms > 0),
  floor integer,
  max_guests integer CHECK (max_guests > 0),
  amenities text[] DEFAULT '{}'::text[],
  cover_image text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- 2. Apartament qo'shimcha rasmlari
CREATE TABLE IF NOT EXISTS apartment_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid REFERENCES apartments(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_360 boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Bookings (bron)
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid REFERENCES apartments(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  guest_phone text NOT NULL,
  guest_email text,
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights integer NOT NULL CHECK (nights > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  deposit_amount numeric NOT NULL CHECK (deposit_amount >= 0),
  deposit_status text DEFAULT 'pending' CHECK (deposit_status IN ('pending', 'paid', 'refunded')),
  booking_status text DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- 4. Leads (aloqa formasi)
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

-- Indexlar
CREATE INDEX IF NOT EXISTS idx_apartments_status ON apartments(status);
CREATE INDEX IF NOT EXISTS idx_apartment_images_apt_id ON apartment_images(apartment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_apt_dates ON bookings(apartment_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- RLS
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Apartments" ON apartments;
CREATE POLICY "Public Read Apartments" ON apartments FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admin All Apartments" ON apartments;
CREATE POLICY "Admin All Apartments" ON apartments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Images" ON apartment_images;
CREATE POLICY "Public Read Images" ON apartment_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Images" ON apartment_images;
CREATE POLICY "Admin All Images" ON apartment_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bookings: jamoat yaratishi (Insert) va bandlik uchun o'qishi (Select) mumkin; tahrir faqat admin
DROP POLICY IF EXISTS "Public Insert Bookings" ON bookings;
CREATE POLICY "Public Insert Bookings" ON bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Read Bookings" ON bookings;
CREATE POLICY "Public Read Bookings" ON bookings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Bookings" ON bookings;
CREATE POLICY "Admin All Bookings" ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Leads" ON leads;
CREATE POLICY "Public Insert Leads" ON leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin All Leads" ON leads;
CREATE POLICY "Admin All Leads" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: 9 ta apartament (UUID'lar frontend seed-data.ts bilan mos)
-- ============================================================
INSERT INTO apartments (id, title, description, view, bed_config, address, district, price_per_day, price_per_month, deposit_amount, area_m2, rooms, floor, max_guests, amenities, cover_image, status) VALUES
('34780000-0000-0000-0000-000000000000', '34-qavat | 78 m² | Premium Penthouse', '34-qavatdan Humo Arena va Magic City koʻrinishi. Zamonaviy lakonik interer, shinam muhit. Toʻliq jihozlangan oshxona, tezkor Wi-Fi. Shahar markazida hashamatli yashash.', 'Humo Arena, Magic City', '2 yotoqxona — 3 yotoq o''rni', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 160, 3200, 320, 78, 2, 34, 4, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','panoramic_view','coffee_maker']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-34780000.webp', 'active'),
('29650000-0000-0000-0000-000000000000', '29-qavat | 65 m² | High Sky Suite', '29-qavatdan Humo Arena va Magic City manzarasi. 2 ta yotoqxonada 4 nafar uchun qulay. Zamonaviy interer, shinam muhit. To''liq jihozlangan oshxona.', 'Humo Arena, Magic City', '2 yotoqxona — 4 yotoq o''rni', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 140, 2800, 280, 65, 2, 29, 5, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','panoramic_view']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-29650000.webp', 'active'),
('22800000-0000-0000-0000-000000000000', '22-qavat | 80 m² | Panorama Suite', '22-qavatdan Humo Arena va Magic City ko''rinishi. Keng 80 m² maydonda 2 ta alohida yotoqxona — biri king size, ikkinchisida 2 ta single karavot.', 'Humo Arena, Magic City', '1-yotoqxona: King size | 2-yotoqxona: 2 ta single', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 150, 3000, 300, 80, 2, 22, 4, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','panoramic_view']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-22800000.webp', 'active'),
('17450000-0000-0000-0000-000000000000', '17-qavat | 45 m² | City Park Studio', '17-qavatdan Tashkent City bog''iga ajoyib manzara. Juftlar uchun ideal — katta king size karavot, shinam muhit. To''liq jihozlangan oshxona.', 'Tashkent City Park', '1 yotoqxona: King size (2 kishilik)', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 100, 2000, 200, 45, 1, 17, 2, ARRAY['wifi','smart_tv','kitchen','ac','park_view']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-17450000.webp', 'active'),
('15800000-0000-0000-0000-000000000000', '15-qavat | 80 m² | Park View Family', '15-qavatdan Tashkent City bog''iga chiroyli ko''rinish. Oila uchun ideal: 2 ta alohida yotoqxona, keng yashash maydoni. 4 nafargacha qulay.', 'Tashkent City Park', '1-yotoqxona: King size | 2-yotoqxona: 2 ta single', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 145, 2900, 290, 80, 2, 15, 4, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','park_view']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-15800000.webp', 'active'),
('11650000-0000-0000-0000-000000000000', '11-qavat | 65 m² | Park View Comfort', '11-qavatdan Tashkent City bog''iga chiroyli manzara. 2 ta yotoqxona, 3 nafargacha qulay. Shinam va zamonaviy interer.', 'Tashkent City Park', '1-yotoqxona: King size | 2-yotoqxona: Single', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 125, 2500, 250, 65, 2, 11, 3, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','park_view']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-11650000.webp', 'active'),
('10800000-0000-0000-0000-000000000000', '10-qavat | 80 m² | City View XL', '10-qavatdan shahar panoramasi. Katta guruh yoki oila uchun ideal: 2 ta king size yotoqxona + yashash xonasdagi ochiladigan divan. 6 nafargacha.', 'Shahar panoramasi', '2x King size yotoqxona + ochiladigan divan', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 140, 2800, 280, 80, 2, 10, 6, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','city_view','sofa_bed']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-10800000.webp', 'active'),
('10650000-0000-0000-0000-000000000000', '10-qavat | 65 m² | Park View Duo', '10-qavatdan Tashkent City bog''iga manzara. 2 ta yotoqxona, 3 nafargacha qulay. Shinam va zamonaviy interer. Oʻziga xos koʻrinish.', 'Tashkent City Park', '2 yotoqxona — 3 yotoq o''rni', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 120, 2400, 240, 65, 2, 10, 3, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','park_view']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-10800000.webp', 'active'),
('02650000-0000-0000-0000-000000000000', '2-qavat | 65 m² | Garden Park', '2-qavatda tinch va osoyishta ichki hovli (Garden Park) ko''rinishi. Yuqori qavatlardagi shovqindan holi. 2 ta yotoqxona, 3 nafargacha qulay.', 'Garden Park (ichki hovli)', '2 yotoqxona — 3 yotoq o''rni', 'Toshkent shahri, Toshkent City, Botir Zokirov ko''chasi 1A/1', 'Tashkent City', 110, 2200, 220, 65, 2, 2, 3, ARRAY['wifi','smart_tv','kitchen','ac','washing_machine','garden_view']::text[], 'https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-02650000.webp', 'active')
ON CONFLICT (id) DO NOTHING;
