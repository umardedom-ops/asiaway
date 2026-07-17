import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { completeCleaningTaskAndFreeRoom } from '@/lib/cleaning';
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

const getLeadStatusLabel = (val: string, lang: string) => {
  if (lang === 'ru') {
    if (val === 'contacted') return "✅ Связались";
    if (val === 'waiting') return "📵 Не ответил (ожидание)";
    if (val === 'lost') return "❌ Отменено";
  }
  if (val === 'contacted') return "✅ Bog'lanildi";
  if (val === 'waiting') return "📵 Javob bermadi (kutilmoqda)";
  if (val === 'lost') return "❌ Bekor qilindi";
  return val;
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

async function sendLangMenu(token: string, chatId: number, lang: string) {
  const text = lang === 'ru' ? "🌐 Выберите язык:" : "🌐 Tilni tanlang:";
  await tg(token, 'sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🇺🇿 O'zbekcha", callback_data: "setlang:uz" },
          { text: "🇷🇺 Русский", callback_data: "setlang:ru" }
        ]
      ]
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const token =
      url.searchParams.get('token') || process.env.TELEGRAM_BOT_SHEF_TOKEN || '';

    // C5 — webhook secret tekshiruvi (FAIL-OPEN xavfsiz chiqarilishi).
    // MUHIM: env TELEGRAM_WEBHOOK_SECRET o'rnatilgan bo'lsagina majburlaymiz.
    // Agar env hali yo'q bo'lsa — tekshiruvsiz o'tkazamiz (aks holda env qo'yilmaguncha
    // BARCHA botlar 401 qaytarib o'lib qolardi). Env qo'yib, /api/telegram/setup qayta
    // ishga tushirilgach — secret to'liq majburlanadi.
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret) {
      const secret = req.headers.get("x-telegram-bot-api-secret-token");
      if (secret !== configuredSecret) {
        return NextResponse.json({ status: "unauthorized" }, { status: 401 });
      }
    }

    // ---------- 1. Inline tugma bosilishi ----------
    if (body.callback_query) {
      const cq = body.callback_query;
      const data: string = cq.data || '';
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;
      const supabase = serviceClient();

      let answerText = 'Qabul qilindi';
      
      // Xodimning tilini aniqlaymiz
      const { data: sub } = await supabase
        .from('bot_subscribers')
        .select('lang')
        .eq('chat_id', chatId)
        .limit(1)
        .maybeSingle();
      const lang = sub?.lang || 'uz';

      const [kind, id, value] = data.split(':');

      if (kind === 'setlang' && id) {
        // Til o'rnatish: id bu yerda aslida qiymat (uz yoki ru)
        const newLang = id;
        await supabase
          .from('bot_subscribers')
          .update({ lang: newLang })
          .eq('chat_id', chatId);
          
        answerText = newLang === 'ru' ? "✅ Язык изменен на Русский" : "✅ Til O'zbekchaga o'zgardi";
        
        if (chatId && messageId) {
          await tg(token, 'editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: answerText,
          });
        }
      } else if (kind === 'lead' && id && value) {
        const { error } = await supabase
          .from('leads')
          .update({ status: value })
          .eq('id', id);
          
        const label = getLeadStatusLabel(value, lang);
        answerText = error ? (lang === 'ru' ? `Ошибка: ${error.message}` : `Xato: ${error.message}`) : label;

        if (!error && chatId && messageId) {
          const orig = cq.message?.text || '';
          await tg(token, 'editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: `${orig}\n\n— ${label}`,
          });
        }
      } else if (kind === 'leasepaid' && id && value) {
        const { data: apt, error } = await supabase
          .from('apartments')
          .update({ lease_last_paid_period: value })
          .eq('id', id)
          .select('id, title, monthly_lease_cost')
          .single();

        if (!error && apt) {
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

          answerText = lang === 'ru' ? `✅ ${apt.title} — ${value} закрыт` : `✅ ${apt.title} — ${value} oyi yopildi`;
          if (chatId && messageId) {
            const orig = cq.message?.text || '';
            const appendTxt = lang === 'ru' 
              ? `\n\n— ✅ ОПЛАЧЕНО (${value}). Добавлено в Финансы.` 
              : `\n\n— ✅ TO'LANDI (${value}). Moliya'ga xarajat yozildi.`;
              
            await tg(token, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `${orig}${appendTxt}`,
            });
          }
        } else {
          answerText = lang === 'ru' ? `Ошибка: ${error?.message || 'апартамент не найден'}` : `Xato: ${error?.message || 'apartament topilmadi'}`;
        }
      } else if (kind === 'draft' && id && (value === 'crm' || value === 'bron')) {
        const d = await getDraft(supabase, id);
        if (!d) {
          answerText = lang === 'ru' ? "Данные не найдены (устарели)" : "Ma'lumot topilmadi (eskirgan)";
        } else if (value === 'crm') {
          const res = await draftToLead(supabase, d);
          answerText = res.ok 
            ? (lang === 'ru' ? '✅ Добавлено в CRM' : '✅ CRM ga qo\'shildi') 
            : (lang === 'ru' ? `Ошибка: ${res.error}` : `Xato: ${res.error}`);
            
          if (res.ok && chatId && messageId) {
            const orig = cq.message?.text || '';
            const appendTxt = lang === 'ru' ? `\n\n— 📋 ДОБАВЛЕНО В CRM ✅` : `\n\n— 📋 CRM GA QO'SHILDI ✅`;
            await tg(token, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `${orig}${appendTxt}`,
            });
          }
        } else {
          const res = await draftToBooking(supabase, d);
          answerText = res.ok 
            ? (lang === 'ru' ? '✅ Добавлено в Бронь (ожидает)' : '✅ Bronga qo\'shildi (tasdiqlash kutilmoqda)') 
            : (lang === 'ru' ? `Ошибка: ${res.error}` : `Xato: ${res.error}`);
            
          if (res.ok && chatId && messageId) {
            const orig = cq.message?.text || '';
            const appendTxt = lang === 'ru' ? `\n\n— 📅 ДОБАВЛЕНО В БРОНЬ ✅ (подтвердите в дашборде)` : `\n\n— 📅 BRONGA QO'SHILDI ✅ (dashboardda tasdiqlang)`;
            await tg(token, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `${orig}${appendTxt}`,
            });
          }
        }
      } else if (kind === 'task' && id && value === 'done') {
        // Yagona helper: task done + tozalash bo'lsa xona 'available' (yashil)
        const res = await completeCleaningTaskAndFreeRoom(supabase, id);
        const error = res.success ? null : { message: res.error || 'xato' };
        answerText = error
          ? (lang === 'ru' ? `Ошибка: ${error.message}` : `Xato: ${error.message}`)
          : (lang === 'ru' ? '✅ Спасибо! Задача отмечена как выполненная' : '✅ Rahmat! Vazifa bajarildi deb belgilandi');

        if (!error && chatId && messageId) {
          const orig = cq.message?.text || '';
          const appendTxt = lang === 'ru' ? `\n\n— ✅ УБРАНО` : `\n\n— ✅ TOZALANDI`;
          await tg(token, 'editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: `${orig}${appendTxt}`,
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
    const supabase = serviceClient();

    let role: 'shef' | 'menejer' | 'cleaning' | null = null;
    if (text === PASSWORDS.shef) role = 'shef';
    else if (text === PASSWORDS.menejer) role = 'menejer';
    else if (text === PASSWORDS.cleaning) role = 'cleaning';

    if (role) {
      const { error } = await supabase
        .from('bot_subscribers')
        .upsert(
          { chat_id: chatId, role, joined_at: new Date().toISOString() },
          { onConflict: 'chat_id,role' }
        );
      if (error) throw error;

      const isStaff = role === 'shef' || role === 'menejer';
      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: `✅ Tabriklaymiz! Siz tizimga "${role.toUpperCase()}" ro'lida muvaffaqiyatli ulandingiz. Endi xabarlar sizga keladi.`,
        ...(isStaff ? { reply_markup: MAIN_KEYBOARD } : {}),
      });
      
      // Til tanlash menyusini yuborish
      await sendLangMenu(token, chatId, 'uz');

      return NextResponse.json({ status: 'success', role });
    }

    // ---------- 3. Shef/menejer uchun xabarlar ----------
    const { data: sub } = await supabase
      .from('bot_subscribers')
      .select('role, lang')
      .eq('chat_id', chatId)
      .limit(1)
      .maybeSingle();

    if (!sub) return NextResponse.json({ status: 'ignored_unauthorized' });
    const lang = sub.lang || 'uz';

    if (text === '/lang') {
      await sendLangMenu(token, chatId, lang);
      return NextResponse.json({ status: 'lang_menu_sent' });
    }
    
    // Faqat ulangan shef/menejerga ruxsat
    if (sub.role !== 'shef' && sub.role !== 'menejer') {
      return NextResponse.json({ status: 'ignored_not_staff' });
    }

    if (text === NEW_LEAD_BTN || text === '/yangi' || text === '/start') {
      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: TEMPLATE_TEXT,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD,
      });
      return NextResponse.json({ status: 'template_sent' });
    }

    const draft = parseTemplate(text);
    if (draft) {
      const summary = await buildSummary(supabase, draft);
      const draftId = await saveDraft(supabase, chatId, draft);

      if (!draftId) {
        await tg(token, 'sendMessage', { 
          chat_id: chatId, 
          text: lang === 'ru' ? '⚠️ Ошибка сохранения. Попробуйте еще раз.' : '⚠️ Saqlashda xato. Qayta urinib ko\'ring.' 
        });
        return NextResponse.json({ status: 'draft_error' });
      }

      const buttons: { text: string; callback_data: string }[][] = [
        [{ text: lang === 'ru' ? '📋 В CRM' : '📋 CRM ga', callback_data: `draft:${draftId}:crm` }],
      ];
      if (summary.canBook) {
        buttons[0].push({ text: lang === 'ru' ? '📅 В Бронь' : '📅 Bronga', callback_data: `draft:${draftId}:bron` });
      }

      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: summary.text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
      return NextResponse.json({ status: 'draft_saved' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Webhook xatosi:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
