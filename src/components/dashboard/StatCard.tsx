import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Yagona dashboard stat-kartasi — finance / bookings / guests sahifalaridagi
 * uch xil lokal nusxa o'rniga. Champagne stil, ixtiyoriy sparkline slot.
 */
export default function StatCard({
  title,
  value,
  icon,
  sub,
  accent,
  valueClass,
  sparkline,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
  /** true — qiymat champagne rangda (asosiy ko'rsatkich) */
  accent?: boolean;
  /** maxsus rang klassi (accent'dan ustun), masalan "text-emerald-400" */
  valueClass?: string;
  /** karta ichiga joylashadigan mini-grafik (recharts Sparkline) */
  sparkline?: React.ReactNode;
}) {
  const color = valueClass || (accent ? "text-[#C5A46D]" : "text-[#F5F2EB]");
  return (
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none hover:border-[rgba(197,164,109,0.3)] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div className={`text-[28px] font-medium ${color}`}>{value}</div>
          {sparkline}
        </div>
        <p className="text-[12px] text-[#A8A49B] mt-2 font-light">{sub}</p>
      </CardContent>
    </Card>
  );
}
