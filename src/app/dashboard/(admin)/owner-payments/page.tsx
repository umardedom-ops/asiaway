import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, AlertTriangle, CalendarClock, Wallet } from "lucide-react";
import PayButton from "./PayButton";
import { fmtDate as fmtDateLib } from "@/lib/date-fmt";

export const revalidate = 0;

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

// Toshkent (UTC+5) bo'yicha bugungi sana
function tashkentNow() {
  const d = new Date(Date.now() + 5 * 60 * 60 * 1000);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth(), // 0-11
    day: d.getUTCDate(),
    daysInMonth: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(),
  };
}

type Status = "paid" | "due_soon" | "today" | "overdue" | "upcoming";

export default async function OwnerPaymentsPage() {
  const supabase = await createClient();

  const { y, m, day: todayDay, daysInMonth } = tashkentNow();
  const period = `${y}-${String(m + 1).padStart(2, "0")}`;
  const startOfMonthStr = new Date(Date.UTC(y, m, 1)).toISOString().split("T")[0];
  const nextMonthStr = new Date(Date.UTC(y, m + 1, 1)).toISOString().split("T")[0];

  const [{ data: aptsRaw }, { data: monthExpenses }] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, title, monthly_lease_cost, owner_name, owner_phone, lease_payment_day, lease_last_paid_period, status")
      .eq("status", "active")
      .order("lease_payment_day", { ascending: true }),
    supabase
      .from("expenses")
      .select("amount, apartment_id")
      .eq("category", "rent")
      .gte("spent_on", startOfMonthStr)
      .lt("spent_on", nextMonthStr),
  ]);

  // BUG FIX: Intl "uz-UZ" bilan month:"long" ishlatilganda "M07" kabi buzuq chiqadi
  const monthLabel = fmtDateLib(new Date(y, m, 1), "uz", { month: "long", year: "numeric" });

  const rows = (aptsRaw ?? []).map((a) => {
    const cost = Number(a.monthly_lease_cost || 0);
    const payDay = a.lease_payment_day ? Number(a.lease_payment_day) : null;
    
    // Haqiqiy to'langan summa (shu oydagi rent xarajatlar yig'indisi)
    const paidAmount = (monthExpenses || [])
      .filter((e) => e.apartment_id === a.id)
      .reduce((s, e) => s + Number(e.amount || 0), 0);
      
    // Agar kamida to'liq summa yoki status "paid" bo'lsa
    const paid = a.lease_last_paid_period === period || paidAmount >= cost;

    let status: Status = "upcoming";
    let daysUntil: number | null = null;

    if (payDay) {
      const effDay = Math.min(payDay, daysInMonth);
      daysUntil = effDay - todayDay;
      if (paid) status = "paid";
      else if (daysUntil < 0) status = "overdue";
      else if (daysUntil === 0) status = "today";
      else if (daysUntil <= 3) status = "due_soon";
      else status = "upcoming";
    }

    return { ...a, cost, payDay, paid, paidAmount, status, daysUntil };
  });

  const configured = rows.filter((r) => r.payDay && r.cost > 0);
  const totalMonthly = configured.reduce((s, r) => s + r.cost, 0);
  const paidTotal = configured.reduce((s, r) => s + r.paidAmount, 0);
  const overdueCount = configured.filter((r) => r.status === "overdue").length;
  const pendingTotal = Math.max(0, totalMonthly - paidTotal);

  // Tartib: kechikkan → bugun → yaqin → kelgusi → to'langan
  const order: Record<Status, number> = { overdue: 0, today: 1, due_soon: 2, upcoming: 3, paid: 4 };
  rows.sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Egalarga to&apos;lov</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          {monthLabel} — har apartament egasiga oylik arenda to&apos;lovi. &quot;To&apos;landi&quot; bosilsa Moliya&apos;ga xarajat yoziladi va eslatma to&apos;xtaydi.
        </p>
      </div>

      {/* Stat kartalar */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Oylik jami" value={money(totalMonthly)} icon={<Wallet className="h-4 w-4 text-[#C5A46D]" />} sub={`${configured.length} ta apartament`} />
        <StatCard title="To'langan" value={money(paidTotal)} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} sub="Shu oy" accent />
        <StatCard title="Qolgan" value={money(pendingTotal)} icon={<CalendarClock className="h-4 w-4 text-[#C5A46D]" />} sub="To'lanmagan" />
        <StatCard title="Kechikkan" value={`${overdueCount} ta`} icon={<AlertTriangle className="h-4 w-4 text-red-400" />} sub="Muddati o'tgan" />
      </div>

      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader>
          <CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Apartamentlar bo&apos;yicha</CardTitle>
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
                  <th className="text-left font-semibold px-4 py-3">Holat</th>
                  <th className="text-right font-semibold px-6 py-3">Amal</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-[#A8A49B]">Faol apartament yo&apos;q.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                    <td className="px-6 py-3">
                      <div className="text-[#F5F2EB] font-medium max-w-[200px] truncate">{r.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#F5F2EB]">{r.owner_name || "—"}</div>
                      <div className="text-[11px] text-[#A8A49B]">{r.owner_phone || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-[#A8A49B]">
                      {r.payDay ? `${r.payDay}-sana` : <span className="text-[#A8A49B]/50">belgilanmagan</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-[#F5F2EB] font-medium">{money(r.cost)}</div>
                      {r.paidAmount > 0 && r.paidAmount < r.cost && (
                        <div className="text-[11px] text-emerald-400">To'landi: {money(r.paidAmount)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} daysUntil={r.daysUntil} /></td>
                    <td className="px-6 py-3 text-right">
                      {r.payDay && r.cost > 0 && !r.paid ? (
                        <div className="flex justify-end">
                          <PayButton apartmentId={r.id} period={period} />
                        </div>
                      ) : r.paid ? (
                        <span className="text-[11px] text-emerald-400/80">✓ yopildi</span>
                      ) : (
                        <span className="text-[11px] text-[#A8A49B]/50">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {configured.length === 0 && (
        <div className="flex items-start gap-3 rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#0B0D0F]/40 p-5 text-[13px] text-[#A8A49B]">
          <Building2 className="h-5 w-5 text-[#C5A46D] shrink-0 mt-0.5" />
          <div>
            Hali birorta apartamentга <b className="text-[#F5F2EB]">to&apos;lov kuni</b> va <b className="text-[#F5F2EB]">egaga oylik</b> kiritilmagan.
            <br />Apartamentlar → tahrirlash → &quot;Tan narx · Ega ma&apos;lumoti&quot; bo&apos;limidan kiriting.
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, daysUntil }: { status: Status; daysUntil: number | null }) {
  const map: Record<Status, { label: string; cls: string }> = {
    paid: { label: "To'langan", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    today: { label: "Bugun to'lov", cls: "bg-[#C5A46D]/15 text-[#C5A46D] border-[#C5A46D]/30" },
    due_soon: { label: daysUntil != null ? `${daysUntil} kun qoldi` : "Yaqin", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    overdue: { label: daysUntil != null ? `Kechikdi (${Math.abs(daysUntil)} kun)` : "Kechikdi", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
    upcoming: { label: "Kelgusi", cls: "bg-[#A8A49B]/10 text-[#A8A49B] border-[#A8A49B]/20" },
  };
  const s = map[status];
  return <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>;
}

function StatCard({ title, value, icon, sub, accent }: { title: string; value: string; icon: React.ReactNode; sub: string; accent?: boolean }) {
  return (
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-[28px] font-medium ${accent ? "text-[#C5A46D]" : "text-[#F5F2EB]"}`}>{value}</div>
        <p className="text-[12px] text-[#A8A49B] mt-2 font-light">{sub}</p>
      </CardContent>
    </Card>
  );
}
