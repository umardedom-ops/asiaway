import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { D, type Lang } from "@/lib/i18n";
import GuestFunnelBoard from "./GuestFunnelBoard";
import BookingStatCards from "./BookingStatCards";
import PayButton from "./owner-payments/PayButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DoorOpen,
  BedDouble,
  Building2,
} from "lucide-react";

export const revalidate = 0; // Dynamic rendering

const formatUzbekPrice = (amount: number) => {
  return `$${Number(amount).toLocaleString("en-US")}`;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Cookie'dan tilni o'qiymiz
  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

  // 1. Barcha kvartiralarni olish
  const { data: apartments } = await supabase
    .from("apartments")
    .select("id, title, status, monthly_lease_cost, kanban_status, owner_name, owner_phone, lease_payment_day, lease_last_paid_period");

  const totalApts = apartments?.length || 0;
  const activeApts = apartments?.filter(a => a.status === "active").length || 0;

  // 2. Barcha bronlarni olish
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, apartment_id, guest_name, total_price, check_in, check_out, booking_status, checked_in_at");

  const totalBookings = bookings?.length || 0;
  
  const activeBookingsToday = bookings?.filter(b => {
    return b.booking_status === "confirmed" && 
           b.check_in <= today && 
           b.check_out > today;
  }) || [];
  
  const occupiedCount = activeBookingsToday.length;
  const vacantCount = activeApts - occupiedCount;

  const stayingCount = (bookings || []).filter(
    (b) => b.booking_status === "confirmed" && b.check_in <= today && b.check_out > today
  ).length;

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  const startOfMonthStr = currentMonthStart.toISOString().split("T")[0];
  
  const monthlyBookings = bookings?.filter(b => {
    return b.check_in >= startOfMonthStr && b.booking_status !== "cancelled";
  }) || [];

  const totalRevenue = bookings
    ?.filter(b => b.booking_status === "confirmed" || b.booking_status === "completed")
    ?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

  const monthlyRevenue = monthlyBookings
    ?.filter(b => b.booking_status === "confirmed" || b.booking_status === "completed")
    ?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

  const occupancyRate = activeApts > 0 ? Math.round((occupiedCount / activeApts) * 100) : 0;

  const nextMonthStr = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1)
    .toISOString().split("T")[0];
  const [{ data: monthExpenses }, { data: staffRows }] = await Promise.all([
    supabase.from("expenses").select("amount, category, apartment_id").gte("spent_on", startOfMonthStr).lt("spent_on", nextMonthStr),
    supabase.from("staff").select("monthly_salary, active"),
  ]);
  // ARENDA (AUDIT M2): har apartament uchun max(kelishilgan oylik, qo'lda yozilgan rent xarajati)
  // — shunda monthly_lease_cost=0 bo'lgan apartamentning haqiqiy arenda to'lovi yo'qolmaydi,
  // va ikki marta ham sanalmaydi.
  const rentExpByApt = new Map<string, number>();
  let rentExpUnassigned = 0;
  for (const e of (monthExpenses || []).filter((x) => x.category === "rent")) {
    if (e.apartment_id) {
      rentExpByApt.set(e.apartment_id, (rentExpByApt.get(e.apartment_id) || 0) + Number(e.amount || 0));
    } else {
      rentExpUnassigned += Number(e.amount || 0);
    }
  }
  const rentCost =
    (apartments || []).filter((a) => a.status === "active")
      .reduce((s, a) => s + Math.max(Number(a.monthly_lease_cost || 0), rentExpByApt.get(a.id) || 0), 0) +
    rentExpUnassigned;

  const salaryCost = (staffRows || []).filter((s) => s.active)
    .reduce((s, x) => s + Number(x.monthly_salary || 0), 0);
  const variableCost = (monthExpenses || []).filter((e) => e.category !== "rent")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthlyCost = rentCost + salaryCost + variableCost;
  const monthlyProfit = monthlyRevenue - monthlyCost;

  // Egalarga oylik to'lov
  const nowTk = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const period = `${nowTk.getUTCFullYear()}-${String(nowTk.getUTCMonth() + 1).padStart(2, "0")}`;
  const ownerRows = (apartments || [])
    .filter((a) => a.status === "active" && Number(a.monthly_lease_cost || 0) > 0)
    .map((a) => ({
      id: a.id as string,
      title: a.title as string,
      owner_name: (a.owner_name as string) || "",
      owner_phone: (a.owner_phone as string) || "",
      cost: Number(a.monthly_lease_cost || 0),
      payDay: a.lease_payment_day ? Number(a.lease_payment_day) : null,
      paid: a.lease_last_paid_period === period,
    }));
  const ownerPaid = (monthExpenses || []).filter((e) => e.category === "rent").reduce((s, e) => s + Number(e.amount || 0), 0);
  const ownerPending = rentCost - ownerPaid;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{d.home.title}</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">{d.home.subtitle}</p>
      </div>

      {/* 4 ta bron holati tablo */}
      <BookingStatCards />

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bo'sh apartlar */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.home.vacant}</CardTitle>
            <DoorOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-blue-400">{vacantCount} {d.home.ta}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              <span className="text-red-400">{occupiedCount} {d.home.ta} {d.home.occupied}</span> · {d.home.total} {activeApts} {d.home.ta}
            </p>
          </CardContent>
        </Card>

        {/* Hozir turgan mehmonlar */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.home.guests}</CardTitle>
            <BedDouble className="h-4 w-4 text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-purple-300">{stayingCount} {d.home.ta}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              {d.home.occupancy}: {occupancyRate}%
            </p>
          </CardContent>
        </Card>

        {/* Egalarga oylik (jami) */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.home.ownerRent}</CardTitle>
            <Building2 className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-[#C5A46D]">{formatUzbekPrice(rentCost)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              {d.home.paid}: {formatUzbekPrice(ownerPaid)} · {d.home.remaining}: {formatUzbekPrice(ownerPending)}
            </p>
          </CardContent>
        </Card>

        {/* Oylik Daromad (savdo) */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.home.revenue}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-emerald-400">{formatUzbekPrice(monthlyRevenue)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              {d.home.fromBookings}
            </p>
          </CardContent>
        </Card>

        {/* Oylik Xarajat */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.home.expense}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-red-400">{formatUzbekPrice(monthlyCost)}</div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[12px] text-[#A8A49B]">
              <span>{d.home.rentCost}: <span className="text-[#F5F2EB] font-medium">{formatUzbekPrice(rentCost)}</span></span>
              <span>{d.home.salary}: <span className="text-[#F5F2EB] font-medium">{formatUzbekPrice(salaryCost)}</span></span>
              <span>{d.home.otherExpense}: <span className="text-[#F5F2EB] font-medium">{formatUzbekPrice(variableCost)}</span></span>
            </div>
          </CardContent>
        </Card>

        {/* Oylik Sof Foyda */}
        <Card className="border-[rgba(197,164,109,0.22)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.home.profit}</CardTitle>
            <Wallet className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className={`text-[28px] font-medium ${monthlyProfit >= 0 ? "text-[#C5A46D]" : "text-red-400"}`}>{formatUzbekPrice(monthlyProfit)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              {d.home.salesMinusExpense}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mijozlar voronkasi */}
      <GuestFunnelBoard bookings={bookings || []} apartments={apartments || []} />

      {/* Egalarga to'lov */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[18px] font-medium text-[#F5F2EB]">{d.ownerPay.title} ({period})</CardTitle>
            <p className="text-[12px] text-[#A8A49B] font-light mt-1">{d.ownerPay.subtitle}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[20px] font-medium text-[#C5A46D]">{formatUzbekPrice(rentCost)}</div>
            <div className="text-[11px] text-[#A8A49B]">{d.ownerPay.totalMonthly}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                  <th className="text-left font-semibold px-6 py-3">{d.ownerPay.apartment}</th>
                  <th className="text-left font-semibold px-4 py-3">{d.ownerPay.owner}</th>
                  <th className="text-center font-semibold px-4 py-3">{d.ownerPay.payDay}</th>
                  <th className="text-right font-semibold px-4 py-3">{d.ownerPay.amount}</th>
                  <th className="text-right font-semibold px-6 py-3">{d.ownerPay.state}</th>
                </tr>
              </thead>
              <tbody>
                {ownerRows.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[#A8A49B]">{d.ownerPay.noData}</td></tr>
                )}
                {ownerRows.map((r) => (
                  <tr key={r.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                    <td className="px-6 py-3 text-[#F5F2EB] font-medium max-w-[200px] truncate">{r.title}</td>
                    <td className="px-4 py-3"><div className="text-[#F5F2EB]">{r.owner_name || "—"}</div><div className="text-[11px] text-[#A8A49B]">{r.owner_phone}</div></td>
                    <td className="px-4 py-3 text-center text-[#A8A49B]">{r.payDay ? `${r.payDay}-${d.ownerPay.dayLabel}` : "—"}</td>
                    <td className="px-4 py-3 text-right text-[#F5F2EB] font-medium">{formatUzbekPrice(r.cost)}</td>
                    <td className="px-6 py-3 text-right">
                      {r.paid ? (
                        <span className="text-[11px] text-emerald-400/90">✓ {d.ownerPay.paidLabel}</span>
                      ) : (
                        <div className="flex justify-end"><PayButton apartmentId={r.id} period={period} /></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
