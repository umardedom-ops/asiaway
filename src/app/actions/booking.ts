"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { syncClientFromBooking } from "@/lib/clients-sync";
import { notifyRole, fmtMoney, fmtDate } from "@/lib/telegram";
import { paymentConfigured, buildCheckoutUrl, currentFxRate } from "@/lib/payments";

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
    // 0. Eski to'lanmagan (2 soatdan oshgan) sayt bronlarini bekor qilamiz —
    // sanalarni abadiy band qilib qolmasin.
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("bookings")
      .update({ booking_status: "cancelled" })
      .eq("apartment_id", input.apartment_id)
      .eq("booking_status", "pending")
      .eq("deposit_status", "pending")
      .not("payment_provider", "is", null)
      .lt("created_at", twoHoursAgo);

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

    // 2. Yangi bron yaratish.
    // Real to'lov rejimi (Payme/Click env sozlangan): bron 'pending' bo'lib turadi,
    // webhook to'lovni tasdiqlagach 'paid'+'confirmed' bo'ladi.
    // Simulate rejim (env yo'q): hozirgidek darhol tasdiqlanadi.
    const realPayment = paymentConfigured(input.payment_method);

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
          deposit_status: realPayment ? "pending" : "paid",
          booking_status: realPayment ? "pending" : "confirmed",
          payment_provider: realPayment ? input.payment_method : "simulate",
          // AUDIT H7: valyuta kursini bronga MUZLATAMIZ — kurs keyin o'zgarsa ham
          // bu bronning to'lov summasi o'zgarmaydi.
          fx_rate: currentFxRate(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      // AUDIT H1: DB'даги no_double_booking (EXCLUDE) cheklovi
      if (
        (insertError as { code?: string }).code === "23P01" ||
        /no_double_booking|exclusion/i.test(insertError.message)
      ) {
        return {
          success: false,
          error: "Kechirasiz, ushbu sanalarda apartament band qilingan. Boshqa sanalarni tanlang.",
        };
      }
      throw insertError;
    }

    // Real rejimda checkout havolasini qaytaramiz
    const paymentUrl = realPayment
      ? buildCheckoutUrl(input.payment_method, newBooking.id, input.deposit_amount)
      : null;

    // Menejer botiga yangi bron xabari
    const { data: apt } = await supabase
      .from("apartments")
      .select("title")
      .eq("id", input.apartment_id)
      .maybeSingle();
    await notifyRole(
      "menejer",
      (lang: string) => {
        const isRu = lang === "ru";
        const title = isRu ? "🔔 <b>НОВАЯ БРОНЬ (сайт)</b>" : "🔔 <b>YANGI BRON (sayt)</b>";
        const aptTitle = apt?.title || (isRu ? "Апартамент" : "Apartament");
        const dates = `${fmtDate(input.check_in)} → ${fmtDate(input.check_out)} (${input.nights} ${isRu ? "ночей" : "kecha"})`;
        const amounts = isRu 
          ? `💰 Итого: ${fmtMoney(input.total_price)} · Аванс: ${fmtMoney(input.deposit_amount)}`
          : `💰 Jami: ${fmtMoney(input.total_price)} · Zaklat: ${fmtMoney(input.deposit_amount)}`;
        const payMethod = isRu ? `💳 Оплата: ${input.payment_method}` : `💳 To'lov: ${input.payment_method}`;
        const wait = realPayment ? (isRu ? "\n⏳ Ожидается оплата аванса..." : "\n⏳ Zaklat to'lovi kutilmoqda...") : "";

        return {
          text: `${title}\n\n🏠 ${aptTitle}\n👤 ${input.guest_name}\n📞 ${input.guest_phone}\n📅 ${dates}\n${amounts}\n${payMethod}${wait}`
        };
      }
    );

    // Mijozни (mehmonни) avtomatik sinxronlash
    const client = await syncClientFromBooking(supabase, {
      name: input.guest_name,
      phone: input.guest_phone,
      email: input.guest_email,
      channel: "direct",
      amount: input.total_price,
    });

    // Simulyatsiya rejimida zaklat darhol "to'langan" → kirim kassasiga yozamiz.
    // Real rejimda to'lov webhook orqali tasdiqlangач alohida yoziladi.
    if (!realPayment && (input.deposit_amount || 0) > 0) {
      await supabase.from("payments").insert([{
        booking_id: newBooking.id,
        client_id: client?.id || null,
        guest_name: input.guest_name,
        amount: input.deposit_amount,
        method: input.payment_method,
        kind: "deposit",
        note: "Sayt broni — zaklat (onlayn)",
      }]);
    }

    // Cache tozalash
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");
    
    return {
      success: true,
      booking: newBooking,
      paymentUrl,
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
