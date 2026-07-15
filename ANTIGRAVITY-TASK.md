# TOPSHIRIQ (Antigravity) — Xavfsizlik: 6 ta Critical zaiflikni tuzatish

**Loyiha:** ASIA WAY PMS · `makon/` (Next.js 16 App Router + Supabase + Vercel)
**Manba:** `AUDIT-2026-07-15.md` (to'liq audit — o'qib chiq).
**Maqsad:** Quyidagi 6 ta **Critical** xavfsizlik zaifligini tuzatish. Har biri produksiya uchun bloklovchi.

> **C3 (Server Action rol guard'lari) BU TOPSHIRIQDA YO'Q** — u ~20 ta action faylni qamraydi
> va koordinatsiya talab qiladi; uni tegmang, boshqa ishchi bajaradi.

---

## ⚠️ QOIDALAR (majburiy)
1. Ish boshlashdan oldin: `git pull` (eng yangi kod).
2. Mavjud **i18n** (`DashboardLangProvider`, `useDashLang`, uz/ru) ishini **buzma** — u faol.
3. `scratch/` papkasiga **tegma** (u `.gitignore`da, maxfiy kalitlar bor).
4. Har fayldan keyin `npm run build` **xatosiz** o'tishi shart (type-check ham).
5. Tugagach: `git add -A ':!scratch'` → commit → push. Har Critical uchun **alohida commit**.
6. SQL migratsiyalar **idempotent** bo'lsin (`IF NOT EXISTS`, `DO $$ ... EXCEPTION`). Yangi migratsiya
   faylini `supabase/migrations/2026071600000X_*.sql` deb yoz va uni ishga tushirish kerakligini xabar qil.
7. Yangi `env` o'zgaruvchi kiritsang — Vercel'ga qo'shish kerakligini aniq yoz.

---

## C1 — `/api/seed` autentifikatsiyasiz va BUTUN apartamentlar jadvalini o'chiradi
**Joy:** `src/app/api/seed/route.ts`
**Ildiz sabab:** `GET()` handler auth'siz; service-role bilan ishlaydi; birinchi amali
`apartments.delete()` — hamma qatorni o'chirish. Istalgan odam `/api/seed` ni ochsa produksiya
ma'lumotlari yo'q bo'ladi (rasmlar CASCADE, bronlar xonasiz qoladi).
**Fix:** Route faylini **butunlay o'chir** (`src/app/api/seed/route.ts`). Seed bir marta ishlatilgan,
qayta kerak emas. Hech qanday kod unga bog'liq emasligini `grep -r "api/seed"` bilan tasdiqla.
**Qabul mezoni:** `/api/seed` 404 qaytaradi; build o'tadi.
**Murakkablik:** Trivial.

---

## C2 — Har qanday foydalanuvchi o'zini `shef` qila oladi (RLS privilege escalation)
**Joy:** `profiles` RLS — `20260712000000_dashboard_ideal.sql` dagi
`CREATE POLICY "Admin All Profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true)`
**Ildiz sabab:** Har qanday tizimga kirgan foydalanuvchi `profiles` ning istalgan qatorini UPDATE
qila oladi — jumladan o'zining `role` ustunini `shef` qilib. To'liq auth bypass.
**Fix:** Yangi migratsiya yoz:
```sql
DROP POLICY IF EXISTS "Admin All Profiles" ON profiles;

-- Har kim FAQAT o'z profilini o'qiy oladi
DO $$ BEGIN
  CREATE POLICY "read own profile" ON profiles
    FOR SELECT TO authenticated USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- MUHIM: UPDATE/INSERT/DELETE policy BERMAYMIZ. Ya'ni foydalanuvchi rolni
-- o'zgartira olmaydi. Rol berish faqat service_role (Supabase panel yoki server skript) orqali.
```
> Diqqat: middleware `profiles` dan `role` o'qiydi (server, cookie session bilan) — `read own profile`
> policy shuni buzmaydi (o'z qatorini o'qiydi). Buni build+manual bilan tekshir.
**Qabul mezoni:** Oddiy user brauzer konsolidan `supabase.from('profiles').update({role:'shef'})` chaqirsa
**xato/0 qator** qaytadi; dashboard rol o'qishi ishlaydi.
**Murakkablik:** Kichik.

---

## C4 — Narxni mijoz belgilaydi → to'lov summasini manipulyatsiya qilish
**Joy:** `src/app/actions/booking.ts` (`createBooking`, `BookingInput`) + `src/components/BookingDialog.tsx`
**Ildiz sabab:** `createBooking(input)` brauzerdan kelgan `total_price`, `deposit_amount`, `nights` ni
tekshirmasдан bazaga yozadi. Payme/Click webhook esa to'langan summani **o'sha bazadagi**
`deposit_amount` bilan solishtiradi → hujumchi `deposit_amount: 0.01` yuborsa, 1 tiyin to'lab
$2000 lik xonani "tasdiqlangan" qiladi.
**Fix:**
1. `BookingInput` dan `total_price`, `deposit_amount`, `nights` maydonlarini **olib tashla**
   (mijozdan olinmasin). Faqat `apartment_id, guest_*, check_in, check_out, payment_method` qolsin.
2. `createBooking` ichida **serverda** hisobla:
   ```ts
   const { data: apt } = await supabase.from("apartments")
     .select("price_per_day, deposit_amount").eq("id", input.apartment_id).single();
   if (!apt) return { success: false, error: "Apartament topilmadi" };
   const nights = Math.round(
     (new Date(input.check_out).getTime() - new Date(input.check_in).getTime()) / 86400000
   );
   if (nights <= 0) return { success: false, error: "Sanalar noto'g'ri" };
   const total_price = nights * Number(apt.price_per_day);   // mijozdan EMAS
   const deposit_amount = Number(apt.deposit_amount);        // mijozdan EMAS
   ```
   Insert va `buildCheckoutUrl` da shu serverda hisoblangan qiymatlar ishlatilsin.
3. `BookingDialog.tsx` narxni faqat **ko'rsatish uchun** hisoblasin (hozirgidek), lekin
   `createBooking` ga `total_price`/`deposit_amount` **yubormasin** (TS xatosi ularni topib beradi).
**Qabul mezoni:** `createBooking` ga soxta narx yuborib bo'lmaydi (tip yo'q); bron summasi doim
apartament narxidan hisoblanadi.
**Murakkablik:** Kichik.

---

## C5 — Telegram webhook autentifikatsiyasiz → soxta callback bilan bazani o'zgartirish
**Joy:** `src/app/api/telegram/webhook/route.ts` + `src/app/api/telegram/setup/route.ts`
**Ildiz sabab:** Webhook kelgan so'rov Telegram'dan ekanini tekshirmaydi. Soxta `callback_query`
yuborib `lead:*:lost`, `task:*:done`, `leasepaid:*` (egaga to'lov "to'landi" + soxta xarajat),
`draft:*:bron` amallarini bajarish mumkin.
**Fix:**
1. Yangi env: `TELEGRAM_WEBHOOK_SECRET` (tasodifiy uzun satr). **Vercel'ga qo'shish kerak** deb yoz.
2. `setup/route.ts` da `setWebhook` chaqiruviga `secret_token: process.env.TELEGRAM_WEBHOOK_SECRET`
   qo'sh (barcha 3 bot uchun).
3. `webhook/route.ts` boshida tekshir:
   ```ts
   const secret = req.headers.get("x-telegram-bot-api-secret-token");
   if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
     return NextResponse.json({ status: "unauthorized" }, { status: 401 });
   }
   ```
   Qo'shimcha (yaxshi bo'ladi): callback bosgan `callback_query.from.id`/`chat.id` haqiqatan
   `bot_subscribers` da shu rolga ega ekanini tekshir; egaga-to'lov/task kabi ta'sirchan
   amallarni faqat ulangan xodim qila olsin.
**Qabul mezoni:** Secret'siz POST → 401; `setup` qayta ishga tushirilгач botlar ishlaydi.
**Murakkablik:** Kichik.

---

## C6 — Anon kalit bilan istalgan bron/lead kiritish (RLS `WITH CHECK (true)`)
**Joy:** RLS — `20260707000000_init.sql` (`Public Insert Bookings`), `20260708000000_leads.sql` (`Public Insert Leads`);
kod — `src/app/actions/booking.ts` (`createBooking`), `src/app/actions/lead.ts` (allaqachon service-role).
**Ildiz sabab:** `FOR INSERT WITH CHECK (true)` — ommaviy `anon` kalit (brauzerда ochiq) bilan
Server Action validatsiyasini (overlap, narx) chetlab o'tib, to'g'ridan-to'g'ri istalgan qatorli
bron/lead kiritish mumkin (spam, soxta narx, band xonaga bron, DoS).
**Fix:**
1. Yangi migratsiya:
   ```sql
   DROP POLICY IF EXISTS "Public Insert Bookings" ON bookings;
   DROP POLICY IF EXISTS "Public Insert Leads" ON leads;
   ```
2. **MUHIM:** `createBooking` hozir SSR **anon** klient bilan insert qiladi
   (`createClient` from `@/lib/supabase/server`). Public policy o'chgach bu **ishlamay qoladi**.
   Shuning uchun `createBooking` dagi insert'ni **service-role** klientga o'tkaz
   (`lead.ts` dagi `serviceClient()` andozasi kabi — `SUPABASE_SERVICE_ROLE_KEY`).
   Faqat **insert/overlap tekshiruvi** service-role bilan bo'lsin; validatsiya (narx C4) serverda.
   `getBookedDates` (public read) tegmasin — u anon bilan qoladi (bookings public read allaqachon yo'q,
   lekin kalendarga band kunlar kerak; agar u SELECT policy'ga tayansa, `getBookedDates` ni ham
   service-role qil).
3. Tekshir: saytdan bron va aloqa formasi **ishlashda davom etsin** (service-role orqali).
**Qabul mezoni:** Anon kalit bilan to'g'ridan-to'g'ri `bookings`/`leads` INSERT → RLS rad etadi;
saytdan bron/lead Server Action orqali ishlaydi.
**Murakkablik:** Kichik–o'rta (ehtiyot bo'l: saytni sindirmasдан).

---

## C7 — PostgREST filter injection (`.or()` string interpolatsiyasi)
**Joy:** `src/app/dashboard/(admin)/clients/[id]/page.tsx` (~38-qator)
**Kod:** `bookingsQuery.or(\`guest_phone.eq.${client.phone},client_id.eq.${id}\`)`
**Ildiz sabab:** `client.phone` (foydalanuvchi kiritган matn) PostgREST filter satriga
to'g'ridan-to'g'ri yopishtirilyapti. Vergul/qavs bilan filtrni buzish/kengaytirish → boshqa
mijozlar bronlarini ko'rish yoki butun `bookings` ni chiqarish mumkin.
**Fix:** Interpolatsiyani yo'qot. Eng toza yo'l — faqat `client_id` bo'yicha
(bookings'да `client_id` ustuni bor):
```ts
const { data: bookings } = await supabase
  .from("bookings")
  .select("*, apartments(title)")
  .eq("client_id", id)
  .order("check_in", { ascending: false });
```
Agar eski bronlarда `client_id` to'ldirilmagan bo'lsa — telefon bo'yicha **alohida** so'rov qilib
(`.eq("guest_phone", client.phone)`, interpolatsiyasiz) natijalarni kodда birlashtir (id bo'yicha dedupe).
**Qabul mezoni:** `.or()` string interpolatsiyasi yo'q; mijoz sahifasi to'g'ri bronlarni ko'rsatadi.
**Murakkablik:** Kichik.

---

## YAKUNIY TEKSHIRUV (hammasidan keyin)
- [ ] `npm run build` xatosiz (type-check ham).
- [ ] `grep -rn "api/seed" src/` — hech narsa yo'q (C1).
- [ ] `grep -rn "WITH CHECK (true)" supabase/migrations/` da faqat kerakli (admin) policy'lar qolgan.
- [ ] Saytdan bron + aloqa formasi ishlaydi (C4/C6 saytni sindirmagan).
- [ ] Yangi migratsiyalar Supabase'да RUN qilinishi kerakligini xabar qil.
- [ ] Yangi env (`TELEGRAM_WEBHOOK_SECRET`) Vercel'ga qo'shilishi kerakligini xabar qil.
- [ ] Har Critical alohida commit + push.

Ish tugagach: qaysi Critical'lar tuzatilgani, qanday env/SQL qo'lда bajarilishi kerakligi
haqida qisqa hisobot yoz.
