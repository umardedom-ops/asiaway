# ASIA WAY — HANDOFF (Claude / Antigravity / Codex uchun umumiy kontekst)

> Har qanday AI vosita ishni davom ettirishdan OLDIN shu faylni o'qisin.

## ✅ JORIY HOLAT (2026-07-08)
- **Jonli sayt:** https://asiaway.vercel.app (Vercel, Production, `Ready`).
- **Repo:** https://github.com/umardedom-ops/asiaway (branch `main`). **Har `git push` → Vercel avtomatik deploy.**
- **Baza:** Supabase (`hiofixthnnowewdqynxb`) — jadvallar (apartments, apartment_images, bookings, leads) yaratilib seed qilingan.
- **Rasmlar:** Supabase Storage (public bucket `assets`), hammasi webp (siqilgan). Bazaviy manzil: `src/lib/assets.ts` (`ASSETS`).
- **Production build** xatosiz o'tadi.

## 🗂️ Arxitektura
- **Framework:** Next.js 16 (App Router) + React 19 + TS + Tailwind v4 + shadcn/ui + Supabase (`@supabase/ssr`).
- `app/page.tsx` — yupqa server wrapper (Supabase'dan apartamentlar) → `components/HomeContent.tsx` (butun UI, client).
- **i18n (UZ/RU/EN):** `lib/i18n.ts` (dict + `APARTMENT_TR` + `CONTACTS`), `components/LanguageProvider.tsx`, `LanguageSwitcher.tsx`. localStorage: `asiaway-lang`.
- **Bo'limlar:** IntroSplash → Hero(logo markazda) → NestOneShowcase(scroll-3D) → About → Services → ApartmentCatalog → Experience(SkylineBackdrop vektor skyline) → Testimonials → FAQ → Contact(ContactForm) → Footer + FloatingContact.
- **Server actions:** `app/actions/booking.ts` (bron), `app/actions/lead.ts` (aloqa formasi → `leads`).
- **Dizayn tokenlari (champagne):** fon `#0B0D0F`, panel `#111417`, accent `#C5A46D`(hover `#D4B77F`), matn `#F5F2EB`/`#A8A49B`. Shrift: Cormorant Garamond (heading) + Manrope (sans).
- **Tugmalar:** umumiy champagne stillar `lib/ui.ts` (`btnPrimary`/`btnSecondary`/`btnGlass` + `btnLg`/`btnMd`) — izchil radius (8px), hover va ko'rinadigan fokus halqasi. Yangi tugmada shulardan foydalan (inline class emas).

## 🔑 Muhit (env) — `.env.local` (repo'ga PUSH QILINMAYDI)
Vercel'da ham shu 4 ta: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`. Lokalda ishlash uchun `.env.local` bo'lishi shart.

## 🛠️ Ishga tushirish
```
cd makon && npm install && npm run dev   # localhost:3000
npm run build                            # deploy'dan oldin tekshirish
```

## 📋 QOLGAN VAZIFALAR
1. Testimonials matnlari NAMUNA (`lib/i18n.ts → reviews.items`) — haqiqiy sharhlar bilan almashtiring.
2. `CONTACTS.instagram` (`lib/i18n.ts`) TAXMINIY — egasidan aniq username so'rang.
3. BookingDialog i18n ulanmagan (faqat o'zbekcha) — `useLang()` ga o'tkazing.
4. Dashboard'ga `leads` ro'yxati sahifasini qo'shing (`app/dashboard/(admin)/`).
5. SEO: har til uchun metadata, Open Graph, sitemap.xml, schema.org LodgingBusiness.
6. Rasmsiz apartament (10-qavat Park View Duo, id 10650000) vaqtincha boshqa 10-qavat suratini ishlatyapti — haqiqiy surat kelsa almashtiring (Supabase Storage `assets/apartments/`ga yuklab, DB `cover_image`ni yangilang).

## ⚠️ GOTCHA'lar (takrorlamang)
- **lucide-react v1.23** ikonka to'plami cheklangan (`Instagram` YO'Q → inline SVG). Import oldidan tekshiring.
- **Hydration mismatch:** `Math.sin`/`Math.random`/`Intl.NumberFormat(currency)` SSR≠CSR → atributga bermang, yaxlitlang (`SkylineBackdrop` `r3()`); narx plain `$N`.
- **CSS:** `overflow-x-hidden` yolg'iz → `overflow-y:auto` (sticky/useScroll buziladi) → `html`ga qo'yilgan.
- **Manfiy z-index** opaque parent ortida yashiradi → fon `z-0`, kontent `z-10`.
- **`scripts/`** tsconfig `exclude`'da (`.ts` import build type-check'ni buzadi). O'zi `node --experimental-strip-types` bilan ishlaydi.
- **Bir vaqtda faqat BITTA `next dev`** (ikkitasi `.next` konflikt).

## 🔁 KO'P VOSITA BILAN ISHLASH (Claude ⇄ Antigravity ⇄ Codex)
Yagona manba — GitHub repo. Har vosita SHU papkada (`makon`) ishlaydi.
- **Boshlashdan oldin:** `git pull` (eng yangi kod).
- **Tugagach DOIM:** `git add -A && git commit -m "..." && git push` → Vercel avtomatik deploy.
- **Vosita almashtirishda:** joriy vositaga "commit + push qil" deng → yangi vositaga "asiaway loyihasini davom ettir, HANDOFF.md dan boshlab" deng.
- **Bir faylni bir vaqtda ikki vositada tahrirlamang** (merge konflikt).
- `.env.local` push qilinmaydi — yangi joyda Supabase kalitlarini qayta qo'ying.
