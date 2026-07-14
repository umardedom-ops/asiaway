// Menejer/Shef boti — "Yangi mijoz" shabloni.
// Oqim: [➕ Yangi mijoz] tugma → shablon chiqadi → menejer to'ldirib yuboradi →
// bot xulosa + [📋 CRM ga] [📅 Bronga] tugmalarini ko'rsatadi → bosilsa bazaga tushadi.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;

export const NEW_LEAD_BTN = "➕ Yangi mijoz";

// Doimiy klaviatura (chat pastida turadi)
export const MAIN_KEYBOARD = {
  keyboard: [[{ text: NEW_LEAD_BTN }]],
  resize_keyboard: true,
  is_persistent: true,
};

export const TEMPLATE_TEXT =
  "📝 <b>Shablonni nusxalab, to'ldiring va yuboring:</b>\n\n" +
  "<code>Ism: \n" +
  "Telefon: \n" +
  "Kelish: 2026-07-20\n" +
  "Ketish: 2026-07-25\n" +
  "Xona: 29\n" +
  "Kishi: 2\n" +
  "Izoh: instagram reklamadan</code>\n\n" +
  "ℹ️ <i>Xona — qavat raqami yoki nomi. Ketish sanasi bo'lmasa, faqat CRM'ga tushadi.</i>";

export interface DraftData {
  ism: string;
  telefon: string;
  kelish?: string;
  ketish?: string;
  xona?: string;
  kishi?: string;
  izoh?: string;
}

/** Shablon matnini o'qiydi. "Ism:" bo'lmasa null qaytaradi. */
export function parseTemplate(text: string): DraftData | null {
  if (!/(^|\n)\s*ism\s*:/i.test(text)) return null;

  const get = (key: string) => {
    const re = new RegExp(`(^|\\n)\\s*${key}\\s*:\\s*(.*)`, "i");
    const m = text.match(re);
    return (m?.[2] || "").trim();
  };

  const ism = get("ism");
  if (!ism) return null;

  return {
    ism,
    telefon: get("telefon"),
    kelish: get("kelish") || undefined,
    ketish: get("ketish") || undefined,
    xona: get("xona") || undefined,
    kishi: get("kishi") || undefined,
    izoh: get("izoh") || undefined,
  };
}

/** Sana YYYY-MM-DD ko'rinishidami? */
function isDate(s?: string): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Xona nomi/raqami bo'yicha apartament topadi */
export async function findApartment(supabase: SB, xona?: string) {
  if (!xona) return null;
  const { data } = await supabase
    .from("apartments")
    .select("id, title, price_per_day, deposit_amount")
    .eq("status", "active")
    .ilike("title", `%${xona}%`)
    .limit(1)
    .maybeSingle();
  return data;
}

/** Draft'ni saqlaydi, id qaytaradi (tugma callback_data uchun) */
export async function saveDraft(supabase: SB, chatId: number, data: DraftData) {
  const { data: row, error } = await supabase
    .from("bot_drafts")
    .insert([{ chat_id: chatId, data }])
    .select("id")
    .single();
  if (error) return null;
  return row.id as string;
}

export async function getDraft(supabase: SB, id: string): Promise<DraftData | null> {
  const { data } = await supabase.from("bot_drafts").select("data").eq("id", id).maybeSingle();
  return (data?.data as DraftData) || null;
}

/** Xulosa matni + qaysi tugmalar mumkinligi */
export async function buildSummary(supabase: SB, d: DraftData) {
  const apt = await findApartment(supabase, d.xona);
  const canBook = isDate(d.kelish) && isDate(d.ketish) && !!apt;

  let nights = 0;
  let total = 0;
  if (canBook && isDate(d.kelish) && isDate(d.ketish)) {
    nights = Math.round(
      (new Date(d.ketish).getTime() - new Date(d.kelish).getTime()) / 86400000
    );
    total = nights > 0 ? nights * Number(apt.price_per_day || 0) : 0;
  }

  const lines = [
    "✅ <b>Ma'lumot qabul qilindi</b>\n",
    `👤 <b>Ism:</b> ${d.ism}`,
    `📞 <b>Telefon:</b> ${d.telefon || "—"}`,
    `📅 <b>Kelish:</b> ${d.kelish || "—"}`,
    `📅 <b>Ketish:</b> ${d.ketish || "—"}`,
    `🏠 <b>Xona:</b> ${apt ? apt.title : d.xona ? `${d.xona} (topilmadi ⚠️)` : "—"}`,
    `👥 <b>Kishi:</b> ${d.kishi || "—"}`,
  ];
  if (d.izoh) lines.push(`📝 <b>Izoh:</b> ${d.izoh}`);
  if (canBook && nights > 0) {
    lines.push(`\n💰 <b>Hisob:</b> ${nights} kecha × $${apt.price_per_day} = <b>$${total}</b>`);
  }
  lines.push("\n👇 Qayerga yozamiz?");

  if (!canBook) {
    lines.push(
      "\n<i>⚠️ Bronga tushishi uchun: to'g'ri Kelish/Ketish sanasi (2026-07-20) va mavjud Xona kerak.</i>"
    );
  }

  return { text: lines.join("\n"), canBook, apt, nights, total };
}

/** [CRM ga] bosilganda — leads jadvaliga */
export async function draftToLead(supabase: SB, d: DraftData) {
  const notes = [
    d.kelish ? `Kelish: ${d.kelish}` : null,
    d.ketish ? `Ketish: ${d.ketish}` : null,
    d.xona ? `Xona: ${d.xona}` : null,
    d.kishi ? `Kishi: ${d.kishi}` : null,
  ].filter(Boolean).join(" · ");

  const { error } = await supabase.from("leads").insert([
    {
      name: d.ism,
      phone: d.telefon || "—",
      message: d.izoh || null,
      source: "instagram",
      notes: notes || null,
      status: "new",
    },
  ]);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** [Bronga] bosilganda — bookings jadvaliga (pending) */
export async function draftToBooking(supabase: SB, d: DraftData) {
  const apt = await findApartment(supabase, d.xona);
  if (!apt) return { ok: false, error: "Xona topilmadi" };
  if (!isDate(d.kelish) || !isDate(d.ketish)) return { ok: false, error: "Sanalar noto'g'ri" };

  const nights = Math.round(
    (new Date(d.ketish).getTime() - new Date(d.kelish).getTime()) / 86400000
  );
  if (nights <= 0) return { ok: false, error: "Ketish sanasi kelishdan keyin bo'lsin" };

  // Band emasligini tekshiramiz
  const { data: overlap } = await supabase
    .from("bookings")
    .select("id")
    .eq("apartment_id", apt.id)
    .neq("booking_status", "cancelled")
    .lt("check_in", d.ketish)
    .gt("check_out", d.kelish);
  if (overlap && overlap.length > 0) {
    return { ok: false, error: "Bu sanalarda xona band" };
  }

  const total = nights * Number(apt.price_per_day || 0);

  const { error } = await supabase.from("bookings").insert([
    {
      apartment_id: apt.id,
      guest_name: d.ism,
      guest_phone: d.telefon || "",
      channel: "instagram",
      check_in: d.kelish,
      check_out: d.ketish,
      nights,
      total_price: total,
      deposit_amount: Number(apt.deposit_amount || 0),
      deposit_status: "pending",
      booking_status: "pending", // menejer dashboardda tasdiqlaydi
    },
  ]);
  if (error) return { ok: false, error: error.message };
  return { ok: true, apt, nights, total };
}
