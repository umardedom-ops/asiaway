import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://www.asiaway.uz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * Bosh sahifa uch tilda. `alternates.languages` — hreflang ning
   * sitemapdagi ko'rinishi: Google shu orqali uch versiya bir
   * sahifaning tarjimasi ekanini biladi va dublikat deb hisoblamaydi.
   *
   * Avval sitemapda faqat o'zbekcha manzil bor edi, `/ru` va `/en` esa
   * umuman mavjud emasdi (HTTP 404).
   */
  const tillar = {
    languages: {
      "uz-UZ": SITE_URL,
      "ru-RU": `${SITE_URL}/ru`,
      "en-US": `${SITE_URL}/en`,
      "x-default": SITE_URL,
    },
  };

  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: tillar,
    },
    {
      url: `${SITE_URL}/ru`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: tillar,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: tillar,
    },
  ];

  // Apartament sahifalari
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: apartments } = await supabase
      .from("apartments")
      .select("id, created_at")
      .eq("status", "active");

    for (const apt of apartments || []) {
      entries.push({
        url: `${SITE_URL}/apartments/${apt.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Supabase ishlamasa ham sitemap asosiy sahifa bilan qaytadi
  }

  return entries;
}
