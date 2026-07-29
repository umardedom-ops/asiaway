-- Add title_ru and description_ru to apartments
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS description_ru text;

-- Backfill with existing values as fallback
UPDATE public.apartments SET title_ru = title WHERE title_ru IS NULL;
UPDATE public.apartments SET description_ru = description WHERE description_ru IS NULL;
