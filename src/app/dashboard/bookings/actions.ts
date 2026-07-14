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
  lead_id?: string;
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

  const { data: newBooking, error } = await supabase.from("bookings").insert([{
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
    lead_id: input.lead_id || null,
  }]).select("id").single();

  if (error) return { success: false, error: error.message };

  // Mijozни clients jadvaliga qo'shamiz/yangilaymiz (Mehmonlar bo'limi)
  const client = await syncClientFromBooking(supabase, {
    name: input.guest_name,
    phone: input.guest_phone,
    email: input.guest_email,
    channel: input.channel,
    amount: input.total_price,
  });

  // Zaklat to'langan bo'lsa — kirim kassasiga avtomat yozuv
  if (newBooking && input.deposit_status === "paid" && (input.deposit_amount || 0) > 0) {
    await supabase.from("payments").insert([{
      booking_id: newBooking.id,
      client_id: client?.id || null,
      guest_name: input.guest_name.trim(),
      amount: input.deposit_amount,
      method: input.channel === "airbnb" || input.channel === "booking" ? "otkazma" : "naqd",
      kind: "deposit",
      note: `Qo'lда bron — zaklat (${input.channel})`,
    }]);
  }

  // Lead'dan kelgan bo'lsa — CRM'да "muvaffaqiyatli" (won) qilamiz
  if (input.lead_id) {
    await supabase.from("leads").update({ status: "won" }).eq("id", input.lead_id);
    revalidatePath("/dashboard/crm");
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/cashflow");
  revalidatePath("/dashboard");
  return { success: true };
}

// Joylashtirish (check-in): mehmon apartga kirdi → "hozir turgan mehmonlar"ga o'tadi
export async function checkInBooking(id: string) {
  const supabase = await createClient();

  const { data: bk } = await supabase
    .from("bookings")
    .select("guest_phone, booking_status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("bookings")
    .update({ checked_in_at: new Date().toISOString(), booking_status: "confirmed" })
    .eq("id", id);
  if (error) throw new Error(`Joylashtirishda xatolik: ${error.message}`);

  // Mijoz bosqichi → "staying" (yashamoqda)
  if (bk?.guest_phone) {
    await supabase
      .from("clients")
      .update({ stage: "staying" })
      .eq("phone", bk.guest_phone.trim());
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// Walk-in: mehmonni HOZIR joylashtirish (bron + check-in bir amalda)
export async function placeGuestNow(input: ManualBookingInput) {
  const res = await createManualBooking({ ...input, booking_status: "confirmed" });
  if (!res.success) return res;

  // Eng so'nggi shu mehmon bronini topib check-in qilamiz
  const supabase = await createClient();
  const { data: bk } = await supabase
    .from("bookings")
    .select("id")
    .eq("apartment_id", input.apartment_id)
    .eq("guest_name", input.guest_name.trim())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (bk?.id) {
    await supabase
      .from("bookings")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", bk.id);
    if (input.guest_phone) {
      await supabase.from("clients").update({ stage: "staying" }).eq("phone", input.guest_phone.trim());
    }
  }

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/reception");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed") {
  const supabase = await createClient();

  // Oldingi holatni olamiz (avto-hisob va avto-tozalash uchun)
  const { data: prev } = await supabase
    .from("bookings")
    .select("booking_status, apartment_id, guest_name, guest_phone, check_out, nights, total_price, apartments(price_per_day)")
    .eq("id", id)
    .maybeSingle();

  // Checkout'да narx 0 bo'lsa — nights × price_per_day avtomat hisoblanadi
  const patch: Record<string, unknown> = { booking_status: status };
  if (status === "completed" && prev && Number(prev.total_price || 0) === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apt: any = Array.isArray(prev.apartments) ? prev.apartments[0] : prev.apartments;
    const perNight = Number(apt?.price_per_day || 0);
    const nights = Number(prev.nights || 0);
    if (perNight > 0 && nights > 0) patch.total_price = perNight * nights;
  }

  const { error } = await supabase
    .from("bookings")
    .update(patch)
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
    revalidatePath("/dashboard/guests");
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

// Bir bron uchun barcha to'lovlar (chek uchun — haqiqatда olingan pul)
export async function getBookingPayments(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, method, kind, note, paid_at")
    .eq("booking_id", bookingId)
    .order("paid_at", { ascending: true });
  if (error) {
    console.error("getBookingPayments:", error.message);
    return [];
  }
  return data || [];
}

export async function payBookingBalance(bookingId: string, amount: number, guestName: string, clientId?: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert([{
    booking_id: bookingId,
    client_id: clientId || null,
    guest_name: guestName,
    amount: amount,
    method: "naqd",
    kind: "payment",
    note: "Qoldiq to'lov",
  }]);

  if (error) {
    throw new Error(`To'lov qo'shishda xatolik: ${error.message}`);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/reception");
  return { success: true };
}
