-- Topshiriq berishda foto biriktirish (masalan: "mana shu joyni tozala" rasmi).
-- proof_image_url — farrosh BAJARGANDAGI dalil; brief_image_url — TOPSHIRIQ fotosi.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS brief_image_url TEXT;
