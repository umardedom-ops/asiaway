"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Egaga oylik to'landi deb belgilash (dashboard tugmasi — bot bilan bir xil mantiq):
 *  1) apartments.lease_last_paid_period = davr → eslatmalar to'xtaydi
 *  2) Moliya'ga 'rent' xarajati yoziladi (takror himoyasi bilan)
 */
export async function markLeasePaid(apartmentId: string, period: string) {
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return { success: false, error: "Davr formati noto'g'ri" };
  }
  const supabase = await createClient();

  const { data: apt, error } = await supabase
    .from("apartments")
    .update({ lease_last_paid_period: period })
    .eq("id", apartmentId)
    .select("id, title, monthly_lease_cost")
    .single();

  if (error || !apt) {
    return { success: false, error: error?.message || "Apartament topilmadi" };
  }

  // Takroriy xarajat yozmaslik (bot ham yozgan bo'lishi mumkin)
  const { data: existing } = await supabase
    .from("expenses")
    .select("id")
    .eq("apartment_id", apt.id)
    .eq("category", "rent")
    .like("note", `%${period}%`)
    .maybeSingle();

  if (!existing) {
    await supabase.from("expenses").insert([
      {
        category: "rent",
        amount: Number(apt.monthly_lease_cost || 0),
        currency: "USD",
        spent_on: new Date().toISOString().split("T")[0],
        apartment_id: apt.id,
        note: `Egaga oylik (${period}) — dashboard orqali tasdiqlandi`,
      },
    ]);
  }

  revalidatePath("/dashboard/owner-payments");
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard");
  return { success: true };
}
