import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyRole, fmtMoney } from "@/lib/telegram";

// Vercel Cron orqali kunda 2 marta chaqiriladi (09:00 va 21:00)
// Vercel dashboardida konfiguratsiya qilinadi: 0 9,21 * * *
export async function GET(req: Request) {
  try {
    // Cron requestlarni tekshirish (auth header)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Bugungi sana + 3 kun
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);
    const targetDateStr = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    // 3 kundan keyin tugaydigan bronlarni olish
    const { data: expiringBookings, error } = await supabase
      .from('bookings')
      .select('id, check_out, apartments(title, monthly_lease_cost, owner_phone)')
      .eq('booking_status', 'confirmed')
      // Faqat kuniga to'g'ri keladiganlarni olamiz (vaqtni hisobga olmasdan)
      .gte('check_out', `${targetDateStr}T00:00:00Z`)
      .lt('check_out', `${targetDateStr}T23:59:59Z`);

    if (error) throw error;

    const botToken = process.env.TELEGRAM_BOT_SHEF_TOKEN;

    if (!botToken) {
      return NextResponse.json({ message: "Telegram bot sozlanmagan" }, { status: 500 });
    }

    const { data: subscribers } = await supabase
      .from('bot_subscribers')
      .select('chat_id')
      .eq('role', 'shef');

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: "Hech qanday Shef ulanmagan" }, { status: 200 });
    }

    let messagesSent = 0;

    for (const booking of expiringBookings || []) {
      const apt = Array.isArray(booking.apartments) ? booking.apartments[0] : booking.apartments;
      if (!apt) continue;

      const message = `⚠️ Diqqat! ${apt.title} ijarasi tugashiga 3 kun qoldi.\n\nUshbu apartament uchun tan narx: ${apt.monthly_lease_cost}$, Egasi raqami: ${apt.owner_phone || "Mavjud emas"}.\nBronni yopishingiz (uzaytirishingiz) kerak!`;

      for (const sub of subscribers) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sub.chat_id,
            text: message
          })
        });
        messagesSent++;
      }
    }

    // ================================================================
    // EGA'GA OYLIK TO'LOV ESLATMASI (biznes poydevori — o'z vaqtida to'lash)
    // Har apartamentda lease_payment_day (oyning sanasi) bo'lsa:
    // 3 kun oldin, 1 kun oldin va to'lov kunida shef botiga eslatma.
    // ================================================================
    let ownerReminders = 0;
    const { data: aptsWithDay } = await supabase
      .from("apartments")
      .select("title, monthly_lease_cost, owner_name, owner_phone, lease_payment_day")
      .eq("status", "active")
      .gt("monthly_lease_cost", 0)
      .not("lease_payment_day", "is", null);

    if (aptsWithDay && aptsWithDay.length > 0) {
      // Toshkent vaqti (UTC+5) bo'yicha bugungi sana
      const nowTk = new Date(Date.now() + 5 * 60 * 60 * 1000);
      const y = nowTk.getUTCFullYear();
      const m = nowTk.getUTCMonth(); // 0-11
      const todayDay = nowTk.getUTCDate();
      const daysInThisMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const daysInNextMonth = new Date(Date.UTC(y, m + 2, 0)).getUTCDate();

      for (const apt of aptsWithDay) {
        const day = Number(apt.lease_payment_day);
        // Fevral kabi qisqa oylarda 31 → oy oxiri
        const effThis = Math.min(day, daysInThisMonth);
        const effNext = Math.min(day, daysInNextMonth);
        // Keyingi to'lov sanasigacha necha kun qoldi
        const daysUntil =
          effThis >= todayDay
            ? effThis - todayDay
            : daysInThisMonth - todayDay + effNext;

        let label: string | null = null;
        if (daysUntil === 0) label = "📌 BUGUN";
        else if (daysUntil === 1) label = "⏰ ERTAGA";
        else if (daysUntil === 3) label = "🔔 3 kundan keyin";
        if (!label) continue;

        await notifyRole(
          "shef",
          `💵 <b>EGAGA TO'LOV ESLATMASI</b>\n\n` +
            `${label} — <b>${apt.title}</b> egasiga oylik to'lash kerak.\n\n` +
            `💰 Summa: ${fmtMoney(Number(apt.monthly_lease_cost))}\n` +
            `👤 Ega: ${apt.owner_name || "-"}\n` +
            `📞 Tel: ${apt.owner_phone || "-"}\n` +
            `📅 To'lov kuni: har oyning ${day}-sanasi`
        );
        ownerReminders++;
      }
    }

    return NextResponse.json({ success: true, messagesSent, ownerReminders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
