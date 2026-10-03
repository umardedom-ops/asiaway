import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isDataRasm, kalitniOqi } from "@/lib/rasm-havola";

/**
 * Bazada base64 bo'lib saqlangan apartament rasmini oddiy rasm qilib beradi.
 *
 *   /api/rasm/c-<apartment_id>.jpg        — apartments.cover_image
 *   /api/rasm/a-<apartment_id>-<n>.jpg    — apartments.images[n]
 *   /api/rasm/i-<apartment_images.id>.jpg — apartment_images.url
 *
 * Manzil `.jpg` bilan tugaydi — middleware matcheri rasm kengaytmalarini
 * o'tkazib yuboradi, sessiya tekshiruvi har rasmda ishlamaydi. Haqiqiy
 * turi (png/webp) Content-Type da beriladi.
 *
 * Qarang: src/lib/rasm-havola.ts
 */

const DATA_RE = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i;

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

async function qiymatniOl(kalit: string): Promise<string | null> {
  const k = kalitniOqi(kalit);
  if (!k) return null;
  const sb = anonClient();

  if (k.tur === "jadval") {
    const { data } = await sb
      .from("apartment_images")
      .select("url")
      .eq("id", k.id)
      .maybeSingle();
    return data?.url ?? null;
  }

  const { data } = await sb
    .from("apartments")
    .select(k.tur === "cover" ? "cover_image" : "images")
    .eq("id", k.id)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as { cover_image?: string; images?: unknown[] };
  if (k.tur === "cover") return row.cover_image ?? null;
  const v = Array.isArray(row.images) ? row.images[k.n] : null;
  return typeof v === "string" ? v : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kalit: string }> }
) {
  const { kalit } = await params;
  const qiymat = await qiymatniOl(kalit);

  if (!qiymat) return new NextResponse("Not found", { status: 404 });

  // Rasm keyinroq Storage'ga ko'chirilgan bo'lsa — eski manzil ham ishlaydi.
  if (/^https?:\/\//i.test(qiymat)) return NextResponse.redirect(qiymat, 308);

  const m = isDataRasm(qiymat) ? DATA_RE.exec(qiymat) : null;
  if (!m) return new NextResponse("Not found", { status: 404 });

  const baytlar = Buffer.from(m[2], "base64");
  return new NextResponse(baytlar, {
    headers: {
      "Content-Type": m[1],
      "Content-Length": String(baytlar.length),
      // Admin rasmni almashtirsa, bir kun ichida yangilanadi.
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
