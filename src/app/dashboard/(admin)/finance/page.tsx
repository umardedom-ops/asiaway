import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { D, type Lang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Building2, Users, Receipt } from "lucide-react";
import { EXPENSE_CATEGORIES } from "./ExpenseForm";

export const revalidate = 0;

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default async function FinancePage() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

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

  // ARENDA HISOBI (AUDIT M2 — tuzatildi)
  // Muammo: avval 'rent' kategoriyasidagi BARCHA xarajat chiqarib tashlanardi (chunki
  // arenda monthly_lease_cost'да hisoblanadi deb taxmin qilingan). Natijada
  // monthly_lease_cost = 0 bo'lgan apartament uchun QO'LDA yozilgan arenda xarajati
  // butunlay yo'qolib, sof foyda yuqori ko'rinardi.
  //
  // Yechim: arenda BITTA manbadan — har apartament uchun
  //   max(kelishilgan monthly_lease_cost, shu oy yozilgan haqiqiy rent xarajati)
  // Ya'ni monthly_lease_cost bor bo'lsa u ishlatiladi (rent xarajati u bilan bir xil,
  // ikki marta sanalmaydi); bo'lmasa — qo'lda yozilgan xarajat hisobga olinadi.
  const activeApts = apartments.filter((a) => a.status === "active");
  const rentExpenseByApt = new Map<string, number>();
  let rentExpenseUnassigned = 0; // apartamentga bog'lanmagan arenda xarajati
  for (const e of expenses.filter((x) => x.category === "rent")) {
    if (e.apartment_id) {
      rentExpenseByApt.set(e.apartment_id, (rentExpenseByApt.get(e.apartment_id) || 0) + Number(e.amount || 0));
    } else {
      rentExpenseUnassigned += Number(e.amount || 0);
    }
  }
  const rentPerApt = (aptId: string, lease: number) =>
    Math.max(lease, rentExpenseByApt.get(aptId) || 0);

  const rentCost =
    activeApts.reduce((s, a) => s + rentPerApt(a.id, Number(a.monthly_lease_cost || 0)), 0) +
    rentExpenseUnassigned;

  const salaryCost = staffList.filter((s) => s.active).reduce((s, x) => s + Number(x.monthly_salary || 0), 0);

  // O'zgaruvchan xarajatlar — 'rent' bundan tashqarida (u rentCost'да hisoblandi)
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
    // Arenda: kelishilgan oylik yoki qo'lda yozilgan xarajat (qaysi biri katta) — M2
    const lease = rentPerApt(a.id, Number(a.monthly_lease_cost || 0));
    const exp = variableExpenses.filter((e) => e.apartment_id === a.id).reduce((s, e) => s + Number(e.amount || 0), 0);
    return { id: a.id, title: a.title, inc, lease, exp, net: inc - lease - exp };
  }).sort((x, y) => y.net - x.net);

  const monthLabel = now.toLocaleDateString(lang === "uz" ? "uz-UZ" : "ru-RU", { month: "long", year: "numeric" });

  const textDict = {
    uz: {
      desc: "kutilgan daromad (bronlar), xarajat (arenda + ish haqi + boshqa) va sof foyda. Haqiqatда olingan pul → Kirim kassasi.",
      expectedIncome: "Kutilgan daromad", expectedIncomeSub: `${monthBookings.length} ta bron · olingani Kirim kassasida`,
      totalExpenseTitle: "Umumiy xarajat", totalExpenseSub: "Doimiy + o'zgaruvchan",
      netProfit: "Sof foyda", netProfitSub: `Marja: ${margin}%`,
      cost: "Tan narx (arenda)", costSub: "Egalarga oylik",
      breakdown: "Xarajat tarkibi",
      rentCost: "Arenda (egaga)",
      salaryCost: "Ish haqi (xodimlar)",
      noExpense: "Hali xarajat kiritilmagan.",
      perApt: "Apartament bo'yicha (shu oy)",
      apt: "Apartament", income: "Daromad", lease: "Tan narx", exp: "Xarajat", net: "Sof",
      noData: "Ma'lumot yo'q"
    },
    ru: {
      desc: "ожидаемый доход (брони), расход (аренда + зарплаты + прочее) и чистая прибыль. Фактически полученные деньги → Касса.",
      expectedIncome: "Ожидаемый доход", expectedIncomeSub: `${monthBookings.length} броней · получено в Кассе`,
      totalExpenseTitle: "Общие расходы", totalExpenseSub: "Постоянные + переменные",
      netProfit: "Чистая прибыль", netProfitSub: `Маржа: ${margin}%`,
      cost: "Себестоимость (аренда)", costSub: "Ежемесячно владельцам",
      breakdown: "Структура расходов",
      rentCost: "Аренда (владельцу)",
      salaryCost: "Зарплата (сотрудники)",
      noExpense: "Расходы пока не добавлены.",
      perApt: "По апартаментам (этот месяц)",
      apt: "Апартамент", income: "Доход", lease: "Себест.", exp: "Расход", net: "Чистыми",
      noData: "Нет данных"
    },
    en: {
      desc: "expected revenue (bookings), expense (rent + salaries + other) and net profit. Actually received money → Cash Register.",
      expectedIncome: "Expected revenue", expectedIncomeSub: `${monthBookings.length} bookings · received in Cash Register`,
      totalExpenseTitle: "Total expenses", totalExpenseSub: "Fixed + variable",
      netProfit: "Net profit", netProfitSub: `Margin: ${margin}%`,
      cost: "Cost (rent)", costSub: "Monthly to owners",
      breakdown: "Expense breakdown",
      rentCost: "Rent (to owner)",
      salaryCost: "Salary (staff)",
      noExpense: "No expenses added yet.",
      perApt: "Per apartment (this month)",
      apt: "Apartment", income: "Revenue", lease: "Cost", exp: "Expense", net: "Net",
      noData: "No data"
    }
  };

  const t = textDict[lang];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{d.finance.title}</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          {monthLabel} — {t.desc}
        </p>
      </div>

      {/* P&L kartalar */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t.expectedIncome} value={money(income)} icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} sub={t.expectedIncomeSub} />
        <StatCard title={t.totalExpenseTitle} value={money(totalCost)} icon={<TrendingDown className="h-4 w-4 text-red-400" />} sub={t.totalExpenseSub} />
        <StatCard title={t.netProfit} value={money(profit)} icon={<Wallet className="h-4 w-4 text-[#C5A46D]" />} sub={t.netProfitSub} accent={profit >= 0} />
        <StatCard title={t.cost} value={money(rentCost)} icon={<Building2 className="h-4 w-4 text-[#C5A46D]" />} sub={t.costSub} />
      </div>

      {/* Xarajat taqsimoti */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none lg:col-span-1">
          <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.breakdown}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <CostLine label={t.rentCost} value={money(rentCost)} icon={<Building2 className="h-4 w-4" />} />
            <CostLine label={t.salaryCost} value={money(salaryCost)} icon={<Users className="h-4 w-4" />} />
            {Object.entries(byCat).map(([cat, val]) => (
              <CostLine key={cat} label={EXPENSE_CATEGORIES[cat] || cat} value={money(val)} icon={<Receipt className="h-4 w-4" />} />
            ))}
            {rentCost + salaryCost + variableTotal === 0 && (
              <p className="text-[13px] text-[#A8A49B] font-light">{t.noExpense}</p>
            )}
          </CardContent>
        </Card>

        {/* Apartament bo'yicha foyda */}
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none lg:col-span-2">
          <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.perApt}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                    <th className="text-left font-semibold px-6 py-3">{t.apt}</th>
                    <th className="text-right font-semibold px-4 py-3">{t.income}</th>
                    <th className="text-right font-semibold px-4 py-3">{t.lease}</th>
                    <th className="text-right font-semibold px-4 py-3">{t.exp}</th>
                    <th className="text-right font-semibold px-6 py-3">{t.net}</th>
                  </tr>
                </thead>
                <tbody>
                  {perApt.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[#A8A49B]">{t.noData}</td></tr>
                  )}
                  {perApt.map((r) => (
                    <tr key={r.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
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
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none hover:border-[rgba(197,164,109,0.3)] transition-colors">
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
