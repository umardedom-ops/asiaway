import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "./KanbanBoard";
import GuestFunnelBoard from "./GuestFunnelBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DoorOpen,
  BedDouble,
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
    .select("id, apartment_id, guest_name, total_price, check_in, check_out, booking_status, checked_in_at");

  const aptTitle = (id: string) => (apartments || []).find((a) => a.id === id)?.title || "—";

  const totalBookings = bookings?.length || 0;
  
  // Bugun band bo'lgan kvartiralarni aniqlash
  const activeBookingsToday = bookings?.filter(b => {
    return b.booking_status === "confirmed" && 
           b.check_in <= today && 
           b.check_out > today;
  }) || [];
  
  const occupiedCount = activeBookingsToday.length;
  const vacantCount = activeApts - occupiedCount;

  // Hozir turgan mehmonlar (joylashtirilgan — check-in qilingan)
  const stayingCount = (bookings || []).filter(
    (b) => b.checked_in_at && b.booking_status !== "completed" && b.booking_status !== "cancelled"
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
    supabase.from("expenses").select("amount, category").gte("spent_on", startOfMonthStr).lt("spent_on", nextMonthStr),
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Boshqaruv paneli</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">Loyiha bo&apos;yicha real vaqtdagi statistika va hisobotlar</p>
      </div>

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

      {/* Mijozlar voronkasi (bron oqimi) */}
      <GuestFunnelBoard bookings={bookings || []} aptTitle={aptTitle} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Realtime Kanban Doskasi (tozalash holati) */}
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
