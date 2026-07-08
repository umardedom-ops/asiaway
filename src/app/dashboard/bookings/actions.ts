"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ booking_status: status })
    .eq("id", id);

  if (error) {
    throw new Error(`Bron holatini yangilashda xatolik: ${error.message}`);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function updateDepositStatus(id: string, status: "pending" | "paid" | "refunded") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ deposit_status: status })
    .eq("id", id);

  if (error) {
    throw new Error(`Zaklat holatini yangilashda xatolik: ${error.message}`);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}
