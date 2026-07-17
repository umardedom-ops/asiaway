-- Farrosh botda [Bajarildi] bosgach, qaysi vazifa uchun RASM kutilayotganini
-- eslab qolish uchun. Rasm kelgach shu vazifa proof bilan yakunlanadi.
ALTER TABLE bot_subscribers ADD COLUMN IF NOT EXISTS pending_task_id uuid;
