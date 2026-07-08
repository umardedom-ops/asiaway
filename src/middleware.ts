import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
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
