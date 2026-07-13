"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PaymentInput {
  booking_id?: string;
  guest_name: string;
  amount: number;
  method: string;
  kind?: string;
  note?: string;
  paid_at?: string; // ISO; berilmasa hozir
}

// Qo'lda to'lov qo'shish (kirim kassasiga)
export async function addPayment(input: PaymentInput) {
  if (!input.guest_name?.trim()) return { success: false, error: "Mehmon ismini kiriting" };
  if (!input.amount || input.amount <= 0) return { success: false, error: "Summani kiriting" };

  const supabase = await createClient();

  // Bron tanlangan bo'lsa — client_id ni topamiz
  let client_id: string | null = null;
  if (input.booking_id) {
    const { data: bk } = await supabase
      .from("bookings")
      .select("guest_phone")
      .eq("id", input.booking_id)
      .maybeSingle();
    if (bk?.guest_phone) {
      const { data: cl } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", bk.guest_phone.trim())
        .maybeSingle();
      client_id = cl?.id || null;
    }
  }

  const { error } = await supabase.from("payments").insert([{
    booking_id: input.booking_id || null,
    client_id,
    guest_name: input.guest_name.trim(),
    amount: input.amount,
    method: input.method || "naqd",
    kind: input.kind || "payment",
    note: input.note?.trim() || null,
    paid_at: input.paid_at || new Date().toISOString(),
  }]);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/cashflow");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePayment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/income");
  return { success: true };
}
