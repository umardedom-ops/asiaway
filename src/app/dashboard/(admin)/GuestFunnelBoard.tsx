import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BedDouble, LogOut } from "lucide-react";

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" }) : "—";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any;

// Mijozlar voronkasi: Kutilmoqda → Hozir turibdi → Chiqib ketdi
export default function GuestFunnelBoard({ bookings, aptTitle }: { bookings: Booking[]; aptTitle: (id: string) => string }) {
  const waiting = bookings.filter((b) => b.booking_status === "confirmed" && !b.checked_in_at);
  const staying = bookings.filter((b) => b.booking_status === "confirmed" && b.checked_in_at);
  const left = bookings
    .filter((b) => b.booking_status === "completed")
    .sort((a, b) => (a.check_out < b.check_out ? 1 : -1))
    .slice(0, 12);

  const columns = [
    { key: "waiting", title: "Kutilmoqda", items: waiting, icon: <Clock className="h-4 w-4" />, color: "text-emerald-400", dot: "bg-emerald-400" },
    { key: "staying", title: "Hozir turibdi", items: staying, icon: <BedDouble className="h-4 w-4" />, color: "text-purple-300", dot: "bg-purple-300" },
    { key: "left", title: "Chiqib ketdi", items: left, icon: <LogOut className="h-4 w-4" />, color: "text-[#A8A49B]", dot: "bg-[#A8A49B]" },
  ];

  return (
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
      <CardHeader>
        <CardTitle className="text-[18px] font-medium text-[#F5F2EB]">Mijozlar voronkasi</CardTitle>
        <p className="text-[12px] text-[#A8A49B] font-light">Bron bo&apos;yicha keladigan mehmonlar oqimi</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.key} className="rounded-[10px] bg-[#0B0D0F]/40 border border-[rgba(197,164,109,0.1)] p-3">
              <div className={`flex items-center justify-between mb-3 px-1 ${col.color}`}>
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em]">
                  {col.icon} {col.title}
                </span>
                <span className="text-[12px] font-medium">{col.items.length}</span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {col.items.length === 0 && (
                  <div className="text-[12px] text-[#A8A49B]/50 text-center py-4">Bo&apos;sh</div>
                )}
                {col.items.map((b: Booking) => (
                  <div key={b.id} className="rounded-[8px] bg-[#111417] border border-[rgba(197,164,109,0.12)] p-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <span className="text-[13px] font-medium text-[#F5F2EB] truncate">{b.guest_name}</span>
                    </div>
                    <div className="text-[11px] text-[#A8A49B] mt-1 truncate">{aptTitle(b.apartment_id)}</div>
                    <div className="text-[11px] text-[#A8A49B]/80 mt-0.5">{fmtDate(b.check_in)} → {fmtDate(b.check_out)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
