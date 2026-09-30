import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Manzil prefiksi bilan beriladigan tillar. O'zbekcha — asosiy, prefiksiz. */
const TIL_PREFIKSLARI = ["ru", "en"] as const;

const PREFIKS_NAQSHI = new RegExp(`^/(${TIL_PREFIKSLARI.join("|")})(/.*)?$`);

/**
 * Til prefiksi: `/ru`, `/en` va ular ostidagi manzillar.
 *
 * NEGA KERAK: sayt matni uch tilda yozilgan (`src/lib/i18n.ts`), lekin
 * til faqat `asiaway-lang` cookie'sidan olinardi. Botda cookie yo'q,
 * shuning uchun Google, GPTBot, ClaudeBot va PerplexityBot uchun sayt
 * DOIM o'zbekcha edi. `/ru` va `/en` esa HTTP 404 qaytarardi.
 *
 * Natijada ruscha va inglizcha versiyalar indekslash uchun mavjud emas
 * edi — "Nest One apartment rent" yoki ruscha so'rovlarga javob
 * beradigan sahifa yo'q.
 *
 * Bu yerda manzil ichki marshrutga qayta yo'naltiriladi (`/ru/x` -> `/x`)
 * va til `x-asiaway-lang` sarlavhasi bilan uzatiladi. `layout.tsx` shu
 * sarlavhani o'qib, `<html lang>` va LanguageProvider ga beradi.
 *
 * Marshrutlarni nusxalash shart emas: bitta sahifa uch tilda xizmat
 * qiladi, har til o'z manziliga ega bo'ladi.
 */
export async function middleware(request: NextRequest) {
  const mos = request.nextUrl.pathname.match(PREFIKS_NAQSHI);
  if (mos) {
    const til = mos[1];
    const url = request.nextUrl.clone();
    url.pathname = mos[2] || "/";

    const sarlavhalar = new Headers(request.headers);
    sarlavhalar.set("x-asiaway-lang", til);

    // Supabase sessiyasini yangilash bu yerda o'tkazib yuboriladi:
    // til prefiksli manzillar ommaviy marketing sahifalari, ularda
    // foydalanuvchi sessiyasi kerak emas. Dashboard `/dashboard` da
    // va u bu naqshga tushmaydi.
    return NextResponse.rewrite(url, { request: { headers: sarlavhalar } });
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Quyidagi manzillardan boshqa barcha so'rovlarda middleware ishlaydi:
     * - _next/static (statik fayllar)
     * - _next/image (rasmlarni optimallashtirish)
     * - favicon.ico (sayt belgisi)
     * - barcha rasm/fayl kengaytmalari (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
