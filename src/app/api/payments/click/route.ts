import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { usdToTiyin } from "@/lib/payments";
import { notifyRole, fmtMoney } from "@/lib/telegram";

// Click SHOP-API webhook (prepare + complete bitta endpointda, action bo'yicha).
// Click kabinetida Prepare URL va Complete URL: https://<sayt>/api/payments/click
// sign_string = md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id +
//                   (complete'da: merchant_prepare_id) + amount + action + sign_time)

const CLICK_ERRORS = {
  OK: 0,
  SIGN_FAILED: -1,
  INVALID_AMOUNT: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_PAID: -4,
  USER_NOT_FOUND: -5, // booking topilmadi
  TX_NOT_FOUND: -6,
  BAD_REQUEST: -8,
} as const;

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function md5(s: string) {
  return crypto.createHash("md5").update(s).digest("hex");
}

export async function POST(req: Request) {
  // Click x-www-form-urlencoded yuboradi
  const raw = await req.text();
  const p = new URLSearchParams(raw);

  const clickTransId = p.get("click_trans_id") || "";
  const serviceId = p.get("service_id") || "";
  const merchantTransId = p.get("merchant_trans_id") || ""; // booking_id
  const merchantPrepareId = p.get("merchant_prepare_id") || "";
  const amount = p.get("amount") || "0";
  const action = p.get("action") || ""; // 0 = prepare, 1 = complete
  const error = p.get("error") || "0";
  const signTime = p.get("sign_time") || "";
  const signString = p.get("sign_string") || "";

  const secret = process.env.CLICK_SECRET_KEY || "";

  const respond = (obj: Record<string, unknown>) =>
    NextResponse.json({
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      ...obj,
    });

  // ---- Imzo tekshiruvi ----
  const signBase =
    action === "1"
      ? `${clickTransId}${serviceId}${secret}${merchantTransId}${merchantPrepareId}${amount}${action}${signTime}`
      : `${clickTransId}${serviceId}${secret}${merchantTransId}${amount}${action}${signTime}`;

  if (!secret || md5(signBase) !== signString) {
    return respond({ error: CLICK_ERRORS.SIGN_FAILED, error_note: "Imzo noto'g'ri" });
  }

  const supabase = serviceClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, deposit_amount, fx_rate, deposit_status, booking_status, payment_transaction_id, payment_state, guest_name, guest_phone, apartment_id"
    )
    .eq("id", merchantTransId)
    .maybeSingle();

  if (!booking || booking.booking_status === "cancelled") {
    return respond({ error: CLICK_ERRORS.USER_NOT_FOUND, error_note: "Bron topilmadi" });
  }

  // Summani tekshirish (Click so'mda yuboradi)
  // AUDIT H7: bronga muzlatilgan kurs (fx_rate)
  const expectedSum = usdToTiyin(Number(booking.deposit_amount || 0), booking.fx_rate) / 100;
  if (Math.abs(Number(amount) - expectedSum) > 0.01) {
    return respond({ error: CLICK_ERRORS.INVALID_AMOUNT, error_note: "Summa noto'g'ri" });
  }

  // ---- PREPARE ----
  if (action === "0") {
    if (booking.deposit_status === "paid") {
      return respond({ error: CLICK_ERRORS.ALREADY_PAID, error_note: "Allaqachon to'langan" });
    }
    await supabase
      .from("bookings")
      .update({
        payment_provider: "click",
        payment_transaction_id: clickTransId,
        payment_state: 1,
        payment_created_ms: Date.now(),
      })
      .eq("id", booking.id);

    return respond({
      merchant_prepare_id: booking.id,
      error: CLICK_ERRORS.OK,
      error_note: "Success",
    });
  }

  // ---- COMPLETE ----
  if (action === "1") {
    // Click tomondan xato kelgan bo'lsa — bekor
    if (Number(error) < 0) {
      await supabase
        .from("bookings")
        .update({
          payment_state: -1,
          payment_cancel_ms: Date.now(),
          booking_status: "cancelled",
        })
        .eq("id", booking.id);
      return respond({ error: CLICK_ERRORS.OK, error_note: "Cancelled" });
    }

    if (booking.deposit_status === "paid") {
      return respond({
        merchant_confirm_id: booking.id,
        error: CLICK_ERRORS.OK,
        error_note: "Already paid",
      });
    }

    await supabase
      .from("bookings")
      .update({
        payment_state: 2,
        payment_perform_ms: Date.now(),
        deposit_status: "paid",
        booking_status: "confirmed",
        paid_amount_tiyin: Math.round(Number(amount) * 100),
      })
      .eq("id", booking.id);

    // Kirim kassasiga yozuv
    await supabase.from("payments").insert([{
      booking_id: booking.id,
      guest_name: booking.guest_name,
      amount: Number(booking.deposit_amount || 0),
      method: "click",
      kind: "deposit",
      note: "Sayt broni — zaklat (Click tasdiqlandi)",
    }]);

    const { data: apt } = await supabase
      .from("apartments")
      .select("title")
      .eq("id", booking.apartment_id)
      .maybeSingle();

    await notifyRole(
      "menejer",
      `💳 <b>ZAKLAT TO'LANDI (Click)</b>\n\n` +
        `🏠 ${apt?.title || "Apartament"}\n` +
        `👤 ${booking.guest_name} · ${booking.guest_phone || ""}\n` +
        `💰 ${fmtMoney(Number(booking.deposit_amount))} — bron TASDIQLANDI ✅`
    );

    return respond({
      merchant_confirm_id: booking.id,
      error: CLICK_ERRORS.OK,
      error_note: "Success",
    });
  }

  return respond({ error: CLICK_ERRORS.ACTION_NOT_FOUND, error_note: "Noma'lum action" });
}
