-- Ega'ga oylik to'lov kuni (oyning nechanchi sanasi, 1-31).
-- Shef botiga 3 kun oldin, 1 kun oldin va to'lov kunida eslatma boradi.

ALTER TABLE apartments ADD COLUMN IF NOT EXISTS lease_payment_day integer
  CHECK (lease_payment_day >= 1 AND lease_payment_day <= 31);
