"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ExpenseInput {
  category: string;
  amount: number;
  currency?: string;
  spent_on: string;
  apartment_id?: string | null;
  note?: string;
}

export async function addExpense(input: ExpenseInput) {
  if (!input.amount || input.amount <= 0) {
    return { success: false, error: "Summani kiriting" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert([
    {
      category: input.category || "other",
      amount: input.amount,
      currency: input.currency || "USD",
      spent_on: input.spent_on || new Date().toISOString().split("T")[0],
      apartment_id: input.apartment_id || null,
      note: input.note?.trim() || null,
    },
  ]);
  if (error) {
    console.error("addExpense:", error.message);
    return { success: false, error: error.message };
  }

  // Agar chiqim "Arenda (egaga)" bo'lsa va apartament tanlangan bo'lsa, uni to'landi deb belgilab qo'yamiz (dashboardda ko'rinishi uchun)
  if (input.category === "rent" && input.apartment_id) {
    const d = new Date(input.spent_on || new Date().toISOString().split("T")[0]);
    const period = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    await supabase.from("apartments").update({ lease_last_paid_period: period }).eq("id", input.apartment_id);
  }
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/kassa");
  revalidatePath("/dashboard/cashflow");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/kassa");
  return { success: true };
}
