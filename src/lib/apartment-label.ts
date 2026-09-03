// Barcha formalarda (Kassa, Kirim, Chiqim, Joylashtirish, Bronlar, Xodimlar)
// apartament nomlarini aniq, qisqa va qulay ko'rsatish uchun yordamchi funksiyalar.

export interface ApartmentLike {
  id?: string;
  title?: string;
  title_ru?: string;
  floor?: number | null;
  status?: string;
  [key: string]: any;
}

/**
 * Apartament nomidan qisqa va tushunarli sarlavha yasaydi:
 * Masalan:
 * "10-qavatdagi apartament (184)..." -> "№ 184 (10-qavat) — Toshkent City Park"
 * "29-qavatdagi apartament..." -> "29-qavat — Toshkent City Park"
 */
export function getCleanApartmentLabel(apt?: ApartmentLike | null, lang: string = "uz"): string {
  if (!apt) return "—";
  const rawTitle = apt.title || "";
  if (!rawTitle) return "—";

  let title = rawTitle;
  // Agar [RU]: belgisi bo'lsa, tilga qarab ajratamiz
  if (rawTitle.includes("[RU]:")) {
    const parts = rawTitle.split("[RU]:");
    title = (lang === "ru" ? (apt.title_ru || parts[1]) : parts[0]).trim();
  } else if (lang === "ru" && apt.title_ru) {
    title = apt.title_ru;
  }

  // Qavs ichidagi xona raqamini aniqlash: (184), (188), (183), (253)
  const numMatch = rawTitle.match(/\((\d{2,4})\)/);
  const aptNum = numMatch ? numMatch[1] : null;

  const floor = apt.floor ?? null;
  const floorStr = floor != null ? (lang === "ru" ? `${floor} этаж` : `${floor}-qavat`) : "";

  // Manzara yoki xususiyatni qisqartirib olish
  const lower = title.toLowerCase();
  let view = "";
  if (lower.includes("magic city") && (lower.includes("humo arena") || lower.includes("хумо"))) {
    view = "Magic City & Humo Arena";
  } else if (lower.includes("magic city")) {
    view = "Magic City";
  } else if (lower.includes("toshkent city park") || lower.includes("ташкент сити") || lower.includes("city park")) {
    view = lang === "ru" ? "Tashkent City Park" : "Toshkent City Park";
  } else if (lower.includes("humo arena") || lower.includes("хумо")) {
    view = "Humo Arena";
  } else if (lower.includes("penthouse") || lower.includes("пентхаус")) {
    view = "Premium Penthouse";
  } else if (lower.includes("shahar") || lower.includes("город")) {
    view = lang === "ru" ? "Вид на город" : "Shahar manzarasi";
  } else if (lower.includes("bog") || lower.includes("сад")) {
    view = lang === "ru" ? "С выходом в сад" : "Bog‘ga chiqish";
  }

  if (aptNum) {
    const prefix = `№ ${aptNum}${floorStr ? ` (${floorStr})` : ""}`;
    return view ? `${prefix} — ${view}` : prefix;
  }

  if (floorStr) {
    return view ? `${floorStr} — ${view}` : floorStr;
  }

  return title;
}

/**
 * Kvartiralarni qavat bo'yicha yuqoridan pastga (34 -> 2) va
 * bir xil qavatda bo'lsa xona raqami bo'yicha mantiqiy tartiblaydi.
 */
export function sortApartments<T extends ApartmentLike>(apts: T[]): T[] {
  return [...apts].sort((a, b) => {
    const fA = Number(a.floor ?? 0);
    const fB = Number(b.floor ?? 0);
    if (fB !== fA) return fB - fA;

    // Bir xil qavat bo'lsa xona raqami bo'yicha (183, 184, 188)
    const numA = (a.title || "").match(/\((\d{2,4})\)/)?.[1] || 0;
    const numB = (b.title || "").match(/\((\d{2,4})\)/)?.[1] || 0;
    if (numA && numB) return Number(numA) - Number(numB);

    return (a.title || "").localeCompare(b.title || "");
  });
}
