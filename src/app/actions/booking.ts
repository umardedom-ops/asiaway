"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface BookingInput {
  apartment_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  deposit_amount: number;
  payment_method: "payme" | "click";
}

export async function createBooking(input: BookingInput) {
  const supabase = await createClient();

  try {
    // 1. Sanalar bandligini tekshirish (Overlap validation)
    const { data: overlappingBookings, error: checkError } = await supabase
      .from("bookings")
      .select("id")
      .eq("apartment_id", input.apartment_id)
      .neq("booking_status", "cancelled")
      .lt("check_in", input.check_out)
      .gt("check_out", input.check_in);

    if (checkError) {
      throw new Error(`Sanalar bandligini tekshirishda xato: ${checkError.message}`);
    }

    if (overlappingBookings && overlappingBookings.length > 0) {
      return {
        success: false,
        error: "Kechirasiz, ushbu sanalarda apartament band qilingan. Boshqa sanalarni tanlang.",
      };
    }

    // 2. Yangi bron yaratish (Simulated to'lov to'langandan so'ng)
    const { data: newBooking, error: insertError } = await supabase
      .from("bookings")
      .insert([
        {
          apartment_id: input.apartment_id,
          guest_name: input.guest_name,
          guest_phone: input.guest_phone,
          guest_email: input.guest_email || null,
          check_in: input.check_in,
          check_out: input.check_out,
          nights: input.nights,
          total_price: input.total_price,
          deposit_amount: input.deposit_amount,
          deposit_status: "paid", // Zaklat to'lov simulyatsiyasi muvaffaqiyatli o'tdi
          booking_status: "confirmed", // Avtomatik tasdiqlash
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Cache tozalash
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");
    
    return {
      success: true,
      booking: newBooking,
    };
  } catch (error: any) {
    console.error("Booking error:", error);
    return {
      success: false,
      error: error.message || "Tizimda noma'lum xatolik yuz berdi.",
    };
  }
}

// Band qilingan sanalar ro'yxatini qaytarish (Kalendarda o'chirish uchun)
export async function getBookedDates(apartmentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .eq("apartment_id", apartmentId)
    .neq("booking_status", "cancelled");

  if (error) {
    console.error("Error fetching booked dates:", error);
    return [];
  }

  return data.map((b) => ({
    start: new Date(b.check_in),
    end: new Date(b.check_out),
  }));
}
