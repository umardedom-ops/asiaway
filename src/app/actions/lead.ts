"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { notifyRole, esc } from "@/lib/telegram";

// Service-role klient (RLS'ni chetlab o'tadi). `leads` jadvalida anonim
// foydalanuvchi faqat INSERT qila oladi, SELECT yo'q — shuning uchun ID qaytarish
// uchun service-role kerak. Kalit yo'q bo'lsa null (oddiy anon insert'ga qaytamiz).
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key);
}

export interface LeadInput {
  name: string;
  phone: string;
  whatsapp?: string;
  telegram?: string;
  email?: string;
  message?: string;
  lang?: string;
  source?: string;
  notes?: string;
}

/**
 * Aloqa (qayta aloqaga chiqish) so'rovini Supabase `leads` jadvaliga saqlaydi.
 */
export async function createLead(input: LeadInput) {
  if (!input.name?.trim() || !input.phone?.trim()) {
    return { success: false, error: "missing_fields" };
  }

  const row = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp?.trim() || null,
    telegram: input.telegram?.trim() || null,
    email: input.email?.trim() || null,
    message: input.message?.trim() || null,
    lang: input.lang || null,
    source: input.source || "sayt",
    notes: input.notes || null,
    status: "new",
  };

  // Avval service-role bilan urinamiz (ID qaytadi → Telegram tugmalari uchun).
  // Kalit yo'q bo'lsa oddiy anon insert (ID'siz, tugmasiz).
  const svc = serviceClient();
  let leadId: string | null = null;

  if (svc) {
    const { data: lead, error } = await svc.from("leads").insert([row]).select("id").single();
    if (error) {
      console.error("Lead insert (service) error:", error.message);
      return { success: false, error: error.message };
    }
    leadId = lead?.id ?? null;
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("leads").insert([row]);
    if (error) {
      console.error("Lead insert error:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Menejer botiga xabar + holat tugmalari (bosilganda leads.status o'zgaradi)
  const contact = [
    input.telegram ? `TG: ${input.telegram}` : null,
    input.whatsapp ? `WA: ${input.whatsapp}` : null,
    input.email ? `Email: ${input.email}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  await notifyRole(
    "menejer",
    (lang: string) => {
      const isRu = lang === "ru";
      const title = isRu ? "📞 <b>ЗАПРОС НА СВЯЗЬ (сайт)</b>" : "📞 <b>QAYTA ALOQA SO'ROVI (sayt)</b>";
      const langLbl = isRu ? "🌐 Язык:" : "🌐 Til:";
      // esc() — mijoz kiritgan matn HTML'ni buzmasin (aks holda Telegram xabarni rad etadi)
      const contactTxt = contact ? `💬 ${esc(contact)}\n` : "";
      const msgTxt = input.message?.trim() ? `📝 ${esc(input.message.trim())}\n` : "";

      const text = `${title}\n\n👤 ${esc(input.name.trim())}\n📱 ${esc(input.phone.trim())}\n${contactTxt}${msgTxt}${langLbl} ${esc(input.lang || "-")}`;

      const buttons = leadId
        ? [
            [
              { text: isRu ? "✅ Связались" : "✅ Bog'lanildi", callback_data: `lead:${leadId}:contacted` },
              { text: isRu ? "📵 Не ответил" : "📵 Javob bermadi", callback_data: `lead:${leadId}:waiting` },
            ],
            [{ text: isRu ? "❌ Отменить" : "❌ Bekor qilish", callback_data: `lead:${leadId}:lost` }],
          ]
        : undefined;

      return { text, buttons };
    }
  );

  return { success: true };
}
