import { cookies } from "next/headers";

/** Lead/bron yaratilayotganda cookie'lardan o'qiladigan marketing-attribution. */
export interface Attribution {
  source: string;
  utm_data: Record<string, string> | null;
}

/**
 * `aw_utm` (UtmCapture yozadi) + Meta `_fbp`/`_fbc` cookie'laridan attribution yig'adi.
 * utm_source bo'lsa source o'sha, aks holda "sayt".
 */
export async function getAttribution(): Promise<Attribution> {
  try {
    const store = await cookies();
    let utm: Record<string, string> = {};
    const raw = store.get("aw_utm")?.value;
    if (raw) {
      try { utm = JSON.parse(raw); } catch { /* buzuq cookie */ }
    }
    const utm_data: Record<string, string> = { ...utm };
    const fbp = store.get("_fbp")?.value;
    const fbc = store.get("_fbc")?.value;
    if (fbp) utm_data.fbp = fbp;
    if (fbc) utm_data.fbc = fbc;

    const source = (utm.utm_source || "sayt").toLowerCase().slice(0, 64);
    return { source, utm_data: Object.keys(utm_data).length > 0 ? utm_data : null };
  } catch {
    return { source: "sayt", utm_data: null };
  }
}

/**
 * DB'da attribution ustunlari hali yo'q bo'lsa (migratsiya RUN qilinmagan),
 * insert xatosini aniqlaydi — chaqiruvchi ustunlarsiz qayta uring.
 */
export function isMissingAttributionColumn(message?: string | null): boolean {
  if (!message) return false;
  return /column/i.test(message) && /(source|utm_data|notes|capi_sent_at)/i.test(message);
}
