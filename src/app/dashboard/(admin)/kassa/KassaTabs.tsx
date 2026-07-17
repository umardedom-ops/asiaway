"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, CalendarRange } from "lucide-react";
import PaymentForm from "../income/PaymentForm";
import DeletePaymentButton from "../income/DeletePaymentButton";
import ExpenseForm, { EXPENSE_CATEGORIES, EXPENSE_CATEGORIES_RU } from "../finance/ExpenseForm";
import DeleteExpenseButton from "../finance/DeleteExpenseButton";
import { useDashLang } from "@/components/DashboardLangProvider";
import { fmtDate as fmtDateLib } from "@/lib/date-fmt";

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });

const KIND_STYLE: Record<string, string> = {
  deposit: "bg-[#C5A46D]/10 text-[#C5A46D] border-[#C5A46D]/25",
  payment: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  refund: "bg-red-500/10 text-red-400 border-red-500/20",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function KassaTabs({
  payments, expenses, bookings, apartments,
}: { payments: Row[]; expenses: Row[]; bookings: Row[]; apartments: Row[] }) {
  const [tab, setTab] = useState<"kirim" | "chiqim" | "kunlik">("kirim");
  const aptTitle = (id: string | null) => apartments.find((a) => a.id === id)?.title || "—";
  const d = useDashLang();

  const isUz = d.lang === "uz";

  const expenseCats = isUz ? EXPENSE_CATEGORIES : EXPENSE_CATEGORIES_RU;

  const METHOD_LABELS: Record<string, string> = isUz 
    ? { naqd: "Naqd", karta: "Karta", payme: "Payme", click: "Click", otkazma: "O'tkazma", boshqa: "Boshqa" }
    : { naqd: "Наличные", karta: "Карта", payme: "Payme", click: "Click", otkazma: "Перевод", boshqa: "Другое" };

  const KIND_LABELS: Record<string, string> = isUz
    ? { deposit: "Zaklat", payment: "To'lov", refund: "Qaytarish" }
    : { deposit: "Задаток", payment: "Оплата", refund: "Возврат" };

  // Kunlik oqim uchun — oxirgi 30 kun kunma-kun (kirim payments + chiqim expenses)
  const dk = (d: string) => new Date(d).toISOString().split("T")[0];
  const sign = (p: Row) => Number(p.amount || 0) * (p.kind === "refund" ? -1 : 1);
  const dayKeys = Array.from(new Set([
    ...payments.map((p) => dk(p.paid_at)),
    ...expenses.map((e) => dk(e.spent_on)),
  ])).sort((a, b) => (a < b ? 1 : -1)).slice(0, 30);
  const days = dayKeys.map((k) => {
    const dp = payments.filter((p) => dk(p.paid_at) === k);
    const de = expenses.filter((e) => dk(e.spent_on) === k);
    const inc = dp.reduce((s, p) => s + sign(p), 0);
    const out = de.reduce((s, e) => s + Number(e.amount || 0), 0);
    return { k, dp, de, inc, out, net: inc - out };
  });
  // BUG FIX: Intl "uz-UZ" bilan month:"long" ishlatilganda "M07" kabi buzuq chiqadi
  const fmtDay = (k: string) => fmtDateLib(k, isUz ? "uz" : "ru", { day: "numeric", month: "long", weekday: "short" });

  const tabBtn = (key: typeof tab, label: string, icon: React.ReactNode, active: string) => (
    <button onClick={() => setTab(key)}
      className={`inline-flex shrink-0 items-center gap-2 px-5 h-10 rounded-[8px] text-[14px] font-medium whitespace-nowrap transition-colors ${tab === key ? active : "text-[#A8A49B] hover:text-[#F5F2EB]"}`}>
      {icon} {label}
    </button>
  );

  const t = isUz ? {
    tabIn: "Kirim (prixod)", tabOut: "Chiqim (rasxod)", tabDay: "Kunlik oqim",
    addIn: "Kirim qo'shish (mehmondan pul)", inLog: "Kirim jurnali",
    date: "Sana / Soat", guest: "Mehmon", type: "Turi", method: "Usul", note: "Izoh", amount: "Summa", noIn: "Hali kirim yo'q.",
    addOut: "Chiqim qo'shish (xarajat)", addOutSub: "Masalan: xodim mahsulotga pul oldi, kommunal, ta'mirlash, ish haqi.", outLog: "Chiqim jurnali",
    dateOut: "Sana", catOut: "Turi", aptOut: "Apartament", noOut: "Hali chiqim yo'q.",
    noAction: "Oxirgi 30 kunda harakat yo'q.",
    paymentStr: "To'lov"
  } : {
    tabIn: "Приход", tabOut: "Расход", tabDay: "Ежедневный поток",
    addIn: "Добавить приход (от гостя)", inLog: "Журнал приходов",
    date: "Дата / Время", guest: "Гость", type: "Тип", method: "Способ", note: "Примечание", amount: "Сумма", noIn: "Приходов пока нет.",
    addOut: "Добавить расход", addOutSub: "Например: продукты, коммунальные, ремонт, зарплата.", outLog: "Журнал расходов",
    dateOut: "Дата", catOut: "Категория", aptOut: "Апартамент", noOut: "Расходов пока нет.",
    noAction: "За последние 30 дней движений нет.",
    paymentStr: "Оплата"
  };

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex rounded-[10px] border border-[rgba(197,164,109,0.2)] bg-[#111417] p-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabBtn("kirim", t.tabIn, <ArrowUpCircle className="h-4 w-4" />, "bg-emerald-500/15 text-emerald-400")}
        {tabBtn("chiqim", t.tabOut, <ArrowDownCircle className="h-4 w-4" />, "bg-red-500/15 text-red-400")}
        {tabBtn("kunlik", t.tabDay, <CalendarRange className="h-4 w-4" />, "bg-[#C5A46D]/15 text-[#C5A46D]")}
      </div>

      {tab === "kirim" ? (
        <>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.addIn}</CardTitle></CardHeader>
            <CardContent><PaymentForm bookings={bookings} /></CardContent>
          </Card>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.inLog}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                      <th className="text-left font-semibold px-6 py-3">{t.date}</th>
                      <th className="text-left font-semibold px-4 py-3">{t.guest}</th>
                      <th className="text-left font-semibold px-4 py-3">{t.type}</th>
                      <th className="text-left font-semibold px-4 py-3">{t.method}</th>
                      <th className="text-left font-semibold px-4 py-3">{t.note}</th>
                      <th className="text-right font-semibold px-4 py-3">{t.amount}</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-10 text-center text-[#A8A49B]">{t.noIn}</td></tr>
                    )}
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                        <td className="px-6 py-3 text-[#A8A49B] whitespace-nowrap">{fmtDateTime(p.paid_at)}</td>
                        <td className="px-4 py-3 text-[#F5F2EB] font-medium">{p.guest_name || "—"}</td>
                        <td className="px-4 py-3"><span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${KIND_STYLE[p.kind] || KIND_STYLE.payment}`}>{KIND_LABELS[p.kind] || p.kind}</span></td>
                        <td className="px-4 py-3 text-[#A8A49B]">{METHOD_LABELS[p.method] || p.method}</td>
                        <td className="px-4 py-3 text-[#A8A49B] max-w-[200px] truncate">{p.note || "—"}</td>
                        <td className={`px-4 py-3 text-right font-medium ${p.kind === "refund" ? "text-red-400" : "text-emerald-400"}`}>{p.kind === "refund" ? "−" : "+"}{money(p.amount)}</td>
                        <td className="px-6 py-3 text-right"><DeletePaymentButton id={p.id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : tab === "chiqim" ? (
        <>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader>
              <CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.addOut}</CardTitle>
              <p className="text-[12px] text-[#A8A49B] font-light">{t.addOutSub}</p>
            </CardHeader>
            <CardContent><ExpenseForm apartments={apartments} /></CardContent>
          </Card>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.outLog}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                      <th className="text-left font-semibold px-6 py-3">{t.dateOut}</th>
                      <th className="text-left font-semibold px-4 py-3">{t.catOut}</th>
                      <th className="text-left font-semibold px-4 py-3">{t.aptOut}</th>
                      <th className="text-left font-semibold px-4 py-3">{t.note}</th>
                      <th className="text-right font-semibold px-4 py-3">{t.amount}</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-[#A8A49B]">{t.noOut}</td></tr>
                    )}
                    {expenses.map((e) => (
                      <tr key={e.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                        <td className="px-6 py-3 text-[#A8A49B] whitespace-nowrap">{fmtDate(e.spent_on)}</td>
                        <td className="px-4 py-3 text-[#F5F2EB]">{expenseCats[e.category] || e.category}</td>
                        <td className="px-4 py-3 text-[#A8A49B] max-w-[160px] truncate">{aptTitle(e.apartment_id)}</td>
                        <td className="px-4 py-3 text-[#A8A49B] max-w-[220px] truncate">{e.note || "—"}</td>
                        <td className="px-4 py-3 text-right text-red-400 font-medium">−{money(e.amount)}</td>
                        <td className="px-6 py-3 text-right"><DeleteExpenseButton id={e.id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-4">
          {days.length === 0 && (
            <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
              <CardContent className="py-10 text-center text-[#A8A49B]">{t.noAction}</CardContent>
            </Card>
          )}
          {days.map((d) => (
            <Card key={d.k} className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-[rgba(197,164,109,0.1)]">
                <CardTitle className="text-[15px] font-medium text-[#F5F2EB] capitalize">{fmtDay(d.k)}</CardTitle>
                <div className="flex items-center gap-4 text-[13px]">
                  <span className="text-emerald-400">+{money(d.inc)}</span>
                  <span className="text-red-400">−{money(d.out)}</span>
                  <span className={`font-semibold ${d.net >= 0 ? "text-[#C5A46D]" : "text-red-400"}`}>{money(d.net)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-[13px]">
                  <tbody>
                    {d.dp.map((p) => (
                      <tr key={`in-${p.id}`} className="border-b border-[rgba(197,164,109,0.06)] last:border-0">
                        <td className="px-6 py-2.5 w-8"><ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" /></td>
                        <td className="px-2 py-2.5 text-[#F5F2EB]">{KIND_LABELS[p.kind] || t.paymentStr} · {p.guest_name || t.guest}</td>
                        <td className="px-4 py-2.5 text-[#A8A49B]">{METHOD_LABELS[p.method] || p.method}</td>
                        <td className={`px-6 py-2.5 text-right font-medium ${p.kind === "refund" ? "text-red-400" : "text-emerald-400"}`}>{p.kind === "refund" ? "−" : "+"}{money(p.amount)}</td>
                      </tr>
                    ))}
                    {d.de.map((e) => (
                      <tr key={`out-${e.id}`} className="border-b border-[rgba(197,164,109,0.06)] last:border-0">
                        <td className="px-6 py-2.5 w-8"><ArrowDownCircle className="h-3.5 w-3.5 text-red-400" /></td>
                        <td className="px-2 py-2.5 text-[#F5F2EB]">{expenseCats[e.category] || e.category}{e.note ? ` · ${e.note}` : ""}</td>
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
      )}
    </div>
  );
}
