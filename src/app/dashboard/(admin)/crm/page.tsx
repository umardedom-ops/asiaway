import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { D, type Lang } from "@/lib/i18n";
import LeadRow from "./LeadRow";
import AddLeadForm from "./AddLeadForm";
import { Users, Download, ChartColumn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceRevenueChart, LeadsFunnelChart } from "@/components/dashboard/Charts";
import { CHANNEL_LABELS } from "../bookings/channels";

export const revalidate = 0;

export default async function CRMPage() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

  const [{ data: leads, error }, { data: mktBookings }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    // select("*") — source ustuni DB'da hali bo'lmasa ham so'rov yiqilmaydi
    supabase
      .from("bookings")
      .select("*")
      .neq("booking_status", "cancelled"),
  ]);

  // ---- Marketing analitika (targetolog uchun diagrammalar) ----
  // 1) Manba bo'yicha bronlar: qaysi kanal qancha pul olib kelyapti
  const bySrc = new Map<string, { value: number; count: number }>();
  for (const b of mktBookings ?? []) {
    const key = (b.source || b.channel || "boshqa").toLowerCase();
    const cur = bySrc.get(key) || { value: 0, count: 0 };
    cur.value += Number(b.total_price || 0);
    cur.count += 1;
    bySrc.set(key, cur);
  }
  const sourceChart = [...bySrc.entries()]
    .map(([name, v]) => ({ name: CHANNEL_LABELS[name] || name, ...v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // 2) Oylik leadlar va bronga aylanganlar (konversiya dinamikasi, 6 oy)
  const now = new Date();
  const chartLocale = lang === "ru" ? "ru-RU" : "uz-UZ";
  const leadsChart: { month: string; leads: number; won: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const monthLeads = (leads ?? []).filter((l) => String(l.created_at).startsWith(key));
    leadsChart.push({
      month: dt.toLocaleDateString(chartLocale, { month: "short" }),
      leads: monthLeads.length,
      won: monthLeads.filter((l) => l.status === "won").length,
    });
  }
  const totalLeads = leads?.length || 0;
  const wonLeads = (leads ?? []).filter((l) => l.status === "won").length;
  const conversion = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-heading font-medium text-[#F5F2EB] flex items-center gap-3">
            <Users className="h-8 w-8 text-[#C5A46D]" />
            {d.crm.title}
            {/* Yashirin Excel yuklab olish (targetolog/shef): mijozlar bazasi + UTM tahlili */}
            {/* Telefonda hover yo'q — mobil ekranда yarim-ko'rinadigan, desktopda hover'da */}
            <a
              href="/api/export/clients"
              title="Excel"
              className="opacity-60 lg:opacity-0 hover:opacity-90 lg:hover:opacity-80 focus:opacity-90 transition-opacity duration-300 text-[#C5A46D] p-2 -m-1"
              download
            >
              <Download className="h-4 w-4" />
            </a>
          </h1>
          <p className="text-[#A8A49B] text-[15px] mt-1">
            {d.crm.subtitle}
          </p>
        </div>
        <div className="bg-[#111417] border border-[rgba(197,164,109,0.14)] px-6 py-3 rounded-xl flex items-center space-x-4">
          <div className="text-center">
            <div className="text-[24px] font-heading font-semibold text-[#F5F2EB]">{leads?.length || 0}</div>
            <div className="text-[11px] font-medium text-[#A8A49B] uppercase tracking-wider">{lang === "ru" ? "Всего заявок" : "Jami murojaatlar"}</div>
          </div>
          <div className="w-px h-10 bg-[rgba(197,164,109,0.14)]" />
          <div className="text-center">
            <div className="text-[24px] font-heading font-semibold text-[#C5A46D]">
              {leads?.filter(l => l.status === 'new').length || 0}
            </div>
            <div className="text-[11px] font-medium text-[#A8A49B] uppercase tracking-wider">{lang === "ru" ? "Новые" : "Yangilari"}</div>
          </div>
        </div>
      </div>

      {/* Marketing analitika — targetolog uchun diagrammalar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader>
            <CardTitle className="text-[16px] font-medium text-[#F5F2EB] inline-flex items-center gap-2">
              <ChartColumn className="h-4 w-4 text-[#C5A46D]" />
              {lang === "ru" ? "Доход по источникам (откуда деньги)" : "Manba bo'yicha daromad (pul qayerdan)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourceChart.length > 0 ? (
              <SourceRevenueChart data={sourceChart} countLabel={lang === "ru" ? "брони" : "bron"} />
            ) : (
              <p className="text-[13px] text-[#A8A49B] py-8 text-center">{d.common.noData}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader>
            <CardTitle className="text-[16px] font-medium text-[#F5F2EB] inline-flex items-center gap-2">
              <ChartColumn className="h-4 w-4 text-[#C5A46D]" />
              {lang === "ru" ? `Заявки и конверсия (6 мес) — ${conversion}%` : `Murojaatlar va konversiya (6 oy) — ${conversion}%`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsFunnelChart
              data={leadsChart}
              leadsLabel={lang === "ru" ? "Заявки" : "Murojaatlar"}
              wonLabel={lang === "ru" ? "Стали бронью" : "Bronga aylandi"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Qo'lda murojaat qo'shish (Instagram, qo'ng'iroq, WhatsApp...) */}
      <AddLeadForm isRu={lang === "ru"} />

      <div className="space-y-4">
        {error ? (
          <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 text-center">
            {lang === "ru" ? "Ошибка при загрузке заявок" : "Mijozlarni yuklashda xatolik yuz berdi"}: {error.message}
          </div>
        ) : !leads || leads.length === 0 ? (
          <div className="py-20 text-center text-[#A8A49B] bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-xl">
            <Users className="h-12 w-12 text-[rgba(197,164,109,0.3)] mx-auto mb-4" />
            <h3 className="text-[18px] font-heading font-medium text-[#F5F2EB] mb-2">{d.crm.noLeads}</h3>
            <p>{lang === "ru" ? "Здесь будут отображаться все сообщения от клиентов." : "Mijozlar tomonidan qoldirilgan barcha xabarlar shu yerda ko'rinadi."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {leads.map((lead: any) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
