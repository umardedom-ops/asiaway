"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Qo'lda murojaat kiritish (menejer telefonda/Instagramda gaplashib, o'zi yozadi)
export async function createManualLead(input: {
  name: string;
  phone: string;
  source?: string;
  telegram?: string;
  whatsapp?: string;
  message?: string;
  notes?: string;
}) {
  if (!input.name?.trim()) return { success: false, error: "Ism kiriting" };
  if (!input.phone?.trim()) return { success: false, error: "Telefon kiriting" };

  const supabase = await createClient(); // authenticated — RLS "Admin All Leads" ruxsat beradi
  const { error } = await supabase.from("leads").insert([
    {
      name: input.name.trim(),
      phone: input.phone.trim(),
      telegram: input.telegram?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      message: input.message?.trim() || null,
      notes: input.notes?.trim() || null,
      source: input.source || "qolda",
      status: "new",
    },
  ]);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/crm");
  return { success: true };
}

export async function updateLeadStatus(id: string, status: string, notes?: string) {
  const supabase = await createClient();
  
  const updateData: any = { status };
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to update lead:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/crm");
  return { success: true };
}
