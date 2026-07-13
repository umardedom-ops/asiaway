import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Barcha botlar uchun yagona webhook.
// Har bot uchun webhook shunday o'rnatiladi:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://asiaway.vercel.app/api/telegram/webhook?token=<TOKEN>
// ?token=<TOKEN> — javob qaytarish uchun (Telegram payload'da bot token yo'q).
//
// Vazifalar:
//  1. Parol bilan obuna (bot_subscribers): shef / menejer / cleaning.
//  2. callback_query — inline tugmalar:
//     lead:<id>:<status>  → leads.status yangilanadi (contacted/waiting/lost)
//     task:<id>:done      → tasks.status=done + apartments.kanban_status=available

const PASSWORDS = {
  shef: 'start_shef_asiaway',
  menejer: 'start_menejer_asiaway',
  cleaning: 'start_cleaning_asiaway'
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  contacted: "✅ Bog'lanildi",
  waiting: "📵 Javob bermadi (kutilmoqda)",
  lost: "❌ Bekor qilindi",
};

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function tg(token: string, method: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error(`telegram ${method}:`, e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const token =
      url.searchParams.get('token') || process.env.TELEGRAM_BOT_SHEF_TOKEN || '';

    // ---------- 1. Inline tugma bosilishi ----------
    if (body.callback_query) {
      const cq = body.callback_query;
      const data: string = cq.data || '';
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;
      const supabase = serviceClient();

      let answerText = 'Qabul qilindi';

      const [kind, id, value] = data.split(':');

      if (kind === 'lead' && id && value && LEAD_STATUS_LABELS[value]) {
        const { error } = await supabase
          .from('leads')
          .update({ status: value })
          .eq('id', id);
        answerText = error ? `Xato: ${error.message}` : LEAD_STATUS_LABELS[value];

        // Xabar ostiga natijani yozib, tugmalarni olib tashlaymiz
        if (!error && chatId && messageId) {
          const orig = cq.message?.text || '';
          await tg(token, 'editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: `${orig}\n\n— ${LEAD_STATUS_LABELS[value]}`,
          });
        }
      } else if (kind === 'leasepaid' && id && value) {
        // Egaga oylik to'landi: value = 'YYYY-MM' davr.
        // 1) Shu oy uchun eslatmalarni yopamiz, 2) Moliya'ga xarajat yozamiz.
        const { data: apt, error } = await supabase
          .from('apartments')
          .update({ lease_last_paid_period: value })
          .eq('id', id)
          .select('id, title, monthly_lease_cost')
          .single();

        if (!error && apt) {
          // Takroriy xarajat yozmaslik uchun tekshiramiz
          const { data: existing } = await supabase
            .from('expenses')
            .select('id')
            .eq('apartment_id', apt.id)
            .eq('category', 'rent')
            .like('note', `%${value}%`)
            .maybeSingle();

          if (!existing) {
            await supabase.from('expenses').insert([
              {
                category: 'rent',
                amount: Number(apt.monthly_lease_cost || 0),
                currency: 'USD',
                spent_on: new Date().toISOString().split('T')[0],
                apartment_id: apt.id,
                note: `Egaga oylik (${value}) — bot orqali tasdiqlandi`,
              },
            ]);
          }

          answerText = `✅ ${apt.title} — ${value} oyi yopildi`;
          if (chatId && messageId) {
            const orig = cq.message?.text || '';
            await tg(token, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `${orig}\n\n— ✅ TO'LANDI (${value}). Moliya'ga xarajat yozildi.`,
            });
          }
        } else {
          answerText = `Xato: ${error?.message || 'apartament topilmadi'}`;
        }
      } else if (kind === 'task' && id && value === 'done') {
        const { data: task, error } = await supabase
          .from('tasks')
          .update({ status: 'done', completed_at: new Date().toISOString() })
          .eq('id', id)
          .select('apartment_id')
          .single();

        if (!error && task?.apartment_id) {
          await supabase
            .from('apartments')
            .update({ kanban_status: 'available' })
            .eq('id', task.apartment_id);
        }
        answerText = error ? `Xato: ${error.message}` : '✅ Rahmat! Xona toza deb belgilandi';

        if (!error && chatId && messageId) {
          const orig = cq.message?.text || '';
          await tg(token, 'editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: `${orig}\n\n— ✅ TOZALANDI`,
          });
        }
      }

      await tg(token, 'answerCallbackQuery', {
        callback_query_id: cq.id,
        text: answerText,
      });

      return NextResponse.json({ status: 'callback_handled' });
    }

    // ---------- 2. Oddiy xabar: parol bilan obuna ----------
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();

    let role: 'shef' | 'menejer' | 'cleaning' | null = null;
    if (text === PASSWORDS.shef) role = 'shef';
    else if (text === PASSWORDS.menejer) role = 'menejer';
    else if (text === PASSWORDS.cleaning) role = 'cleaning';

    if (role) {
      const supabase = serviceClient();
      const { error } = await supabase
        .from('bot_subscribers')
        .upsert(
          { chat_id: chatId, role, joined_at: new Date().toISOString() },
          { onConflict: 'chat_id' }
        );
      if (error) throw error;

      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: `✅ Tabriklaymiz! Siz tizimga "${role.toUpperCase()}" ro'lida muvaffaqiyatli ulandingiz. Endi xabarlar sizga keladi.`,
      });

      return NextResponse.json({ status: 'success', role });
    }

    // Boshqa xabarlarni jim e'tiborsiz qoldiramiz
    return NextResponse.json({ status: 'ignored_unauthorized' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Webhook xatosi:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
