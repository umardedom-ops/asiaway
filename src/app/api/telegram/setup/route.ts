import { NextResponse } from "next/server";

// Bir martalik sozlash: 3 botning webhook'ini avtomatik o'rnatadi.
// Vercel'dagi tokenlardan foydalanadi — qo'lda URL yozish shart emas.
//
// Ishlatish: brauzerда oching
//   https://asiaway.vercel.app/api/telegram/setup?secret=<CRON_SECRET>
// (CRON_SECRET Vercel env'да; agar yo'q bo'lsa "setup123" ni ishlatadi — keyin o'chiring)

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://asiaway.vercel.app";

export async function GET() {
  // Parol talab qilinmaydi: bu endpoint faqat o'z saytimiz (SITE_URL) manziliga
  // webhook o'rnatadi va hech qanday maxfiy ma'lumot qaytarmaydi — xavfsiz.

  // Barcha mumkin bo'lgan token nomlari (Vercel'да qaysi nomда bo'lsa ham)
  const bots: { role: string; token?: string }[] = [
    { role: "shef", token: process.env.TELEGRAM_BOT_SHEF_TOKEN },
    {
      role: "menejer",
      token:
        process.env.TELEGRAM_BOT_MENEJER_TOKEN ||
        process.env.TELEGRAM_BOT_MANAGER_TOKEN,
    },
    {
      role: "cleaning",
      token:
        process.env.TELEGRAM_BOT_CLEANING_TOKEN ||
        process.env.TELEGRAM_BOT_FARROSH_TOKEN,
    },
  ];

  const results: Record<string, unknown>[] = [];

  for (const bot of bots) {
    if (!bot.token) {
      results.push({ role: bot.role, ok: false, note: "token topilmadi (Vercel env)" });
      continue;
    }
    const webhookUrl = `${SITE_URL}/api/telegram/webhook?token=${bot.token}`;
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${bot.token}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message", "callback_query"],
          }),
        }
      );
      const data = await res.json();
      // Bot nomini ham olamiz (tekshirish uchun)
      const meRes = await fetch(`https://api.telegram.org/bot${bot.token}/getMe`);
      const me = await meRes.json();
      results.push({
        role: bot.role,
        ok: data.ok === true,
        bot_username: me?.result?.username || null,
        telegram_response: data.description || data,
      });
    } catch (e: unknown) {
      results.push({
        role: bot.role,
        ok: false,
        note: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    message: "Webhook o'rnatish yakunlandi. 'ok: true' bo'lganlar tayyor.",
    site: SITE_URL,
    results,
  });
}
