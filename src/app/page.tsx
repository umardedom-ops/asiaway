import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { APARTMENTS, BRAND } from "@/lib/seed-data";
import HomeContent from "@/components/HomeContent";

export const revalidate = 0;

const SITE = "https://www.asiaway.uz";

/**
 * Til bo'yicha sarlavha, tavsif va hreflang.
 *
 * Til `middleware.ts` yozgan `x-asiaway-lang` sarlavhasidan olinadi
 * (`/ru`, `/en` manzillari). Avval bosh sahifada `generateMetadata`
 * umuman yo'q edi va layoutdagi o'zbekcha metadata hamma til uchun
 * ishlatilardi — ya'ni ruscha sahifa ham o'zbekcha sarlavha bilan
 * indekslanardi.
 *
 * hreflang juftligi uch tomonli: har versiya qolgan ikkisiga ishora
 * qiladi. Bir tomonlama ko'rsatma Google tomonidan e'tiborsiz
 * qoldiriladi.
 */
const META = {
  uz: {
    title: "AsiaWay Apartment — Nest One'da premium ijara | Tashkent City",
    description:
      "Nest One osmono'par binosida kunlik va oylik premium apartament ijarasi. Shaxsiy aeroport transferi, 24/7 xizmat, onlayn bron.",
  },
  ru: {
    title: "AsiaWay Apartment — премиальная аренда в Nest One | Tashkent City",
    description:
      "Посуточная и месячная аренда премиальных апартаментов в небоскрёбе Nest One, Tashkent City. Личный трансфер из аэропорта, сервис 24/7, онлайн-бронирование.",
  },
  en: {
    title: "AsiaWay Apartment — premium rentals in Nest One | Tashkent City",
    description:
      "Daily and monthly premium apartment rentals in the Nest One tower, Tashkent City. Private airport transfer, 24/7 service, online booking.",
  },
} as const;

const MANZIL = { uz: SITE, ru: `${SITE}/ru`, en: `${SITE}/en` } as const;

export async function generateMetadata(): Promise<Metadata> {
  const til = ((await headers()).get("x-asiaway-lang") ?? "uz") as keyof typeof META;
  const m = META[til] ?? META.uz;
  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: MANZIL[til] ?? SITE,
      languages: {
        "uz-UZ": MANZIL.uz,
        "ru-RU": MANZIL.ru,
        "en-US": MANZIL.en,
        "x-default": MANZIL.uz,
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: MANZIL[til] ?? SITE,
      siteName: "AsiaWay",
      locale: til === "ru" ? "ru_RU" : til === "en" ? "en_US" : "uz_UZ",
    },
  };
}


export default async function HomePage() {
  const supabase = await createClient();

  const { data: dbApartments } = await supabase
    .from("apartments")
    .select("*, apartment_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const apartmentsToShow = dbApartments && dbApartments.length > 0 ? dbApartments : APARTMENTS;

  return <HomeContent apartments={apartmentsToShow} phones={BRAND.phones} address={BRAND.address} />;
}
