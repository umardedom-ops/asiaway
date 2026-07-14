import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOwnerPaymentReminders } from "@/lib/owner-reminders";

// Egalarga arenda to'lov eslatmasini QO'LDA ishga tushirish (odatda cron qiladi).
// Ochish: /api/telegram/test-owner
// Natijada nechta eslatma shef botiga ketgani ko'rinadi.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Supabase service kaliti yo'q" }, { status: 500 });
  }

  const supabase = createClient(url, key);

  // Diagnostika: qaysi apartamentlar eslatmaga tushishi kerak
  const { data: apts } = await supabase
    .from("apartments")
    .select("title, monthly_lease_cost, lease_payment_day, lease_last_paid_period, status")
    .eq("status", "active");

  const nowTk = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const period = `${nowTk.getUTCFullYear()}-${String(nowTk.getUTCMonth() + 1).padStart(2, "0")}`;
  const todayDay = nowTk.getUTCDate();

  const nomzodlar = (apts || []).map((a) => ({
    apartament: a.title,
    oylik: a.monthly_lease_cost,
    tolov_kuni: a.lease_payment_day,
    shu_oy_tolangan: a.lease_last_paid_period === period,
    sabab:
      !a.lease_payment_day ? "to'lov kuni kiritilmagan"
      : Number(a.monthly_lease_cost || 0) <= 0 ? "oylik summa 0"
      : a.lease_last_paid_period === period ? "shu oy allaqachon to'langan"
      : "eslatmaga tushadi (agar 3 kundan kam qolgan bo'lsa)",
  }));

  const sent = await sendOwnerPaymentReminders(supabase);

  return NextResponse.json({
    yuborilgan_eslatmalar: sent,
    bugun: `${todayDay}-kun, davr: ${period}`,
    izoh:
      sent > 0
        ? "Shef botiga eslatma yuborildi ✅"
        : "Hech qanday eslatma yuborilmadi — pastdagi 'nomzodlar' ro'yxatidagi sabablarni ko'ring. Eslatma faqat to'lov kuniga 3 kun qolganda (yoki kechikkanda) yuboriladi.",
    nomzodlar,
  });
}
