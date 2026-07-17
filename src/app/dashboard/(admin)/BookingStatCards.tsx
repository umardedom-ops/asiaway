import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { D, type Lang } from "@/lib/i18n";
import { CalendarClock, LogIn, BedDouble, LogOut } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

/**
 * 4 ta bron holati tablo kartasi — istalgan sahifada import qilib ishlatish mumkin.
 * Server Component — Supabase'dan o'zi ma'lumot oladi.
 */
export default async function BookingStatCards() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, booking_status, checked_in_at")
    .neq("booking_status", "cancelled");

  const rows = bookings ?? [];

  // BUG FIX: avval faqat "confirmed" bron sanalardi — "pending" bron (qo'lda
  // kiritilgan yoki saytdan kelgan, hali tasdiqlanmagan) HECH QAYERDA ko'rinmasdi.
  // Endi joylashish holatiga (checked_in_at) asoslanamiz — har bron aniq bitta
  // kartada sanaladi.
  const notDone = rows.filter((b) => b.booking_status !== "completed");

  // Забронировали = bron qilingan, hali joylashmagan, kelish kuni bugun EMAS
  // (kelajak yoki kechikkan) — pending ham, confirmed ham
  const bookedCount = notDone.filter((b) => !b.checked_in_at && b.check_in !== today).length;
  // Bugun keladi = hali joylashmagan, kelish kuni bugun
  const arrivingToday = notDone.filter((b) => !b.checked_in_at && b.check_in === today).length;
  // Hozir turibdi = joylashtirilgan (checked_in_at bor)
  const stayingCount = notDone.filter((b) => b.checked_in_at).length;
  // Chiqib ketgan = yakunlangan
  const leftCount = rows.filter((b) => b.booking_status === "completed").length;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title={d.statCards.booked} value={`${bookedCount} ${d.home.ta}`} icon={<CalendarClock className="h-4 w-4 text-[#C5A46D]" />} sub={d.statCards.comingLater} valueClass="text-[#C5A46D]" />
      <StatCard title={d.statCards.arrivesToday} value={`${arrivingToday} ${d.home.ta}`} icon={<LogIn className="h-4 w-4 text-emerald-400" />} sub={d.statCards.todayArrivals} valueClass="text-emerald-400" />
      <StatCard title={d.statCards.stayingNow} value={`${stayingCount} ${d.home.ta}`} icon={<BedDouble className="h-4 w-4 text-purple-300" />} sub={d.statCards.living} valueClass="text-purple-300" />
      <StatCard title={d.statCards.checkedOut} value={`${leftCount} ${d.home.ta}`} icon={<LogOut className="h-4 w-4 text-[#A8A49B]" />} sub={d.statCards.finished} valueClass="text-[#A8A49B]" />
    </div>
  );
}
