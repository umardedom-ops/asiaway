import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApartmentDetail from "./ApartmentDetail";

export const revalidate = 0;

/**
 * Kanonik manzil.
 *
 * Avval zaxira qiymat "https://asiaway.vercel.app" edi. Prodda
 * NEXT_PUBLIC_SITE_URL qo'yilmagani uchun aynan shu ishlatilardi va
 * Accommodation sxemasi Google va AI tizimlariga sahifaning asosiy
 * manzili sifatida VAQTINCHALIK domenni ko'rsatardi (bitta sahifada
 * 4 marta uchraydi). Ustiga-ustak asiaway.vercel.app ochiq
 * (HTTP 200), ya'ni bir biznes ikki hostda indekslanishi mumkin.
 *
 * Endi zaxira qiymat - haqiqiy kanonik host. Muhit o'zgaruvchisi
 * bo'lsa u ustun, lekin u yo'q bo'lganda ham TO'G'RI domen chiqadi.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.asiaway.uz";

/**
 * Sxemaga faqat HAQIQIY rasm manzili tushadi.
 *
 * `apt.cover_image` bazada base64 `data:` satri bo'lishi mumkin. U
 * JSON-LD ichiga qo'yilganda bitta apartament sahifasi 5.34 MB ga
 * yetgan (JSON-LD blokining o'zi 196 KB). schema.org `image` maydoni
 * URL kutadi - `data:` satrini tahlilchilar o'qiy olmaydi, foyda nol,
 * zarari esa katta: shu hajmdagi sahifani ba'zi botlar kesib tashlaydi
 * yoki umuman yuklab olmaydi.
 */
function rasmManzili(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : undefined;
}

async function fetchApartment(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("apartments")
    .select("*, apartment_images(*)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const apt = await fetchApartment(id);
  if (!apt) return { title: "Apartament topilmadi" };

  const title = `${apt.title} — $${apt.price_per_day}/kun`;
  const description = (apt.description || "").slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/apartments/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/apartments/${id}`,
      images: rasmManzili(apt.cover_image)
        ? [{ url: rasmManzili(apt.cover_image)! }]
        : undefined,
      type: "website",
    },
  };
}

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apt = await fetchApartment(id);
  if (!apt || apt.status !== "active") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: apt.title,
    description: apt.description,
    url: `${SITE_URL}/apartments/${apt.id}`,
    image: rasmManzili(apt.cover_image),
    floorLevel: String(apt.floor || ""),
    numberOfRooms: apt.rooms || undefined,
    occupancy: apt.max_guests
      ? { "@type": "QuantitativeValue", maxValue: apt.max_guests }
      : undefined,
    floorSize: apt.area_m2
      ? { "@type": "QuantitativeValue", value: apt.area_m2, unitCode: "MTK" }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Nest One, Tashkent City",
      addressLocality: "Tashkent",
      addressCountry: "UZ",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ApartmentDetail apartment={apt} />
    </>
  );
}
