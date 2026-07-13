# ASIA WAY — PMS IDEAL HOLATGA KELTIRISH REJASI

> Bu fayl Claude/Antigravity/Codex uchun YAGONA reja va holat manbai.
> Har faza tugaganda `[x]` belgilanadi va "HOLAT IZOHI" yangilanadi.
> Boshlashdan oldin: `HANDOFF.md` ni ham o'qing. Ish tugagach: commit + push (Vercel avtodeploy).

**Yangilangan:** 2026-07-13

---

## AUDIT XULOSASI (2026-07-13, Claude chuqur tekshiruvi)

Loyihada allaqachon BOR va ishlaydi:
- Client sayt: 3D showcase (NestOneShowcase, Luxury3DVisualizer), katalog + filtrlar, i18n (uz/ru/en), xizmatlar, ContactForm → leads.
- Booking: BookingDialog (kalendar, band kunlar bloklanadi — `getBookedDates`, overlap tekshiruv `createBooking`).
- Dashboard: KPI sahifa, KanbanBoard, apartments CRUD, bookings (manual booking, status/deposit), CRM (leads), finance (expenses), staff (xodim+vazifa), clients, InvoiceModal (pdfmake).
- RBAC: profiles jadvali (shef/menejer/cleaning), middleware himoya (finance/staff faqat shef).
- Telegram: webhook (parol bilan ro'yxatga olish → bot_subscribers), monthly report route, check-expiring cron route.
- Migratsiyalar: supabase/migrations/*.sql (5 ta), schema-all.sql.

ANIQLANGAN MUAMMOLAR (fazalarga bo'lingan):

## FAZA 1 — KRITIK BUGLAR ✅ TUGADI (2026-07-13)
- [x] **Farrosh 404**: `src/app/dashboard/tasks/` yaratildi (page + TaskCard + actions): tozalash vazifalari ro'yxati, [Boshladim] va [Tozalandi] tugmalari (task→done, apartment kanban_status→available). Mobil-birinchi. Login redirect tekshirildi.
- [x] **cron/check-expiring**: `booking_status` va `monthly_lease_cost` ga tuzatildi.
- [x] **vercel.json** yaratildi: check-expiring 09:00 UTC, daily-report 16:00 UTC (21:00 Toshkent).
- [x] BONUS: admin layout navigatsiyasi rolga qarab — Moliya/Xodimlar faqat shefga ko'rinadi.
- [x] BONUS: staff sahifasida tozalash vazifasi "done" qilinsa xona avtomatik "available".

## FAZA 2 — TELEGRAM AVTOMATIZATSIYA ✅ TUGADI (2026-07-13)
- [x] `src/lib/telegram.ts`: notifyRole(role, text, buttons) — service-role client bilan (anonim sayt so'rovlarida ham ishlaydi). Env: `TELEGRAM_BOT_SHEF_TOKEN`, `TELEGRAM_BOT_MENEJER_TOKEN`, `TELEGRAM_BOT_CLEANING_TOKEN` (alohida sozlanmagan bo'lsa shef tokeniga tushadi).
- [x] Yangi bron (`createBooking`) → menejer botga xabar (mehmon, xona, sanalar, summa, to'lov holati).
- [x] Yangi lead (`createLead`) → menejer botga xabar + [✅ Bog'lanildi] [📵 Javob bermadi] [❌ Bekor qilish] tugmalari (`lead:<id>:contacted|waiting|lost`).
- [x] Webhook (`/api/telegram/webhook`) callback_query: lead status update, task done (+xona available), answerCallbackQuery, xabar matni yangilanadi.
- [x] Checkout (completed) → `onBookingCompleted` (clients-sync.ts): xona "dirty", farrosh botga xabar + [✅ Tozalandi] tugmasi (`task:<id>:done`).
- [x] `/api/cron/daily-report`: kunlik hisobot shef botga (yangi bronlar, summa, zaklatlar, bandlik %, leadlar).
- ⚠️ ISHGA TUSHIRISH (qo'lda, Vercel'da env bo'lgach): har bot uchun webhook o'rnatish:
  `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://asiaway.vercel.app/api/telegram/webhook?token=<TOKEN>`
  Parollar: shef `start_shef_asiaway`, menejer `start_menejer_asiaway`, farrosh `start_cleaning_asiaway`.

## FAZA 3 — BOOKING FLOW / TO'LOV ✅ TUGADI (2026-07-13)
- [x] BookingDialog i18n ALLAQACHON bor ekan (B_MX dict, useLang) — HANDOFF eskirgan edi.
- [x] Pointer-events lock ham hal qilingan ekan (modal almashishda 50ms setTimeout).
- [x] Migratsiya `20260713000000_payments.sql`: bookings'ga payment_provider/transaction_id/state/... ustunlar. ⚠️ SUPABASE SQL EDITORDA ISHGA TUSHIRISH KERAK!
- [x] `src/lib/payments.ts`: buildPaymeUrl (base64 checkout), buildClickUrl, usdToTiyin (`PAYMENT_USD_RATE`, default 12500).
- [x] `/api/payments/payme`: to'liq JSON-RPC (CheckPerform/Create/Perform/Cancel/CheckTransaction), Basic auth, takroriy so'rovlar idempotent. To'landi → deposit 'paid' + bron 'confirmed' + menejer botga xabar.
- [x] `/api/payments/click`: prepare/complete, md5 sign tekshiruv, summa tekshiruv. 
- [x] `createBooking`: env sozlangan bo'lsa bron 'pending' + paymentUrl qaytaradi; sozlanmagan bo'lsa eski simulyatsiya (darhol confirmed). Eski to'lanmagan pending bronlar (2 soat+) avtomatik bekor bo'ladi.
- [x] BookingDialog: `NEXT_PUBLIC_PAYMENTS_MODE=real` bo'lsa karta-forma o'rniga to'g'ridan checkout'ga redirect.
- ⚠️ REAL TO'LOV YOQISH UCHUN (merchant kabinetlar ochilgach) Vercel env: `PAYME_MERCHANT_ID`, `PAYME_KEY`, `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET_KEY`, `PAYMENT_USD_RATE`, `NEXT_PUBLIC_PAYMENTS_MODE=real`. Payme kabinetida endpoint: `/api/payments/payme`; Click kabinetida Prepare/Complete URL: `/api/payments/click`.

## FAZA 4 — SEO + DETAIL SAHIFA ✅ TUGADI (2026-07-13)
- [x] `app/layout.tsx`: metadataBase, title template, keywords (uz/ru/en), Open Graph, twitter, robots + LodgingBusiness JSON-LD.
- [x] `app/sitemap.ts` (apartamentlar dinamik) + `app/robots.ts` (dashboard/api yopiq).
- [x] `/apartments/[id]`: SSR sahifa — galereya, spec, tavsif, qulayliklar, i18n (uz/ru/en), BookingDialog CTA, generateMetadata + Accommodation JSON-LD. Brauzerda tekshirildi.
- ⚠️ Vercel env'ga `NEXT_PUBLIC_SITE_URL=https://asiaway.vercel.app` qo'shing (yo'q bo'lsa fallback ishlaydi, lekin aniq bo'lgani yaxshi).

## FAZA 5 — INVOICE + ERP ✅ TUGADI (2026-07-13)
- [x] InvoiceModal allaqachon qo'shimcha xizmatlar (mini-bar, transfer, +qator) bilan ishlar ekan; mijoz ismi fallback (guest_name) tuzatildi. Chek window.print orqali (PDF sifatida saqlash mumkin).
- [x] `/api/erp/export?type=finance|rooms|bookings&from=..&to=..` — Bearer `ERP_API_KEY` bilan himoyalangan JSON export (SAP/1C ulanish nuqtasi).

## FAZA 6 — BUILD + DEPLOY + HANDOFF ✅ TUGADI (2026-07-13)
- [x] `npm run build` xatosiz (barcha yangi routelar chiqdi).
- [x] Smoke-test (dev server, brauzer): bosh sahifa, sitemap.xml (9 apartament), /apartments/[id] (galereya+CTA), BookingDialog ochilishi, /dashboard/tasks → login redirect. Konsolda xato yo'q.
- [x] Commit + push → Vercel avtodeploy.
- [x] HANDOFF.md + shu fayl yangilandi.

---

## HOLAT IZOHI (har sessiya oxirida yangilanadi)

**2026-07-13 (Claude):** BARCHA 6 FAZA TUGADI. Kod to'liq; qolgani faqat QO'LDA SOZLASH (pastda).

## ⚠️ QO'LDA QILINADIGAN ISHLAR (kod emas, sozlash)
1. **Supabase SQL Editor**da yangi migratsiyani ishga tushirish: `supabase/migrations/20260713000000_payments.sql`.
2. **Vercel env** qo'shish: `CRON_SECRET` (ixtiyoriy random string), `TELEGRAM_BOT_SHEF_TOKEN`, `TELEGRAM_BOT_MENEJER_TOKEN`, `TELEGRAM_BOT_CLEANING_TOKEN` (BotFather'dan), `NEXT_PUBLIC_SITE_URL=https://asiaway.vercel.app`.
3. **Telegram webhooklar**: har bot uchun `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://asiaway.vercel.app/api/telegram/webhook?token=<TOKEN>`.
4. Botlarga kirish: guruh/shaxsiy chatda parol yozish (shef `start_shef_asiaway`, menejer `start_menejer_asiaway`, farrosh `start_cleaning_asiaway`).
5. **To'lovlar** (merchant shartnomalar tayyor bo'lgach): FAZA 3 dagi env'lar + `NEXT_PUBLIC_PAYMENTS_MODE=real`.
6. **ERP** ulanish kerak bo'lsa: `ERP_API_KEY` env qo'yish.
7. Farrosh foydalanuvchisi: Supabase Auth'da user yaratib, `profiles` jadvalida `role='cleaning'` qo'yish (menejer: 'menejer', shef: 'shef').

## ESLATMALAR KEYINGI VOSITA UCHUN
- Loyiha papkasi: `E:\IT loihalar\ASIA WAY\makon` (Next.js 16 App Router). Ildizdagi Vite — eski prototip, TEGMANG.
- `.env.local` kerak (Supabase kalitlari) — HANDOFF.md da ro'yxati.
- Yangi env kalitlar qo'shilsa Vercel'ga ham qo'shish kerak.
- Gotcha'lar HANDOFF.md da (lucide v1.23, hydration, bitta next dev, scripts/ exclude).
- Telegram bot tokenlari env'da bo'lishi kerak; botlar webhook'i: `/api/telegram/webhook?token=<BOT_TOKEN>`.
