// Telegram bot yordamchilari — 3 rol (shef / menejer / cleaning) uchun xabar yuborish.
// Xatolar YUTILADI: telegram ishlamasa ham asosiy oqim (bron/lead) buzilmasligi shart.
// Service-role klient ishlatiladi, chunki saytdan kelgan anonim so'rovlarda ham
// bot_subscribers jadvalini o'qish kerak (RLS faqat authenticated ga ruxsat beradi).

import { createClient } from "@supabase/supabase-js";

export type BotRole = "shef" | "menejer" | "cleaning";

export interface InlineButton {
  text: string;
  callback_data: string;
}

/**
 * HTML escape — parse_mode:"HTML" bilan yuborilgan xabarda MAJBURIY.
 * Mijoz ismi/xabari ichidagi `<`, `>`, `&` Telegram'ni xabarni RAD ETISHGA majbur qiladi
 * ("can't parse entities") va bildirishnoma JIM yo'qoladi.
 * Dinamik (foydalanuvchi kiritgan) har bir qiymat shu funksiyadan o'tishi shart.
 */
export function esc(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function botToken(role: BotRole): string | undefined {
  // Muqobil nomlar ham qabul qilinadi (Vercel'da MANAGER/FARROSH deb qo'yilgan)
  const map: Record<BotRole, string | undefined> = {
    shef: process.env.TELEGRAM_BOT_SHEF_TOKEN,
    menejer:
      process.env.TELEGRAM_BOT_MENEJER_TOKEN ||
      process.env.TELEGRAM_BOT_MANAGER_TOKEN,
    cleaning:
      process.env.TELEGRAM_BOT_CLEANING_TOKEN ||
      process.env.TELEGRAM_BOT_FARROSH_TOKEN,
  };
  // Alohida bot sozlanmagan bo'lsa shef botiga tushadi (bitta bot rejimi)
  return map[role] || process.env.TELEGRAM_BOT_SHEF_TOKEN;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function sendToChat(
  token: string,
  chatId: number | string,
  text: string,
  buttons?: InlineButton[][]
): Promise<{ ok: boolean; description?: string }> {
  const post = (payload: Record<string, unknown>) =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, ...payload }),
    }).then((r) => r.json());

  const markup = buttons ? { reply_markup: { inline_keyboard: buttons } } : {};

  try {
    const data = await post({ text, parse_mode: "HTML", ...markup });
    if (data.ok) return { ok: true };

    // FALLBACK: mijoz ismi/xabari ichidagi `<`, `>`, `&` HTML'ni buzsa Telegram rad etadi
    // ("can't parse entities") va bildirishnoma JIM yo'qolardi. Endi teglarni olib
    // tashlab, oddiy matn sifatida QAYTA yuboramiz — xabar hech qachon yo'qolmaydi.
    const desc: string = data.description || "";
    if (/can't parse entities|unsupported start tag|unclosed|entities/i.test(desc)) {
      const plain = text.replace(/<[^>]*>/g, ""); // <b> va h.k. teglarni olib tashlaymiz
      const retry = await post({ text: plain, ...markup });
      if (retry.ok) {
        console.warn("telegram: HTML rad etildi, oddiy matn bilan yuborildi:", desc);
        return { ok: true, description: `HTML rad etildi (oddiy matn yuborildi): ${desc}` };
      }
      return { ok: false, description: retry.description || desc };
    }

    console.error("telegram sendMessage rad etdi:", desc);
    return { ok: false, description: desc || "noma'lum Telegram xatosi" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("telegram sendToChat:", e);
    return { ok: false, description: msg };
  }
}

export interface NotifyResult {
  sent: number;
  role: BotRole;
  reason?: string; // nima uchun yuborilmadi (diagnostika)
}

export type PayloadGenerator = (lang: string) => { text: string; buttons?: InlineButton[][] };

/**
 * Rolga obuna bo'lgan BARCHA chatlarga xabar yuboradi.
 * Natijani qaytaradi — nima uchun yuborilmagani ko'rinsin (jim qolmasin).
 */
export async function notifyRole(
  role: BotRole,
  payload: string | PayloadGenerator,
  buttons?: InlineButton[][]
): Promise<NotifyResult> {
  try {
    const token = botToken(role);
    if (!token) return { sent: 0, role, reason: `${role} uchun bot tokeni yo'q (Vercel env)` };

    const supabase = serviceClient();
    if (!supabase) return { sent: 0, role, reason: "Supabase service kaliti yo'q" };

    const { data: subs, error } = await supabase
      .from("bot_subscribers")
      .select("chat_id, lang")
      .eq("role", role);

    if (error) return { sent: 0, role, reason: `bot_subscribers xatosi: ${error.message}` };
    if (!subs || subs.length === 0) {
      return { sent: 0, role, reason: `"${role}" botiga hech kim ulanmagan (parol yozilmagan)` };
    }

    // Telegram javobini HAQIQATAN tekshiramiz (avval xato jim yutilardi)
    const results = await Promise.all(
      subs.map((s) => {
        const lang = s.lang || "uz";
        let finalContent: { text: string; buttons?: InlineButton[][] };
        
        if (typeof payload === "function") {
          finalContent = payload(lang);
        } else {
          finalContent = { text: payload, buttons };
        }
        
        return sendToChat(token, s.chat_id, finalContent.text, finalContent.buttons);
      })
    );
    const okCount = results.filter((r) => r.ok).length;
    const firstErr = results.find((r) => !r.ok)?.description;

    if (okCount === 0) {
      return { sent: 0, role, reason: `Telegram rad etdi: ${firstErr || "noma'lum"}` };
    }
    return { sent: okCount, role, ...(firstErr ? { reason: `qisman xato: ${firstErr}` } : {}) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("telegram notifyRole:", e);
    return { sent: 0, role, reason: msg };
  }
}

export function fmtMoney(n: number | null | undefined): string {
  return `$${Number(n || 0).toLocaleString("en-US")}`;
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return "-";
  return String(d).split("T")[0];
}
