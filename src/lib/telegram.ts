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
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("telegram sendMessage rad etdi:", data.description);
      return { ok: false, description: data.description || "noma'lum Telegram xatosi" };
    }
    return { ok: true };
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

/**
 * Rolga obuna bo'lgan BARCHA chatlarga xabar yuboradi.
 * Natijani qaytaradi — nima uchun yuborilmagani ko'rinsin (jim qolmasin).
 */
export async function notifyRole(
  role: BotRole,
  text: string,
  buttons?: InlineButton[][]
): Promise<NotifyResult> {
  try {
    const token = botToken(role);
    if (!token) return { sent: 0, role, reason: `${role} uchun bot tokeni yo'q (Vercel env)` };

    const supabase = serviceClient();
    if (!supabase) return { sent: 0, role, reason: "Supabase service kaliti yo'q" };

    const { data: subs, error } = await supabase
      .from("bot_subscribers")
      .select("chat_id")
      .eq("role", role);

    if (error) return { sent: 0, role, reason: `bot_subscribers xatosi: ${error.message}` };
    if (!subs || subs.length === 0) {
      return { sent: 0, role, reason: `"${role}" botiga hech kim ulanmagan (parol yozilmagan)` };
    }

    // Telegram javobini HAQIQATAN tekshiramiz (avval xato jim yutilardi)
    const results = await Promise.all(
      subs.map((s) => sendToChat(token, s.chat_id, text, buttons))
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
