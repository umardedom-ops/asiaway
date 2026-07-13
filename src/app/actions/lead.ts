"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { notifyRole } from "@/lib/telegram";

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
    `📞 <b>QAYTA ALOQA SO'ROVI (sayt)</b>\n\n` +
      `👤 ${input.name.trim()}\n` +
      `📱 ${input.phone.trim()}\n` +
      (contact ? `💬 ${contact}\n` : "") +
      (input.message?.trim() ? `📝 ${input.message.trim()}\n` : "") +
      `🌐 Til: ${input.lang || "-"}`,
    leadId
      ? [
          [
            { text: "✅ Bog'lanildi", callback_data: `lead:${leadId}:contacted` },
            { text: "📵 Javob bermadi", callback_data: `lead:${leadId}:waiting` },
          ],
          [{ text: "❌ Bekor qilish", callback_data: `lead:${leadId}:lost` }],
        ]
      : undefined
  );

  return { success: true };
}
