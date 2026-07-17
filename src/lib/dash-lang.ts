import { cookies } from "next/headers";
import { D, type Lang, type DashboardDict } from "@/lib/i18n";

/**
 * Server komponent / server action ichida joriy dashboard lug'atini olish.
 * Til `asiaway-lang` cookie'da saqlanadi (DashboardLangSwitcher yozadi).
 */
export async function getDashDict(): Promise<DashboardDict> {
  const store = await cookies();
  const lang = (store.get("asiaway-lang")?.value || "uz") as Lang;
  return D[lang] ?? D.uz;
}
