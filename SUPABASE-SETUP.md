# Yangi Supabase profil ochib ulash — qadamma-qadam

## 1. Yangi Supabase loyiha yarating
1. https://supabase.com → **Sign in** (Google/GitHub bilan) → **New project**.
2. Nom: `asia-way`, kuchli **Database password** kiriting (saqlab qo'ying), region: **Central EU (Frankfurt)** (yaqin).
3. "Create new project" → ~1-2 daqiqa kutiladi.

## 2. Kalitlarni oling
Loyiha ochilgach: **Project Settings → API** bo'limida:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ MAXFIY — hech kimga bermang, faqat serverda)

## 3. `.env.local` ga yozing
`E:\IT loihalar\ASIA WAY\makon\.env.local` faylini oching va shu 3 qatorni yangi qiymatlar bilan almashtiring:
```
NEXT_PUBLIC_SUPABASE_URL=https://SIZNING-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key)
```
> service_role kalitni CHATGA yozmang — faylga o'zingiz qo'ying (u maxfiy).

## 4. Baza jadvallarini yarating (SQL)
Supabase → **SQL Editor** → **New query** → quyidagi 2 faylni **navbatma-navbat** nusxalab "Run":
1. `makon/supabase/migrations/20260707000000_init.sql`  (apartments, apartment_images, bookings)
2. `makon/supabase/migrations/20260708000000_leads.sql`  (leads — aloqa formasi)

## 5. Apartamentlarni bazaga yuklang (ixtiyoriy, lekin tavsiya)
`asia-way-data-seed.md` dagi `insert into apartments (...)` SQL bloklarini SQL Editor'da Run qiling.
> Yuklamasangiz ham sayt ishlaydi — apartamentlar `seed-data.ts` dan ko'rsatiladi. Lekin bron/leads
> saqlanishi va dashboard uchun baza to'ldirilgani yaxshi.

## 6. Admin foydalanuvchi (dashboard uchun)
Supabase → **Authentication → Users → Add user** → email+parol qo'shing.
`.env.local` dagi `ADMIN_EMAILS` ga shu email'ni yozing.

## 7. Serverni qayta ishga tushiring
```
cd "E:\IT loihalar\ASIA WAY\makon"
npm run dev
```
Endi bron va aloqa formasi yangi Supabase'ga yoziladi.
