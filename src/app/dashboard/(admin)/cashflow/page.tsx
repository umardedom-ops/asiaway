import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPENSE_CATEGORIES } from "../finance/ExpenseForm";
import { ArrowDownCircle, ArrowUpCircle, Scale, CalendarDays } from "lucide-react";

export const revalidate = 0;

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const dateKey = (d: string | Date) => {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toISOString().split("T")[0];
};

// Oxirgi 30 kunlik kunma-kun kirim (bronlar) va chiqim (xarajatlar).
export default async function CashflowPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceStr = since.toISOString().split("T")[0];

  const [{ data: bookingsRaw }, { data: expensesRaw }, { data: apts }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, guest_name, total_price, deposit_amount, created_at, check_in, booking_status, apartment_id")
      .gte("created_at", `${sinceStr}T00:00:00Z`)
      .neq("booking_status", "cancelled")
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("id, category, amount, spent_on, note, apartment_id")
      .gte("spent_on", sinceStr)
      .order("spent_on", { ascending: false }),
    supabase.from("apartments").select("id, title"),
  ]);

  const bookings = bookingsRaw ?? [];
  const expenses = expensesRaw ?? [];
  const aptTitle = (id: string | null) =>
    (apts ?? []).find((a) => a.id === id)?.title || "—";

  // Bugun / kecha uchun umumiy
  const todayKey = dateKey(new Date());
  const yKey = dateKey(new Date(Date.now() - 86400000));

  const incomeOn = (k: string) =>
    bookings.filter((b) => dateKey(b.created_at) === k).reduce((s, b) => s + Number(b.total_price || 0), 0);
  const expenseOn = (k: string) =>
    expenses.filter((e) => dateKey(e.spent_on) === k).reduce((s, e) => s + Number(e.amount || 0), 0);

  const todayIn = incomeOn(todayKey);
  const todayOut = expenseOn(todayKey);
  const ydayIn = incomeOn(yKey);
  const ydayOut = expenseOn(yKey);

  const total30In = bookings.reduce((s, b) => s + Number(b.total_price || 0), 0);
  const total30Out = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  // Kunma-kun birlashtirilgan ro'yxat
  const dayKeys = Array.from(
    new Set([...bookings.map((b) => dateKey(b.created_at)), ...expenses.map((e) => dateKey(e.spent_on))])
  ).sort((a, b) => (a < b ? 1 : -1));

  const days = dayKeys.map((k) => {
    const dayBookings = bookings.filter((b) => dateKey(b.created_at) === k);
    const dayExpenses = expenses.filter((e) => dateKey(e.spent_on) === k);
    const inc = dayBookings.reduce((s, b) => s + Number(b.total_price || 0), 0);
    const out = dayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return { key: k, dayBookings, dayExpenses, inc, out, net: inc - out };
  });

  const fmtDay = (k: string) =>
    new Date(k).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", weekday: "short" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Kunlik kassa</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          Oxirgi 30 kun — kunma-kun kirim (bronlar) va chiqim (xarajatlar).
        </p>
      </div>

      {/* Bugun / kecha / 30 kun */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Bugun kirim" value={money(todayIn)} icon={<ArrowUpCircle className="h-4 w-4 text-emerald-400" />} sub={money(todayOut) + " chiqim"} />
        <StatCard title="Bugun sof" value={money(todayIn - todayOut)} icon={<Scale className="h-4 w-4 text-[#C5A46D]" />} sub="Kirim − chiqim" accent={todayIn - todayOut >= 0} />
        <StatCard title="Kecha sof" value={money(ydayIn - ydayOut)} icon={<CalendarDays className="h-4 w-4 text-[#A8A49B]" />} sub={`${money(ydayIn)} / ${money(ydayOut)}`} />
        <StatCard title="30 kun sof" value={money(total30In - total30Out)} icon={<Scale className="h-4 w-4 text-[#C5A46D]" />} sub={`${money(total30In)} kirim`} accent={total30In - total30Out >= 0} />
      </div>

      {/* Kunma-kun */}
      <div className="space-y-5">
        {days.length === 0 && (
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardContent className="py-10 text-center text-[#A8A49B]">Oxirgi 30 kunda harakat yo&apos;q.</CardContent>
          </Card>
        )}
        {days.map((d) => (
          <Card key={d.key} className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-[rgba(197,164,109,0.1)]">
              <CardTitle className="text-[15px] font-medium text-[#F5F2EB] capitalize">{fmtDay(d.key)}</CardTitle>
              <div className="flex items-center gap-4 text-[13px]">
                <span className="text-emerald-400">+{money(d.inc)}</span>
                <span className="text-red-400">−{money(d.out)}</span>
                <span className={`font-semibold ${d.net >= 0 ? "text-[#C5A46D]" : "text-red-400"}`}>{money(d.net)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-[13px]">
                <tbody>
                  {d.dayBookings.map((b) => (
                    <tr key={`in-${b.id}`} className="border-b border-[rgba(197,164,109,0.06)] last:border-0">
                      <td className="px-6 py-2.5 w-8"><ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" /></td>
                      <td className="px-2 py-2.5 text-[#F5F2EB]">Bron · {b.guest_name || "Mehmon"}</td>
                      <td className="px-4 py-2.5 text-[#A8A49B] max-w-[160px] truncate">{aptTitle(b.apartment_id)}</td>
                      <td className="px-6 py-2.5 text-right text-emerald-400 font-medium">+{money(b.total_price)}</td>
                    </tr>
                  ))}
                  {d.dayExpenses.map((e) => (
                    <tr key={`out-${e.id}`} className="border-b border-[rgba(197,164,109,0.06)] last:border-0">
                      <td className="px-6 py-2.5 w-8"><ArrowDownCircle className="h-3.5 w-3.5 text-red-400" /></td>
                      <td className="px-2 py-2.5 text-[#F5F2EB]">{EXPENSE_CATEGORIES[e.category] || e.category}{e.note ? ` · ${e.note}` : ""}</td>
                      <td className="px-4 py-2.5 text-[#A8A49B] max-w-[160px] truncate">{aptTitle(e.apartment_id)}</td>
                      <td className="px-6 py-2.5 text-right text-red-400 font-medium">−{money(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
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
