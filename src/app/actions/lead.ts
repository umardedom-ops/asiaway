"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyRole } from "@/lib/telegram";

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

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert([
      {
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
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Lead insert error:", error.message);
    return { success: false, error: error.message };
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
    lead?.id
      ? [
          [
            { text: "✅ Bog'lanildi", callback_data: `lead:${lead.id}:contacted` },
            { text: "📵 Javob bermadi", callback_data: `lead:${lead.id}:waiting` },
          ],
          [{ text: "❌ Bekor qilish", callback_data: `lead:${lead.id}:lost` }],
        ]
      : undefined
  );

  return { success: true };
}
