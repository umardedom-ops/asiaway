import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyRole, fmtMoney } from "@/lib/telegram";
import { sendOwnerPaymentReminders } from "@/lib/owner-reminders";

// Shef uchun kunlik hisobot — Vercel Cron (vercel.json: 0 16 * * * = 21:00 Toshkent).
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

    const today = new Date().toISOString().split("T")[0];

    const [
      { data: newBookings },
      { data: activeBookings },
      { count: apartmentsCount },
      { count: newLeadsCount },
    ] = await Promise.all([
      // Bugun yaratilgan bronlar
      supabase
        .from("bookings")
        .select("total_price, deposit_amount, booking_status")
        .gte("created_at", `${today}T00:00:00Z`),
      // Hozir yashab turgan mehmonlar (bugun ichida bo'lgan confirmed bronlar)
      supabase
        .from("bookings")
        .select("apartment_id")
        .eq("booking_status", "confirmed")
        .lte("check_in", today)
        .gt("check_out", today),
      supabase
        .from("apartments")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00Z`),
    ]);

    const bookingsToday = newBookings || [];
    const revenueToday = bookingsToday
      .filter((b) => b.booking_status !== "cancelled")
      .reduce((s, b) => s + Number(b.total_price || 0), 0);
    const depositsToday = bookingsToday
      .filter((b) => b.booking_status !== "cancelled")
      .reduce((s, b) => s + Number(b.deposit_amount || 0), 0);

    const occupiedCount = new Set(
      (activeBookings || []).map((b) => b.apartment_id)
    ).size;
    const totalApts = apartmentsCount || 0;
    const occupancy =
      totalApts > 0 ? Math.round((occupiedCount / totalApts) * 100) : 0;

    const message =
      `📊 <b>KUNLIK HISOBOT — ${today}</b>\n\n` +
      `🆕 Yangi bronlar: ${bookingsToday.length} ta\n` +
      `💰 Bugungi bronlar summasi: ${fmtMoney(revenueToday)}\n` +
      `🏦 Zaklatlar: ${fmtMoney(depositsToday)}\n` +
      `🏠 Bandlik: ${occupiedCount}/${totalApts} xona (${occupancy}%)\n` +
      `📞 Yangi murojaatlar (lead): ${newLeadsCount || 0} ta`;

    await notifyRole("shef", message);

    // Egaga to'lov eslatmasi — kunning 2-mahali (kechki 21:00 Toshkent)
    const ownerReminders = await sendOwnerPaymentReminders(supabase);

    return NextResponse.json({ success: true, occupancy, revenueToday, ownerReminders });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
