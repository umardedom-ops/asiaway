"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { syncClientFromBooking, onBookingCompleted } from "@/lib/clients-sync";

// Qo'lда bron kiritish (Airbnb / Booking / Instagram / WhatsApp / Telegram / to'g'ridan-to'g'ri)
export interface ManualBookingInput {
  apartment_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  channel: string;
  check_in: string;
  check_out: string;
  total_price: number;
  deposit_amount: number;
  deposit_status: "pending" | "paid" | "refunded";
  booking_status: "pending" | "confirmed" | "completed";
}

export async function createManualBooking(input: ManualBookingInput) {
  if (!input.apartment_id) return { success: false, error: "Apartamentni tanlang" };
  if (!input.guest_name?.trim()) return { success: false, error: "Mehmon ismini kiriting" };
  if (!input.check_in || !input.check_out) return { success: false, error: "Sanalarni kiriting" };

  const start = new Date(input.check_in);
  const end = new Date(input.check_out);
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (nights <= 0) return { success: false, error: "Ketish sanasi kelishдан keyin bo'lsin" };

  const supabase = await createClient();

  // Sanalar bandligini tekshirish
  const { data: overlap } = await supabase
    .from("bookings")
    .select("id")
    .eq("apartment_id", input.apartment_id)
    .neq("booking_status", "cancelled")
    .lt("check_in", input.check_out)
    .gt("check_out", input.check_in);
  if (overlap && overlap.length > 0) {
    return { success: false, error: "Bu sanalarда apartament allaqachon band" };
  }

  const { error } = await supabase.from("bookings").insert([{
    apartment_id: input.apartment_id,
    guest_name: input.guest_name.trim(),
    guest_phone: input.guest_phone?.trim() || "",
    guest_email: input.guest_email?.trim() || null,
    channel: input.channel || "direct",
    check_in: input.check_in,
    check_out: input.check_out,
    nights,
    total_price: input.total_price || 0,
    deposit_amount: input.deposit_amount || 0,
    deposit_status: input.deposit_status || "pending",
    booking_status: input.booking_status || "confirmed",
  }]);

  if (error) return { success: false, error: error.message };

  await syncClientFromBooking(supabase, {
    name: input.guest_name,
    phone: input.guest_phone,
    email: input.guest_email,
    channel: input.channel,
    amount: input.total_price,
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed") {
  const supabase = await createClient();

  // Oldingi holatni olamiz (faqat yangi "completed" da avto-tozalash ochilsin)
  const { data: prev } = await supabase
    .from("bookings")
    .select("booking_status, apartment_id, guest_name, guest_phone, check_out")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("bookings")
    .update({ booking_status: status })
    .eq("id", id);

  if (error) {
    throw new Error(`Bron holatini yangilashda xatolik: ${error.message}`);
  }

  // Checkout (completed) → mijoz bosqichi + avto-tozalash vazifasi
  if (status === "completed" && prev && prev.booking_status !== "completed") {
    await onBookingCompleted(supabase, {
      apartment_id: prev.apartment_id,
      guest_name: prev.guest_name,
      guest_phone: prev.guest_phone,
      check_out: prev.check_out,
    });
    revalidatePath("/dashboard/staff");
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
