import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyRole, fmtMoney } from "@/lib/telegram";
import { sendOwnerPaymentReminders } from "@/lib/owner-reminders";

// Shef uchun kunlik moliyaviy Z-HISOBOT — Vercel Cron
// (vercel.json: 59 18 * * * UTC = 23:59 Toshkent).
// Kun chegaralari Toshkent vaqti (UTC+5) bo'yicha hisoblanadi.

const TZ_OFFSET_MS = 5 * 60 * 60 * 1000; // Asia/Tashkent = UTC+5

const METHOD_LABELS: Record<string, string> = {
  naqd: "Naqd",
  karta: "Karta",
  payme: "Payme",
  click: "Click",
  otkazma: "O'tkazma",
  boshqa: "Boshqa",
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Toshkent bo'yicha "bugun" va kun chegaralari
    const today = new Date(Date.now() + TZ_OFFSET_MS).toISOString().split("T")[0];
    const dayStart = `${today}T00:00:00+05:00`;
    const dayEnd = `${today}T23:59:59.999+05:00`;

    const [
      { data: paymentsToday },
      { data: newBookings },
      { data: checkoutsToday },
      { data: expensesToday },
      { data: activeBookings },
      { data: apartmentsData },
      { count: newLeadsCount },
    ] = await Promise.all([
      // Bugun kassaga tushgan pullar (haqiqiy kirim)
      supabase
        .from("payments")
        .select("amount, method, kind")
        .gte("paid_at", dayStart)
        .lte("paid_at", dayEnd),
      // Bugun yaratilgan bronlar
      supabase
        .from("bookings")
        .select("total_price, deposit_amount, booking_status")
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd),
      // Bugun chiqib ketganlar (checkout)
      supabase
        .from("bookings")
        .select("id, total_price")
        .eq("booking_status", "completed")
        .eq("check_out", today),
      // Bugungi xarajatlar
      supabase
        .from("expenses")
        .select("amount, category")
        .eq("spent_on", today),
      // Hozir yashab turganlar (bandlik)
      supabase
        .from("bookings")
        .select("apartment_id")
        .eq("booking_status", "confirmed")
        .lte("check_in", today)
        .gt("check_out", today),
      supabase
        .from("apartments")
        .select("id, kanban_status")
        .eq("status", "active"),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd),
    ]);

    // ---- KIRIM (payments) — usul kesimida
    const pays = paymentsToday || [];
    const incomeTotal = pays
      .filter((p) => p.kind !== "refund")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const refundTotal = pays
      .filter((p) => p.kind === "refund")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const byMethod = new Map<string, number>();
    for (const p of pays) {
      if (p.kind === "refund") continue;
      const key = p.method || "boshqa";
      byMethod.set(key, (byMethod.get(key) || 0) + Number(p.amount || 0));
    }
    const methodLines = [...byMethod.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([m, v]) => `   · ${METHOD_LABELS[m] || m}: ${fmtMoney(v)}`)
      .join("\n");

    // ---- Bronlar / checkout / xarajat
    const bookingsToday = (newBookings || []).filter((b) => b.booking_status !== "cancelled");
    const bookedSum = bookingsToday.reduce((s, b) => s + Number(b.total_price || 0), 0);
    const checkouts = checkoutsToday || [];
    const expenseTotal = (expensesToday || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    const netCash = incomeTotal - refundTotal - expenseTotal;

    // ---- Bandlik va xonalar holati
    const occupiedCount = new Set((activeBookings || []).map((b) => b.apartment_id)).size;
    const activeApts = apartmentsData || [];
    const totalApts = activeApts.length;
    const dirtyCount = activeApts.filter(
      (a) => a.kanban_status === "dirty" || a.kanban_status === "cleaning"
    ).length;
    const cleanCount = totalApts - dirtyCount;
    const occupancy = totalApts > 0 ? Math.round((occupiedCount / totalApts) * 100) : 0;

    const message =
      `🧾 <b>Z-HISOBOT — ${today}</b>\n\n` +
      `💵 <b>Kunlik kirim (kassa): ${fmtMoney(incomeTotal)}</b>\n` +
      (methodLines ? `${methodLines}\n` : "") +
      (refundTotal > 0 ? `↩️ Qaytarilgan: ${fmtMoney(refundTotal)}\n` : "") +
      `📉 Kunlik xarajat: ${fmtMoney(expenseTotal)}\n` +
      `💰 <b>Sof kassa: ${fmtMoney(netCash)}</b>\n\n` +
      `🆕 Yangi bronlar: ${bookingsToday.length} ta (${fmtMoney(bookedSum)})\n` +
      `🚪 Bugungi checkoutlar: ${checkouts.length} ta\n` +
      `🏠 Bandlik: ${occupiedCount}/${totalApts} xona (${occupancy}%)\n` +
      `🧹 Xonalar: ${cleanCount} ta toza · ${dirtyCount} ta tozalash kutmoqda\n` +
      `📞 Yangi murojaatlar (lead): ${newLeadsCount || 0} ta`;

    await notifyRole("shef", message);

    // Egaga to'lov eslatmasi — kun yakunida
    const ownerReminders = await sendOwnerPaymentReminders(supabase);

    return NextResponse.json({
      success: true,
      today,
      incomeTotal,
      expenseTotal,
      netCash,
      occupancy,
      ownerReminders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
