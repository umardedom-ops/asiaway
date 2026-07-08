import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  CalendarCheck,
  DollarSign,
  TrendingUp,
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
    .select("id, status");

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Boshqaruv paneli</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">Loyiha bo&apos;yicha real vaqtdagi statistika va hisobotlar</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Bandlik statusi vizualizatsiyasi */}
        <Card className="col-span-4 border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader>
            <CardTitle className="text-[18px] font-medium text-[#F5F2EB]">Apartamentlar holati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Joriy bandlik darajasi</p>
                <p className="text-[36px] font-medium text-[#F5F2EB]">{occupancyRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C5A46D]/10 text-[#C5A46D]">
                <Percent className="h-6 w-6" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-full bg-[#0B0D0F] rounded-full overflow-hidden border border-[rgba(197,164,109,0.14)]">
              <div 
                className="h-full bg-[#C5A46D] transition-all duration-500" 
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#0B0D0F] p-5 rounded-[8px] border border-[rgba(197,164,109,0.14)]">
                <div className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.1em]">Band kvartiralar</div>
                <div className="text-[24px] font-medium text-[#F5F2EB] mt-2">{occupiedCount} ta</div>
              </div>
              <div className="bg-[#0B0D0F] p-5 rounded-[8px] border border-[rgba(197,164,109,0.14)]">
                <div className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.1em]">Bo&apos;sh kvartiralar</div>
                <div className="text-[24px] font-medium text-[#C5A46D] mt-2">{vacantCount} ta</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-[12px] text-[#A8A49B] font-light">15 yillik apart-gostinitsa tajribasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
