import { createClient } from "@/lib/supabase/server";
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

// Helper function to format prices to UZS or USD
const formatUzbekPrice = (amount: number) => {
  return `$${Number(amount).toLocaleString("en-US")}`;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

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
  
  // Bugun band bo'lgan kvartiralarni aniqlash
  const activeBookingsToday = bookings?.filter(b => {
    return b.booking_status === "confirmed" && 
           b.check_in <= today && 
           b.check_out > today;
  }) || [];
  
  const occupiedCount = activeBookingsToday.length;
  const vacantCount = activeApts - occupiedCount;

  // Hozir turgan mehmonlar — bugungi sana bron oralig'iga to'g'ri keladigan faol bronlar
  // (check-in qilingan yoki sana bo'yicha hozir shu yerda). Completed/cancelled hisobga olinmaydi.
  const stayingCount = (bookings || []).filter(
    (b) => b.booking_status === "confirmed" && b.check_in <= today && b.check_out > today
  ).length;

  // Oylik bronlar soni (joriy oy uchun)
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  const startOfMonthStr = currentMonthStart.toISOString().split("T")[0];
  
  const monthlyBookings = bookings?.filter(b => {
    return b.check_in >= startOfMonthStr && b.booking_status !== "cancelled";
  }) || [];

  // Daromadni hisoblash
  // Tasdiqlangan va yakunlangan bronlar narxi yig'indisi
  const totalRevenue = bookings
    ?.filter(b => b.booking_status === "confirmed" || b.booking_status === "completed")
    ?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

  const monthlyRevenue = monthlyBookings
    ?.filter(b => b.booking_status === "confirmed" || b.booking_status === "completed")
    ?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

  // Bandlik foizi
  const occupancyRate = activeApts > 0 ? Math.round((occupiedCount / activeApts) * 100) : 0;

  // Oylik xarajat va sof foyda (moliya moduli bilan izchil)
  const nextMonthStr = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1)
    .toISOString().split("T")[0];
  const [{ data: monthExpenses }, { data: staffRows }] = await Promise.all([
    supabase.from("expenses").select("amount, category, apartment_id").gte("spent_on", startOfMonthStr).lt("spent_on", nextMonthStr),
    supabase.from("staff").select("monthly_salary, active"),
  ]);
  const rentCost = (apartments || []).filter((a) => a.status === "active")
    .reduce((s, a) => s + Number(a.monthly_lease_cost || 0), 0);
  const salaryCost = (staffRows || []).filter((s) => s.active)
    .reduce((s, x) => s + Number(x.monthly_salary || 0), 0);
  // 'rent' kategoriyasini chiqaramiz — arenda rentCost'да allaqachon bor (double-count oldini olish)
  const variableCost = (monthExpenses || []).filter((e) => e.category !== "rent")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthlyCost = rentCost + salaryCost + variableCost;
  const monthlyProfit = monthlyRevenue - monthlyCost;

  // Egalarga oylik to'lov (boshqaruv ichidagi bo'lim)
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
  // Haqiqiy to'langan pul (Moliyadagi "rent" xarajatlar yig'indisi)
  const ownerPaid = (monthExpenses || []).filter((e) => e.category === "rent").reduce((s, e) => s + Number(e.amount || 0), 0);
  const ownerPending = rentCost - ownerPaid;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Boshqaruv paneli</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">Loyiha bo&apos;yicha real vaqtdagi statistika va hisobotlar</p>
      </div>

      {/* 4 ta bron holati tablo */}
      <BookingStatCards />

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bo'sh apartlar */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Bo&apos;sh apartlar</CardTitle>
            <DoorOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-blue-400">{vacantCount} ta</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              <span className="text-red-400">{occupiedCount} ta band</span> · jami {activeApts} ta
            </p>
          </CardContent>
        </Card>

        {/* Hozir turgan mehmonlar */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Hozir turgan mehmonlar</CardTitle>
            <BedDouble className="h-4 w-4 text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-purple-300">{stayingCount} ta</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Bandlik: {occupancyRate}%
            </p>
          </CardContent>
        </Card>

        {/* Egalarga oylik (jami) */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Egalarga oylik (jami)</CardTitle>
            <Building2 className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-[#C5A46D]">{formatUzbekPrice(rentCost)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              To&apos;langan: {formatUzbekPrice(ownerPaid)} · qolgan: {formatUzbekPrice(ownerPending)}
            </p>
          </CardContent>
        </Card>

        {/* Oylik Daromad (savdo) */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik daromad (savdo)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-emerald-400">{formatUzbekPrice(monthlyRevenue)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Bronlardan · olingani Kassada
            </p>
          </CardContent>
        </Card>

        {/* Oylik Xarajat (tan narx + hammasi) */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik xarajat (rasxod)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-red-400">{formatUzbekPrice(monthlyCost)}</div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[12px] text-[#A8A49B]">
              <span>Apartlar tan narxi (arenda): <span className="text-[#F5F2EB] font-medium">{formatUzbekPrice(rentCost)}</span></span>
              <span>Ish haqi: <span className="text-[#F5F2EB] font-medium">{formatUzbekPrice(salaryCost)}</span></span>
              <span>Boshqa xarajatlar: <span className="text-[#F5F2EB] font-medium">{formatUzbekPrice(variableCost)}</span></span>
            </div>
          </CardContent>
        </Card>

        {/* Oylik Sof Foyda */}
        <Card className="border-[rgba(197,164,109,0.22)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik sof foyda</CardTitle>
            <Wallet className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className={`text-[28px] font-medium ${monthlyProfit >= 0 ? "text-[#C5A46D]" : "text-red-400"}`}>{formatUzbekPrice(monthlyProfit)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Savdo − rasxod
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mijozlar voronkasi (bron oqimi) — kartalar bosiladi (chek/hisob) */}
      <GuestFunnelBoard bookings={bookings || []} apartments={apartments || []} />

      {/* Egalarga to'lov — boshqaruv ichidagi bo'lim */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[18px] font-medium text-[#F5F2EB]">Egalarga to&apos;lov ({period})</CardTitle>
            <p className="text-[12px] text-[#A8A49B] font-light mt-1">Apart egalariga bir oyda beriladigan pul — &quot;To&apos;landi&quot; bosilsa Kassaga chiqim va Moliyaga tushadi.</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[20px] font-medium text-[#C5A46D]">{formatUzbekPrice(rentCost)}</div>
            <div className="text-[11px] text-[#A8A49B]">jami oylik</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                  <th className="text-left font-semibold px-6 py-3">Apartament</th>
                  <th className="text-left font-semibold px-4 py-3">Ega</th>
                  <th className="text-center font-semibold px-4 py-3">To&apos;lov kuni</th>
                  <th className="text-right font-semibold px-4 py-3">Summa</th>
                  <th className="text-right font-semibold px-6 py-3">Holat</th>
                </tr>
              </thead>
              <tbody>
                {ownerRows.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[#A8A49B]">Apartamentlarga tan narx / to&apos;lov kuni kiritilmagan.</td></tr>
                )}
                {ownerRows.map((r) => (
                  <tr key={r.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                    <td className="px-6 py-3 text-[#F5F2EB] font-medium max-w-[200px] truncate">{r.title}</td>
                    <td className="px-4 py-3"><div className="text-[#F5F2EB]">{r.owner_name || "—"}</div><div className="text-[11px] text-[#A8A49B]">{r.owner_phone}</div></td>
                    <td className="px-4 py-3 text-center text-[#A8A49B]">{r.payDay ? `${r.payDay}-sana` : "—"}</td>
                    <td className="px-4 py-3 text-right text-[#F5F2EB] font-medium">{formatUzbekPrice(r.cost)}</td>
                    <td className="px-6 py-3 text-right">
                      {r.paid ? (
                        <span className="text-[11px] text-emerald-400/90">✓ To&apos;langan</span>
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
