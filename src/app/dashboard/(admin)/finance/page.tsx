import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Building2, Users, Receipt } from "lucide-react";
import { EXPENSE_CATEGORIES } from "./ExpenseForm";

export const revalidate = 0;

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default async function FinancePage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

  // Ma'lumotlar (jadval hali yaratilmagan bo'lsa — bo'sh)
  const [{ data: apts }, { data: bookings }, { data: expensesRaw }, { data: staff }] = await Promise.all([
    supabase.from("apartments").select("id, title, status, monthly_lease_cost"),
    supabase.from("bookings").select("total_price, check_in, booking_status, apartment_id, channel"),
    supabase.from("expenses").select("*").gte("spent_on", monthStart).lt("spent_on", nextMonthStart).order("spent_on", { ascending: false }),
    supabase.from("staff").select("monthly_salary, active"),
  ]);

  const apartments = apts ?? [];
  const allBookings = bookings ?? [];
  const expenses = expensesRaw ?? [];
  const staffList = staff ?? [];

  // Joriy oy daromadi (kelgan sana shu oyда, tasdiqlangan/yakunlangan)
  const monthBookings = allBookings.filter(
    (b) => b.check_in >= monthStart && b.check_in < nextMonthStart &&
      (b.booking_status === "confirmed" || b.booking_status === "completed")
  );
  const income = monthBookings.reduce((s, b) => s + Number(b.total_price || 0), 0);

  // Doimiy oylik xarajatlar. Arenda = monthly_lease_cost (kelishilgan oylik).
  const rentCost = apartments.filter((a) => a.status === "active").reduce((s, a) => s + Number(a.monthly_lease_cost || 0), 0);
  const salaryCost = staffList.filter((s) => s.active).reduce((s, x) => s + Number(x.monthly_salary || 0), 0);

  // O'zgaruvchan xarajatlar (expenses jadvali, shu oy).
  // MUHIM: 'rent' kategoriyasini CHIQARIB tashlaymiz — arenda allaqachon rentCost'да
  // (monthly_lease_cost) hisoblangan. Aks holda egalar-to'lovi ikki marta sanaladi.
  const variableExpenses = expenses.filter((e) => e.category !== "rent");
  const variableTotal = variableExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const byCat: Record<string, number> = {};
  for (const e of variableExpenses) byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount || 0);

  const totalCost = rentCost + salaryCost + variableTotal;
  const profit = income - totalCost;
  const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

  // Apartament bo'yicha (shu oy daromadi vs tan narx). exp — rent'siz.
  const perApt = apartments.map((a) => {
    const inc = monthBookings.filter((b) => b.apartment_id === a.id).reduce((s, b) => s + Number(b.total_price || 0), 0);
    const lease = Number(a.monthly_lease_cost || 0);
    const exp = variableExpenses.filter((e) => e.apartment_id === a.id).reduce((s, e) => s + Number(e.amount || 0), 0);
    return { id: a.id, title: a.title, inc, lease, exp, net: inc - lease - exp };
  }).sort((x, y) => y.net - x.net);

  const monthLabel = now.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Moliya · Hisob-kitob</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          {monthLabel} — kutilgan daromad (bronlar), xarajat (arenda + ish haqi + boshqa) va sof foyda. Haqiqatда olingan pul → Kirim kassasi.
        </p>
      </div>

      {/* P&L kartalar */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Kutilgan daromad" value={money(income)} icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} sub={`${monthBookings.length} ta bron · olingani Kirim kassasida`} />
        <StatCard title="Umumiy xarajat" value={money(totalCost)} icon={<TrendingDown className="h-4 w-4 text-red-400" />} sub={`Doimiy + o'zgaruvchan`} />
        <StatCard title="Sof foyda" value={money(profit)} icon={<Wallet className="h-4 w-4 text-[#C5A46D]" />} sub={`Marja: ${margin}%`} accent={profit >= 0} />
        <StatCard title="Tan narx (arenda)" value={money(rentCost)} icon={<Building2 className="h-4 w-4 text-[#C5A46D]" />} sub={`Egalarga oylik`} />
      </div>

      {/* Xarajat taqsimoti */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none lg:col-span-1">
          <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Xarajat tarkibi</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <CostLine label="Arenda (egaga)" value={money(rentCost)} icon={<Building2 className="h-4 w-4" />} />
            <CostLine label="Ish haqi (xodimlar)" value={money(salaryCost)} icon={<Users className="h-4 w-4" />} />
            {Object.entries(byCat).map(([cat, val]) => (
              <CostLine key={cat} label={EXPENSE_CATEGORIES[cat] || cat} value={money(val)} icon={<Receipt className="h-4 w-4" />} />
            ))}
            {rentCost + salaryCost + variableTotal === 0 && (
              <p className="text-[13px] text-[#A8A49B] font-light">Hali xarajat kiritilmagan.</p>
            )}
          </CardContent>
        </Card>

        {/* Apartament bo'yicha foyda */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none lg:col-span-2">
          <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Apartament bo&apos;yicha (shu oy)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                    <th className="text-left font-semibold px-6 py-3">Apartament</th>
                    <th className="text-right font-semibold px-4 py-3">Daromad</th>
                    <th className="text-right font-semibold px-4 py-3">Tan narx</th>
                    <th className="text-right font-semibold px-4 py-3">Xarajat</th>
                    <th className="text-right font-semibold px-6 py-3">Sof</th>
                  </tr>
                </thead>
                <tbody>
                  {perApt.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[#A8A49B]">Ma&apos;lumot yo&apos;q</td></tr>
                  )}
                  {perApt.map((r) => (
                    <tr key={r.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0">
                      <td className="px-6 py-3 text-[#F5F2EB] max-w-[220px] truncate">{r.title}</td>
                      <td className="px-4 py-3 text-right text-emerald-400/90">{money(r.inc)}</td>
                      <td className="px-4 py-3 text-right text-[#A8A49B]">{money(r.lease)}</td>
                      <td className="px-4 py-3 text-right text-[#A8A49B]">{money(r.exp)}</td>
                      <td className={`px-6 py-3 text-right font-semibold ${r.net >= 0 ? "text-[#C5A46D]" : "text-red-400"}`}>{money(r.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
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

function CostLine({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[rgba(197,164,109,0.08)] pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 text-[#A8A49B]">{icon}<span className="text-[14px] text-[#F5F2EB]">{label}</span></div>
      <span className="text-[14px] font-medium text-[#F5F2EB]">{value}</span>
    </div>
  );
}
