import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "./KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
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
    .select("id, title, status, monthly_lease_cost, kanban_status");

  const totalApts = apartments?.length || 0;
  const activeApts = apartments?.filter(a => a.status === "active").length || 0;

  // 2. Barcha bronlarni olish
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, total_price, check_in, check_out, booking_status");

  const totalBookings = bookings?.length || 0;
  
  // Bugun band bo'lgan kvartiralarni aniqlash
  const activeBookingsToday = bookings?.filter(b => {
    return b.booking_status === "confirmed" && 
           b.check_in <= today && 
           b.check_out > today;
  }) || [];
  
  const occupiedCount = activeBookingsToday.length;
  const vacantCount = activeApts - occupiedCount;

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
    supabase.from("expenses").select("amount").gte("spent_on", startOfMonthStr).lt("spent_on", nextMonthStr),
    supabase.from("staff").select("monthly_salary, active"),
  ]);
  const rentCost = (apartments || []).filter((a) => a.status === "active")
    .reduce((s, a) => s + Number(a.monthly_lease_cost || 0), 0);
  const salaryCost = (staffRows || []).filter((s) => s.active)
    .reduce((s, x) => s + Number(x.monthly_salary || 0), 0);
  const variableCost = (monthExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthlyCost = rentCost + salaryCost + variableCost;
  const monthlyProfit = monthlyRevenue - monthlyCost;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Boshqaruv paneli</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">Loyiha bo&apos;yicha real vaqtdagi statistika va hisobotlar</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Kvartiralar */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Apartamentlar</CardTitle>
            <Home className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-[#F5F2EB]">{totalApts} ta</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              <span className="text-[#C5A46D] font-medium">{vacantCount} ta bo&apos;sh</span> · {occupiedCount} ta band
            </p>
          </CardContent>
        </Card>

        {/* Oylik Bronlar */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik bronlar</CardTitle>
            <CalendarCheck className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-[#F5F2EB]">{monthlyBookings.length} ta</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Jami bronlar soni: {totalBookings} ta
            </p>
          </CardContent>
        </Card>

        {/* Oylik Taxminiy Daromad */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik daromad</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-[#F5F2EB]">{formatUzbekPrice(monthlyRevenue)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Tasdiqlangan va to&apos;langanlar
            </p>
          </CardContent>
        </Card>

        {/* Jami Daromad */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Umumiy tushum</CardTitle>
            <DollarSign className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-[#F5F2EB]">{formatUzbekPrice(totalRevenue)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Loyiha ishga tushgandan buyon
            </p>
          </CardContent>
        </Card>

        {/* Oylik Xarajat */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik xarajat</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-medium text-[#F5F2EB]">{formatUzbekPrice(monthlyCost)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Arenda + ish haqi + boshqa
            </p>
          </CardContent>
        </Card>

        {/* Oylik Sof Foyda */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik sof foyda</CardTitle>
            <Wallet className="h-4 w-4 text-[#C5A46D]" />
          </CardHeader>
          <CardContent>
            <div className={`text-[28px] font-medium ${monthlyProfit >= 0 ? "text-[#C5A46D]" : "text-red-400"}`}>{formatUzbekPrice(monthlyProfit)}</div>
            <p className="text-[12px] text-[#A8A49B] mt-2 font-light">
              Daromad − xarajat
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Realtime Kanban Doskasi */}
        <div className="col-span-4">
          <KanbanBoard initialData={apartments || []} />
        </div>

        {/* Tezkor eslatmalar */}
        <Card className="col-span-3 border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader>
            <CardTitle className="text-[18px] font-medium text-[#F5F2EB]">Tezkor ko&apos;rsatkichlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4 border-b border-[rgba(197,164,109,0.14)] pb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-[#C5A46D]" />
              <div className="flex-1 space-y-1">
                <p className="text-[14px] font-medium text-[#F5F2EB]">Faol apartamentlar</p>
                <p className="text-[12px] text-[#A8A49B] font-light">{activeApts} ta aktiv ijara obyekti</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 border-b border-[rgba(197,164,109,0.14)] pb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-[#D4B77F]" />
              <div className="flex-1 space-y-1">
                <p className="text-[14px] font-medium text-[#F5F2EB]">Aeroport Transfer</p>
                <p className="text-[12px] text-[#A8A49B] font-light">Mijozlar kutib olish xizmati taqdim etiladi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2.5 w-2.5 rounded-full bg-[#F5F2EB]" />
              <div className="flex-1 space-y-1">
                <p className="text-[14px] font-medium text-[#F5F2EB]">Nest One platformasi</p>
                <p className="text-[12px] text-[#A8A49B] font-light">10 yillik apart-gostinitsa tajribasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
