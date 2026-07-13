import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApartmentDetail from "./ApartmentDetail";

export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://asiaway.vercel.app";

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
      images: apt.cover_image ? [{ url: apt.cover_image }] : undefined,
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
    image: apt.cover_image || undefined,
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
