// Egaga oylik to'lov eslatmalari — shef botiga [✅ To'landi] tugmasi bilan.
// Ikkala kunlik cron'dan chaqiriladi (check-expiring 14:00 + daily-report 21:00
// Toshkent) = kuniga 2 mahal eslatma. Tugma bosilgach (webhook `leasepaid:`)
// apartments.lease_last_paid_period = joriy davr bo'ladi va eslatma to'xtaydi.
//
// Qoidalar:
//  - 3 kun oldin boshlanadi (3, 2, 1, 0 kun qolganda), to'lanmagan bo'lsa
//    to'lov kunidan KEYIN ham "KECHIKDI" deb davom etadi (oy oxirigacha).
//  - Qisqa oylarda 31 → oy oxirgi kuni.

import { notifyRole, fmtMoney } from "@/lib/telegram";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;

export async function sendOwnerPaymentReminders(supabase: SB): Promise<number> {
  let sent = 0;
  try {
    const { data: apts } = await supabase
      .from("apartments")
      .select(
        "id, title, monthly_lease_cost, owner_name, owner_phone, lease_payment_day, lease_last_paid_period"
      )
      .eq("status", "active")
      .gt("monthly_lease_cost", 0)
      .not("lease_payment_day", "is", null);

    if (!apts || apts.length === 0) return 0;

    // Toshkent vaqti (UTC+5)
    const nowTk = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const y = nowTk.getUTCFullYear();
    const m = nowTk.getUTCMonth(); // 0-11
    const todayDay = nowTk.getUTCDate();
    const daysInThisMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const period = `${y}-${String(m + 1).padStart(2, "0")}`; // 'YYYY-MM'

    for (const apt of apts) {
      // Shu oy uchun allaqachon to'langan bo'lsa — jim
      if (apt.lease_last_paid_period === period) continue;

      const effDay = Math.min(Number(apt.lease_payment_day), daysInThisMonth);
      const daysUntil = effDay - todayDay; // manfiy = kechikkan

      let label: string | null = null;
      if (daysUntil > 3) continue; // hali erta
      else if (daysUntil > 0) label = `🔔 ${daysUntil} kun qoldi`;
      else if (daysUntil === 0) label = "📌 BUGUN to'lov kuni";
      else label = `🚨 KECHIKDI! (${Math.abs(daysUntil)} kun o'tdi)`;

      await notifyRole(
        "shef",
        `💵 <b>EGAGA TO'LOV</b> — ${label}\n\n` +
          `🏠 <b>${apt.title}</b>\n` +
          `💰 Summa: ${fmtMoney(Number(apt.monthly_lease_cost))}\n` +
          `👤 Ega: ${apt.owner_name || "-"}\n` +
          `📞 Tel: ${apt.owner_phone || "-"}\n` +
          `📅 To'lov kuni: har oyning ${apt.lease_payment_day}-sanasi\n\n` +
          `To'lov qilingach tugmani bosing — eslatma to'xtaydi va summa Moliya'ga xarajat bo'lib tushadi.`,
        [[{ text: "✅ To'landi", callback_data: `leasepaid:${apt.id}:${period}` }]]
      );
      sent++;
    }
  } catch (e) {
    console.error("sendOwnerPaymentReminders:", e);
  }
  return sent;
}
