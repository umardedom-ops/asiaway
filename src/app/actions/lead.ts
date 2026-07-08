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
}

/**
 * Aloqa (qayta aloqaga chiqish) so'rovini Supabase `leads` jadvaliga saqlaydi.
 *
 * Jadval mavjud bo'lmasa, quyidagi SQL bilan yarating (Supabase SQL editor):
 *   create table if not exists leads (
 *     id uuid primary key default gen_random_uuid(),
 *     name text not null,
 *     phone text not null,
 *     whatsapp text,
 *     telegram text,
 *     email text,
 *     message text,
 *     lang text,
 *     status text default 'new',
 *     created_at timestamptz default now()
 *   );
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
      status: "new",
    },
  ]);

  if (error) {
    console.error("Lead insert error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}
