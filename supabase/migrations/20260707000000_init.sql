-- ========================================================
-- MAKON PLATFORMASI — BAZA STRUKTURASI (Supabase Postgres)
-- SQL Editor oynasiga nusxalab, "Run" tugmasini bosing.
-- ========================================================

-- 1. Apartamentlar jadvali
CREATE TABLE IF NOT EXISTS apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
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

-- 2. Apartament qo'shimcha rasmlari va 360° turlar jadvali
CREATE TABLE IF NOT EXISTS apartment_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid REFERENCES apartments(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_360 boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Bron qilish (Bookings) jadvali
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

-- Indexlar (qidiruv va filtrni tezlashtirish uchun)
CREATE INDEX IF NOT EXISTS idx_apartments_status ON apartments(status);
CREATE INDEX IF NOT EXISTS idx_apartment_images_apt_id ON apartment_images(apartment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_apt_dates ON bookings(apartment_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);

-- RLS (Row Level Security) - Adminlar uchun hamma narsaga ruxsat, jamoatga esa faqat o'qish (Read-only)
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Siyosatlar (Policies)
-- Apartments: hamma ko'rishi mumkin
CREATE POLICY "Public Read Apartments" ON apartments
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admin All Apartments" ON apartments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Apartment Images: hamma ko'rishi mumkin
CREATE POLICY "Public Read Images" ON apartment_images
  FOR SELECT USING (true);

CREATE POLICY "Admin All Images" ON apartment_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bookings: faqat admin ko'rishi/tahrirlashi mumkin, jamoat faqat yaratishi (Insert) mumkin
CREATE POLICY "Public Insert Bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin All Bookings" ON bookings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
