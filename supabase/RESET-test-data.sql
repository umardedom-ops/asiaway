-- ============================================================
-- TEST MA'LUMOTLARINI TOZALASH (0 ga qaytarish)
-- Supabase → SQL Editor → yangi query → shu matnni qo'ying → RUN.
--
-- O'CHIRILADI: bronlar, to'lovlar, murojaatlar (leads), mijozlar (mehmonlar),
--   vazifalar, xarajatlar, kirish jurnali, bot qoralamalari.
-- QOLADI (TEGILMAYDI): apartamentlar + egalar ma'lumoti, xodimlar (staff),
--   foydalanuvchi rollari (profiles), bot obunachilari.
--
-- Bir marta RUN qilinadi. Keyin dashboard hamma joyda 0 dan boshlanadi.
-- ============================================================

-- 1. To'lovlar (bookings'ga bog'liq — birinchi o'chadi)
DELETE FROM public.payments;

-- 2. Bronlar
DELETE FROM public.bookings;

-- 3. Murojaatlar (CRM leads)
DELETE FROM public.leads;

-- 4. Mijozlar / mehmonlar bazasi
DELETE FROM public.clients;

-- 5. Vazifalar (tozalash va h.k.)
DELETE FROM public.tasks;

-- 6. Xarajatlar (test arenda/maosh/boshqa)
DELETE FROM public.expenses;

-- 7. Kirish jurnali (agar jadval mavjud bo'lsa)
DELETE FROM public.login_journal;

-- 8. Bot qoralamalari (agar jadval mavjud bo'lsa)
DELETE FROM public.bot_drafts;

-- 9. Apartamentlarni boshlang'ich holatga: hammasi BO'SH,
--    egaga to'lov davri tozalanadi (egalar/narx ma'lumoti QOLADI)
UPDATE public.apartments
   SET kanban_status = 'available',
       lease_last_paid_period = NULL;

-- Tayyor. Dashboard endi 0 dan boshlanadi.
