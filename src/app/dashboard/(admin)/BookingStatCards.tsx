import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, LogIn, BedDouble, LogOut } from "lucide-react";

/**
 * 4 ta bron holati tablo kartasi — istalgan sahifada import qilib ishlatish mumkin.
 * Server Component — Supabase'dan o'zi ma'lumot oladi.
 */
export default async function BookingStatCards() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, booking_status")
    .neq("booking_status", "cancelled");

  const rows = bookings ?? [];

  const bookedCount = rows.filter((b) => b.booking_status === "confirmed" && b.check_in > today).length;
  const arrivingToday = rows.filter((b) => b.booking_status === "confirmed" && b.check_in === today).length;
  const stayingCount = rows.filter((b) => b.booking_status === "confirmed" && b.check_in <= today && b.check_out > today).length;
  const leftCount = rows.filter((b) => b.booking_status === "completed").length;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Bron qilganlar" value={`${bookedCount} ta`} icon={<CalendarClock className="h-4 w-4 text-[#C5A46D]" />} sub="Kelgusida keladi" color="text-[#C5A46D]" />
      <StatCard title="Bugun keladi" value={`${arrivingToday} ta`} icon={<LogIn className="h-4 w-4 text-emerald-400" />} sub="Bugungi kelishlar" color="text-emerald-400" />
      <StatCard title="Hozir turibdi" value={`${stayingCount} ta`} icon={<BedDouble className="h-4 w-4 text-purple-300" />} sub="Yashayotganlar" color="text-purple-300" />
      <StatCard title="Chiqib ketgan" value={`${leftCount} ta`} icon={<LogOut className="h-4 w-4 text-[#A8A49B]" />} sub="Yakunlangan" color="text-[#A8A49B]" />
    </div>
  );
}

function StatCard({ title, value, icon, sub, color }: { title: string; value: string; icon: React.ReactNode; sub: string; color: string }) {
  return (
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-[28px] font-medium ${color}`}>{value}</div>
        <p className="text-[12px] text-[#A8A49B] mt-2 font-light">{sub}</p>
      </CardContent>
    </Card>
  );
}
