-- Egaga oylik to'lovi qaysi oy uchun to'langani ('YYYY-MM').
-- Bot [✅ To'landi] tugmasi bosilganda shu ustun yangilanadi va
-- o'sha oy uchun eslatmalar to'xtaydi.

ALTER TABLE apartments ADD COLUMN IF NOT EXISTS lease_last_paid_period text;
