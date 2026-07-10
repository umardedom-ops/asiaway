"use server";

import { createClient } from "@/lib/supabase/server";

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
  const { error } = await supabase.from("leads").insert([
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
  ]);

  if (error) {
    console.error("Lead insert error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}
