"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
