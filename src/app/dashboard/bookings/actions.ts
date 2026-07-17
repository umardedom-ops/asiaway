"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { syncClientFromBooking, onBookingCompleted, onBookingCancelled } from "@/lib/clients-sync";
import { isMissingAttributionColumn } from "@/lib/attribution";
import { getDashDict } from "@/lib/dash-lang";
import { sendPurchaseForBooking } from "@/lib/meta-capi";

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
  source?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  utm_data?: any;
  notes?: string;
}

/** Server action natijasi — muvaffaqiyatda `id`, xatoda `error`. */
export type BookingResult =
  | { success: true; id?: string; error?: undefined }
  | { success: false; error: string; id?: undefined };

export async function createManualBooking(input: ManualBookingInput): Promise<BookingResult> {
  const d = await getDashDict();
  if (!input.apartment_id) return { success: false, error: d.errors.selectApt };
  if (!input.guest_name?.trim()) return { success: false, error: d.errors.enterName };
  if (!input.check_in || !input.check_out) return { success: false, error: d.errors.enterDates };

  const start = new Date(input.check_in);
  const end = new Date(input.check_out);
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (nights <= 0) return { success: false, error: d.errors.checkoutAfter };

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
    return { success: false, error: d.errors.datesBusy };
  }

  const bookingRow: Record<string, unknown> = {
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
    source: input.source || input.channel || "direct",
    utm_data: input.utm_data || null,
    notes: input.notes?.trim() || null,
  };

  let { data: newBooking, error } = await supabase.from("bookings").insert([bookingRow]).select("id").single();

  // DB'da source/utm_data/notes ustunlari hali yo'q bo'lsa (migratsiya RUN qilinmagan) — usiz qayta uring
  if (error && isMissingAttributionColumn(error.message)) {
    const { source: _s, utm_data: _u, notes: _n, ...fallbackRow } = bookingRow;
    void _s; void _u; void _n;
    ({ data: newBooking, error } = await supabase.from("bookings").insert([fallbackRow]).select("id").single());
  }

  if (error) {
    // DB'даги no_double_booking (EXCLUDE) cheklovi — race condition'ni bazaning o'zi to'sadi
    if (error.code === "23P01" || /no_double_booking|exclusion/i.test(error.message)) {
      return { success: false, error: d.errors.datesBusy };
    }
    return { success: false, error: error.message };
  }

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

  // Meta CAPI — darhol tasdiqlangan bron uchun Purchase (dedup ichkarida)
  if (newBooking?.id && (input.booking_status === "confirmed" || !input.booking_status)) {
    await sendPurchaseForBooking(newBooking.id as string);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/cashflow");
  revalidatePath("/dashboard");
  // id qaytariladi — placeGuestNow uni ism bo'yicha qidirmasligi uchun (audit M1)
  return { success: true, id: newBooking?.id as string | undefined };
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
  if (error) {
    const d = await getDashDict();
    throw new Error(`${d.errors.statusUpdate}: ${error.message}`);
  }

  // Mijoz bosqichi → "staying" (yashamoqda)
  if (bk?.guest_phone) {
    await supabase
      .from("clients")
      .update({ stage: "staying" })
      .eq("phone", bk.guest_phone.trim());
  }

  // Pending bron check-in bilan confirmed bo'ldi — Purchase (dedup ichkarida)
  if (bk && bk.booking_status !== "confirmed") {
    await sendPurchaseForBooking(id);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// Walk-in: mehmonni HOZIR joylashtirish (bron + check-in bir amalda)
export async function placeGuestNow(input: ManualBookingInput): Promise<BookingResult> {
  const res = await createManualBooking({ ...input, booking_status: "confirmed" });
  if (!res.success) return res;

  // AUDIT M1: avval bron ism bo'yicha qidirilardi — bir xil ismli ikki mehmon bo'lsa
  // NOTO'G'RI bron check-in bo'lardi. Endi createManualBooking qaytargan aniq id ishlatiladi.
  const bookingId = res.id;
  if (!bookingId) {
    return { success: false, error: "Bron yaratildi, lekin joylashtirib bo'lmadi (id yo'q)" };
  }

  const supabase = await createClient();
  await supabase
    .from("bookings")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (input.guest_phone) {
    await supabase.from("clients").update({ stage: "staying" }).eq("phone", input.guest_phone.trim());
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
    .select("booking_status, apartment_id, guest_name, guest_phone, check_in, check_out, nights, total_price, apartments(price_per_day)")
    .eq("id", id)
    .maybeSingle();

  const patch: Record<string, unknown> = { booking_status: status };

  // AUDIT M3 — CHECKOUT AVTO-HISOB
  // Avval faqat total_price === 0 bo'lgandagina hisoblanardi. Endi:
  //  - mehmon rejadan KECH chiqsa (bugun > check_out) → haqiqiy kunlar bo'yicha qayta hisob
  //  - narx umuman qo'yilmagan bo'lsa → nights × price_per_day
  if (status === "completed" && prev) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apt: any = Array.isArray(prev.apartments) ? prev.apartments[0] : prev.apartments;
    const perNight = Number(apt?.price_per_day || 0);
    const today = new Date().toISOString().split("T")[0];

    // Haqiqiy chiqish sanasi: rejadagi check_out yoki bugun (agar kech chiqsa)
    const actualOut = today > String(prev.check_out) ? today : String(prev.check_out);
    const actualNights = Math.max(
      1,
      Math.round(
        (new Date(actualOut).getTime() - new Date(String(prev.check_in)).getTime()) / 86400000
      )
    );

    if (perNight > 0) {
      const recalculated = actualNights * perNight;
      const current = Number(prev.total_price || 0);

      // Narx yo'q, YOKI mehmon rejadan ko'p turgan (qo'shimcha kecha) → to'g'rilaymiz.
      // Menejer qo'lda kelishilgan chegirmali narx qo'ygan bo'lsa (0 < current < hisob) — TEGMAYMIZ.
      if (current === 0 || actualNights > Number(prev.nights || 0)) {
        patch.total_price = recalculated;
        patch.nights = actualNights;
        patch.check_out = actualOut;
      }
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", id);

  if (error) {
    const d = await getDashDict();
    throw new Error(`${d.errors.statusUpdate}: ${error.message}`);
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

  // Status confirmed bo'lganda Meta CAPI'ga Purchase (dedup ichkarida)
  if (status === "confirmed" && prev && prev.booking_status !== "confirmed") {
    await sendPurchaseForBooking(id);
  }

  // AUDIT M5 — bron BEKOR qilinsa mijoz statistikasi (LTV) qaytariladi.
  // Avval faqat oshirilardi, hech qachon kamaymasdi → soxta LTV.
  if (status === "cancelled" && prev && prev.booking_status !== "cancelled") {
    await onBookingCancelled(supabase, {
      guest_phone: prev.guest_phone,
      total_price: prev.total_price,
    });
    revalidatePath("/dashboard/clients");
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
    const d = await getDashDict();
    throw new Error(`${d.errors.depositUpdate}: ${error.message}`);
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
