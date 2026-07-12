import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Webhook for all 3 bots. You can set the same webhook URL for all bots if you append an identifier,
// or use one bot for all. The user prompt implied distinct bots, but they might all hit this endpoint.
// For security, we just match passwords.

const PASSWORDS = {
  shef: 'start_shef_asiaway',
  menejer: 'start_menejer_asiaway',
  cleaning: 'start_cleaning_asiaway'
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Telegram sends updates. If there's no message, ignore.
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();

    // Match password
    let role: 'shef' | 'menejer' | 'cleaning' | null = null;
    
    if (text === PASSWORDS.shef) role = 'shef';
    else if (text === PASSWORDS.menejer) role = 'menejer';
    else if (text === PASSWORDS.cleaning) role = 'cleaning';

    if (role) {
      // Connect to Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Upsert into bot_subscribers
      const { error } = await supabase
        .from('bot_subscribers')
        .upsert({
          chat_id: chatId,
          role: role,
          joined_at: new Date().toISOString()
        }, { onConflict: 'chat_id' });

      if (error) throw error;

      // Send success message back to the user
      // Assuming we can just reply using one of the bot tokens. 
      // We should ideally know WHICH bot received the webhook, but Telegram doesn't include the bot token in the payload.
      // Usually, webhooks are set like `/api/telegram/webhook?bot=shef`, but let's just use the SHEF bot to reply as a default, 
      // or we just don't reply immediately and let them know via UI.
      // Actually, we can fetch the bot token from query params: /api/telegram/webhook?token=YOUR_BOT_TOKEN
      const url = new URL(req.url);
      const token = url.searchParams.get('token') || process.env.TELEGRAM_BOT_SHEF_TOKEN;

      const replyMessage = `✅ Tabriklaymiz! Siz tizimga "${role.toUpperCase()}" ro'lida muvaffaqiyatli ulandingiz. Endi xabarlar sizga keladi.`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyMessage
        })
      });

      return NextResponse.json({ status: 'success', role });
    }

    // Ignore other messages without replying (to prevent spam/discovery)
    return NextResponse.json({ status: 'ignored_unauthorized' });

  } catch (error: any) {
    console.error("Webhook xatosi:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
