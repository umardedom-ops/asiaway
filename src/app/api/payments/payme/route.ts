import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { usdToTiyin } from "@/lib/payments";
import { notifyRole, fmtMoney } from "@/lib/telegram";

// Payme Merchant API (JSON-RPC 2.0) webhook.
// Payme kabinetida endpoint: https://<sayt>/api/payments/payme
// Auth: Basic base64("Paycom:<PAYME_KEY>")
//
// Holatlar (payment_state): 1 = yaratildi, 2 = to'landi, -1/-2 = bekor.

const ERR = {
  AUTH: { code: -32504, message: "Avtorizatsiya xatosi" },
  ORDER_NOT_FOUND: {
    code: -31050,
    message: { uz: "Bron topilmadi", ru: "Бронь не найдена", en: "Booking not found" },
    data: "booking_id",
  },
  WRONG_AMOUNT: {
    code: -31001,
    message: { uz: "Noto'g'ri summa", ru: "Неверная сумма", en: "Incorrect amount" },
    data: "amount",
  },
  TX_NOT_FOUND: {
    code: -31003,
    message: { uz: "Tranzaksiya topilmadi", ru: "Транзакция не найдена", en: "Transaction not found" },
    data: "transaction",
  },
  CANT_PERFORM: {
    code: -31008,
    message: { uz: "Amalni bajarib bo'lmaydi", ru: "Невозможно выполнить операцию", en: "Cannot perform operation" },
    data: "transaction",
  },
};

function rpcError(id: unknown, error: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, error });
}
function rpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  let body: { id?: unknown; method?: string; params?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    return rpcError(null, ERR.AUTH);
  }
  const id = body.id ?? null;

  // ---- Auth: Basic Paycom:<KEY> ----
  const auth = req.headers.get("authorization") || "";
  const expected =
    "Basic " + Buffer.from(`Paycom:${process.env.PAYME_KEY || ""}`).toString("base64");
  if (!process.env.PAYME_KEY || auth !== expected) {
    return rpcError(id, ERR.AUTH);
  }

  const supabase = serviceClient();
  const method = body.method || "";
  const params = body.params || {};
  const account = (params.account || {}) as Record<string, string>;

  // Bronni topish yordamchisi
  async function findBooking(bookingId: string | undefined) {
    if (!bookingId) return null;
    const { data } = await supabase
      .from("bookings")
      .select(
        "id, deposit_amount, fx_rate, deposit_status, booking_status, payment_transaction_id, payment_state, payment_created_ms, payment_perform_ms, payment_cancel_ms, payment_reason, guest_name"
      )
      .eq("id", bookingId)
      .maybeSingle();
    return data;
  }

  try {
    switch (method) {
      case "CheckPerformTransaction": {
        const booking = await findBooking(account.booking_id);
        if (!booking || booking.booking_status === "cancelled")
          return rpcError(id, ERR.ORDER_NOT_FOUND);
        if (booking.deposit_status === "paid") return rpcError(id, ERR.CANT_PERFORM);
        // AUDIT H7: bronga muzlatilgan kurs (fx_rate) ishlatiladi — kurs o'zgarsa ham
        // eski bronning to'lov summasi o'zgarmaydi.
        const expectedAmount = usdToTiyin(Number(booking.deposit_amount || 0), booking.fx_rate);
        if (Number(params.amount) !== expectedAmount)
          return rpcError(id, ERR.WRONG_AMOUNT);
        return rpcResult(id, { allow: true });
      }

      case "CreateTransaction": {
        const booking = await findBooking(account.booking_id);
        if (!booking || booking.booking_status === "cancelled")
          return rpcError(id, ERR.ORDER_NOT_FOUND);

        const txId = String(params.id);
        // Takroriy so'rov — mavjud tranzaksiyani qaytaramiz
        if (booking.payment_transaction_id === txId) {
          return rpcResult(id, {
            create_time: Number(booking.payment_created_ms),
            transaction: booking.id,
            state: Number(booking.payment_state) || 1,
          });
        }
        // Boshqa tranzaksiya band qilgan bo'lsa
        if (booking.payment_transaction_id && Number(booking.payment_state) === 1)
          return rpcError(id, ERR.CANT_PERFORM);

        // AUDIT H7: bronga muzlatilgan kurs (fx_rate) ishlatiladi — kurs o'zgarsa ham
        // eski bronning to'lov summasi o'zgarmaydi.
        const expectedAmount = usdToTiyin(Number(booking.deposit_amount || 0), booking.fx_rate);
        if (Number(params.amount) !== expectedAmount)
          return rpcError(id, ERR.WRONG_AMOUNT);

        const createTime = Date.now();
        await supabase
          .from("bookings")
          .update({
            payment_provider: "payme",
            payment_transaction_id: txId,
            payment_state: 1,
            payment_created_ms: createTime,
            paid_amount_tiyin: Number(params.amount),
          })
          .eq("id", booking.id);

        return rpcResult(id, {
          create_time: createTime,
          transaction: booking.id,
          state: 1,
        });
      }

      case "PerformTransaction": {
        const txId = String(params.id);
        const { data: booking } = await supabase
          .from("bookings")
          .select("id, payment_state, payment_perform_ms, deposit_amount, guest_name, guest_phone, apartment_id")
          .eq("payment_transaction_id", txId)
          .maybeSingle();
        if (!booking) return rpcError(id, ERR.TX_NOT_FOUND);

        // Takroriy so'rov
        if (Number(booking.payment_state) === 2) {
          return rpcResult(id, {
            transaction: booking.id,
            perform_time: Number(booking.payment_perform_ms),
            state: 2,
          });
        }
        if (Number(booking.payment_state) !== 1) return rpcError(id, ERR.CANT_PERFORM);

        const performTime = Date.now();
        await supabase
          .from("bookings")
          .update({
            payment_state: 2,
            payment_perform_ms: performTime,
            deposit_status: "paid",
            booking_status: "confirmed",
          })
          .eq("id", booking.id);

        // Kirim kassasiga yozuv
        await supabase.from("payments").insert([{
          booking_id: booking.id,
          guest_name: booking.guest_name,
          amount: Number(booking.deposit_amount || 0),
          method: "payme",
          kind: "deposit",
          note: "Sayt broni — zaklat (Payme tasdiqlandi)",
        }]);

        const { data: apt } = await supabase
          .from("apartments")
          .select("title")
          .eq("id", booking.apartment_id)
          .maybeSingle();

        await notifyRole(
          "menejer",
          `💳 <b>ZAKLAT TO'LANDI (Payme)</b>\n\n` +
            `🏠 ${apt?.title || "Apartament"}\n` +
            `👤 ${booking.guest_name} · ${booking.guest_phone || ""}\n` +
            `💰 ${fmtMoney(Number(booking.deposit_amount))} — bron TASDIQLANDI ✅`
        );

        return rpcResult(id, {
          transaction: booking.id,
          perform_time: performTime,
          state: 2,
        });
      }

      case "CancelTransaction": {
        const txId = String(params.id);
        const { data: booking } = await supabase
          .from("bookings")
          .select("id, payment_state, payment_cancel_ms")
          .eq("payment_transaction_id", txId)
          .maybeSingle();
        if (!booking) return rpcError(id, ERR.TX_NOT_FOUND);

        if (Number(booking.payment_state) < 0) {
          return rpcResult(id, {
            transaction: booking.id,
            cancel_time: Number(booking.payment_cancel_ms),
            state: Number(booking.payment_state),
          });
        }

        const cancelTime = Date.now();
        const newState = Number(booking.payment_state) === 2 ? -2 : -1;
        await supabase
          .from("bookings")
          .update({
            payment_state: newState,
            payment_cancel_ms: cancelTime,
            payment_reason: Number(params.reason) || null,
            deposit_status: newState === -2 ? "refunded" : "pending",
            booking_status: "cancelled",
          })
          .eq("id", booking.id);

        return rpcResult(id, {
          transaction: booking.id,
          cancel_time: cancelTime,
          state: newState,
        });
      }

      case "CheckTransaction": {
        const txId = String(params.id);
        const { data: booking } = await supabase
          .from("bookings")
          .select("id, payment_state, payment_created_ms, payment_perform_ms, payment_cancel_ms, payment_reason")
          .eq("payment_transaction_id", txId)
          .maybeSingle();
        if (!booking) return rpcError(id, ERR.TX_NOT_FOUND);
        return rpcResult(id, {
          create_time: Number(booking.payment_created_ms) || 0,
          perform_time: Number(booking.payment_perform_ms) || 0,
          cancel_time: Number(booking.payment_cancel_ms) || 0,
          transaction: booking.id,
          state: Number(booking.payment_state) || 0,
          reason: booking.payment_reason ?? null,
        });
      }

      case "GetStatement":
        return rpcResult(id, { transactions: [] });

      default:
        return rpcError(id, { code: -32601, message: "Metod topilmadi" });
    }
  } catch (e: unknown) {
    console.error("Payme webhook:", e);
    return rpcError(id, { code: -32400, message: "Ichki xatolik" });
  }
}
