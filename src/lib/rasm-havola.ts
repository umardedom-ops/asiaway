/**
 * Bazadagi base64 rasmlarni sahifadan chiqarib, alohida manzilga o'tkazish.
 *
 * Admin paneldan yuklangan rasmlar `apartments.cover_image`,
 * `apartments.images[]` va `apartment_images.url` ga `data:image/...;base64`
 * satri bo'lib tushgan. Apartament sahifasi butun obyektni client
 * komponentga uzatgani uchun shu satrlar HTML ga ikki marta (markup va RSC
 * payload) yozilardi: bitta sahifa 4.4 MB bo'lgan.
 *
 * Endi `data:` satri o'rniga `/api/rasm/<kalit>.jpg` manzili beriladi, rasm
 * baytlari esa shu route orqali alohida va keshlanib keladi.
 */

export function isDataRasm(v: unknown): v is string {
  return typeof v === "string" && v.startsWith("data:image/");
}

const KALIT_RE =
  /^(c|a|i)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:-(\d{1,3}))?\.jpg$/i;

export type RasmKalit =
  | { tur: "cover"; id: string }
  | { tur: "images"; id: string; n: number }
  | { tur: "jadval"; id: string };

export function kalitniOqi(kalit: string): RasmKalit | null {
  const m = KALIT_RE.exec(kalit);
  if (!m) return null;
  const [, t, id, n] = m;
  if (t === "c" && n === undefined) return { tur: "cover", id };
  if (t === "i" && n === undefined) return { tur: "jadval", id };
  if (t === "a" && n !== undefined) return { tur: "images", id, n: Number(n) };
  return null;
}

type RasmQatori = { id: string; url?: unknown };

/**
 * Client komponentga uzatishdan oldin apartament obyektidagi barcha base64
 * rasmlarni manzilga almashtiradi. Asl obyekt o'zgarmaydi.
 */
export function rasmlarniManzilga<T extends object>(apt: T): T {
  const a = apt as {
    id: string;
    cover_image?: unknown;
    images?: unknown;
    apartment_images?: unknown;
  };
  const id = a.id;
  const out = { ...apt } as Record<string, unknown>;

  // Bir xil base64 bir xil manzilga tushishi kerak: getApartmentImages()
  // muqovani ro'yxatda bor-yo'qligini satr tengligi bilan tekshiradi,
  // aks holda bitta rasm galereyada ikki marta chiqadi.
  const manzillar = new Map<string, string>();

  if (Array.isArray(a.apartment_images)) {
    out.apartment_images = (a.apartment_images as RasmQatori[]).map((r) => {
      if (!isDataRasm(r?.url)) return r;
      const url = manzillar.get(r.url) ?? `/api/rasm/i-${r.id}.jpg`;
      manzillar.set(r.url, url);
      return { ...r, url };
    });
  }

  if (Array.isArray(a.images)) {
    out.images = a.images.map((v: unknown, n: number) => {
      if (!isDataRasm(v)) return v;
      const url = manzillar.get(v) ?? `/api/rasm/a-${id}-${n}.jpg`;
      manzillar.set(v, url);
      return url;
    });
  }

  if (isDataRasm(a.cover_image)) {
    out.cover_image = manzillar.get(a.cover_image) ?? `/api/rasm/c-${id}.jpg`;
  }

  return out as unknown as T;
}
