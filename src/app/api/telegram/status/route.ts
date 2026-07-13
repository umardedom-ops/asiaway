import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Diagnostika: qaysi rollar botga ulangan (bot_subscribers) va env holati.
// Maxfiy ma'lumot chiqarmaydi — faqat sonlar va bor/yo'q.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    SUPABASE_SERVICE_ROLE_KEY: Boolean(key),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
    TELEGRAM_BOT_SHEF_TOKEN: Boolean(process.env.TELEGRAM_BOT_SHEF_TOKEN),
    TELEGRAM_BOT_MENEJER_or_MANAGER: Boolean(
      process.env.TELEGRAM_BOT_MENEJER_TOKEN || process.env.TELEGRAM_BOT_MANAGER_TOKEN
    ),
    TELEGRAM_BOT_CLEANING_or_FARROSH: Boolean(
      process.env.TELEGRAM_BOT_CLEANING_TOKEN || process.env.TELEGRAM_BOT_FARROSH_TOKEN
    ),
  };

  if (!url || !key) {
    return NextResponse.json({ env, error: "Supabase service kaliti yo'q" });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("bot_subscribers")
    .select("role, chat_id");

  if (error) {
    return NextResponse.json({
      env,
      error: `bot_subscribers o'qishda xato: ${error.message}`,
      hint: "Migratsiya 20260712000001_telegram_webhooks.sql RUN qilinganmi?",
    });
  }

  const counts: Record<string, number> = {};
  for (const s of data || []) counts[s.role] = (counts[s.role] || 0) + 1;

  return NextResponse.json({
    env,
    subscribers_total: data?.length || 0,
    by_role: {
      shef: counts.shef || 0,
      menejer: counts.menejer || 0,
      cleaning: counts.cleaning || 0,
    },
    hint:
      (counts.menejer || 0) === 0
        ? "Menejer roli ulanmagan! @asiawaymenejerdostupbot ga 'start_menejer_asiaway' yozing."
        : "Menejer ulangan — lead xabari kelishi kerak.",
  });
}
