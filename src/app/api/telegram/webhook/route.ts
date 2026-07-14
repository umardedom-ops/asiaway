import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  NEW_LEAD_BTN, MAIN_KEYBOARD, TEMPLATE_TEXT,
  parseTemplate, saveDraft, getDraft, buildSummary, draftToLead, draftToBooking,
} from '@/lib/bot-lead';

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
      } else if (kind === 'draft' && id && (value === 'crm' || value === 'bron')) {
        // Botda to'ldirilgan shablon → CRM yoki Bronga
        const d = await getDraft(supabase, id);
        if (!d) {
          answerText = "Ma'lumot topilmadi (eskirgan)";
        } else if (value === 'crm') {
          const res = await draftToLead(supabase, d);
          answerText = res.ok ? '✅ CRM ga qo\'shildi' : `Xato: ${res.error}`;
          if (res.ok && chatId && messageId) {
            const orig = cq.message?.text || '';
            await tg(token, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `${orig}\n\n— 📋 CRM GA QO'SHILDI ✅`,
            });
          }
        } else {
          const res = await draftToBooking(supabase, d);
          answerText = res.ok ? '✅ Bronga qo\'shildi (tasdiqlash kutilmoqda)' : `Xato: ${res.error}`;
          if (res.ok && chatId && messageId) {
            const orig = cq.message?.text || '';
            await tg(token, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `${orig}\n\n— 📅 BRONGA QO'SHILDI ✅ (dashboardda tasdiqlang)`,
            });
          }
        }
      } else if (kind === 'task' && id && value === 'done') {
        const { data: task, error } = await supabase
          .from('tasks')
          .update({ status: 'done', completed_at: new Date().toISOString() })
          .eq('id', id)
          .select('apartment_id, type')
          .single();

        // Faqat TOZALASH vazifasi yopilganda xona "bo'sh/toza" bo'ladi
        if (!error && task?.type === 'cleaning' && task.apartment_id) {
          await supabase
            .from('apartments')
            .update({ kanban_status: 'available' })
            .eq('id', task.apartment_id);
        }
        answerText = error ? `Xato: ${error.message}` : '✅ Rahmat! Vazifa bajarildi deb belgilandi';

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
      // MUHIM: onConflict (chat_id, role) — bir odam bir nechta botga (rolga)
      // obuna bo'la oladi. Avval faqat chat_id edi va rol ustiga yozilib ketardi.
      const { error } = await supabase
        .from('bot_subscribers')
        .upsert(
          { chat_id: chatId, role, joined_at: new Date().toISOString() },
          { onConflict: 'chat_id,role' }
        );
      if (error) throw error;

      // Shef/menejer uchun pastda doimiy tugma turadi
      const isStaff = role === 'shef' || role === 'menejer';
      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: `✅ Tabriklaymiz! Siz tizimga "${role.toUpperCase()}" ro'lida muvaffaqiyatli ulandingiz. Endi xabarlar sizga keladi.`,
        ...(isStaff ? { reply_markup: MAIN_KEYBOARD } : {}),
      });

      return NextResponse.json({ status: 'success', role });
    }

    // ---------- 3. Shef/menejer uchun "Yangi mijoz" oqimi ----------
    const supabase = serviceClient();
    const { data: sub } = await supabase
      .from('bot_subscribers')
      .select('role')
      .eq('chat_id', chatId)
      .in('role', ['shef', 'menejer'])
      .limit(1)
      .maybeSingle();

    // Faqat ulangan shef/menejerga javob beramiz
    if (!sub) return NextResponse.json({ status: 'ignored_unauthorized' });

    // 3a. Tugma yoki /yangi → shablon chiqadi
    if (text === NEW_LEAD_BTN || text === '/yangi' || text === '/start') {
      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: TEMPLATE_TEXT,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
      return NextResponse.json({ status: 'template_sent' });
    }

    // 3b. To'ldirilgan shablon → xulosa + [CRM ga] [Bronga] tugmalari
    const draft = parseTemplate(text);
    if (draft) {
      const summary = await buildSummary(supabase, draft);
      const draftId = await saveDraft(supabase, chatId, draft);

      if (!draftId) {
        await tg(token, 'sendMessage', { chat_id: chatId, text: '⚠️ Saqlashda xato. Qayta urinib ko\'ring.' });
        return NextResponse.json({ status: 'draft_error' });
      }

      const buttons: { text: string; callback_data: string }[][] = [
        [{ text: '📋 CRM ga', callback_data: `draft:${draftId}:crm` }],
      ];
      if (summary.canBook) {
        buttons[0].push({ text: '📅 Bronga', callback_data: `draft:${draftId}:bron` });
      }

      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: summary.text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
      return NextResponse.json({ status: 'draft_saved' });
    }

    // Boshqa xabarlarni jim e'tiborsiz qoldiramiz
    return NextResponse.json({ status: 'ignored' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Webhook xatosi:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
