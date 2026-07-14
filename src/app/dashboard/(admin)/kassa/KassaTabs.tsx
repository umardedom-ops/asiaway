"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, CalendarRange } from "lucide-react";
import PaymentForm from "../income/PaymentForm";
import DeletePaymentButton from "../income/DeletePaymentButton";
import ExpenseForm, { EXPENSE_CATEGORIES } from "../finance/ExpenseForm";
import DeleteExpenseButton from "../finance/DeleteExpenseButton";

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });

const METHOD_LABELS: Record<string, string> = { naqd: "Naqd", karta: "Karta", payme: "Payme", click: "Click", otkazma: "O'tkazma", boshqa: "Boshqa" };
const KIND_LABELS: Record<string, string> = { deposit: "Zaklat", payment: "To'lov", refund: "Qaytarish" };
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
  const fmtDay = (k: string) => new Date(k).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", weekday: "short" });

  const tabBtn = (key: typeof tab, label: string, icon: React.ReactNode, active: string) => (
    <button onClick={() => setTab(key)}
      className={`inline-flex items-center gap-2 px-5 h-10 rounded-[8px] text-[14px] font-medium transition-colors ${tab === key ? active : "text-[#A8A49B] hover:text-[#F5F2EB]"}`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="inline-flex flex-wrap rounded-[10px] border border-[rgba(197,164,109,0.2)] bg-[#111417] p-1 gap-1">
        {tabBtn("kirim", "Kirim (prixod)", <ArrowUpCircle className="h-4 w-4" />, "bg-emerald-500/15 text-emerald-400")}
        {tabBtn("chiqim", "Chiqim (rasxod)", <ArrowDownCircle className="h-4 w-4" />, "bg-red-500/15 text-red-400")}
        {tabBtn("kunlik", "Kunlik oqim", <CalendarRange className="h-4 w-4" />, "bg-[#C5A46D]/15 text-[#C5A46D]")}
      </div>

      {tab === "kirim" ? (
        <>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Kirim qo&apos;shish (mehmondan pul)</CardTitle></CardHeader>
            <CardContent><PaymentForm bookings={bookings} /></CardContent>
          </Card>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Kirim jurnali</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                      <th className="text-left font-semibold px-6 py-3">Sana / Soat</th>
                      <th className="text-left font-semibold px-4 py-3">Mehmon</th>
                      <th className="text-left font-semibold px-4 py-3">Turi</th>
                      <th className="text-left font-semibold px-4 py-3">Usul</th>
                      <th className="text-left font-semibold px-4 py-3">Izoh</th>
                      <th className="text-right font-semibold px-4 py-3">Summa</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-10 text-center text-[#A8A49B]">Hali kirim yo&apos;q.</td></tr>
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
      ) : (
        <>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader>
              <CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Chiqim qo&apos;shish (xarajat)</CardTitle>
              <p className="text-[12px] text-[#A8A49B] font-light">Masalan: xodim mahsulotga pul oldi, kommunal, ta&apos;mirlash, ish haqi.</p>
            </CardHeader>
            <CardContent><ExpenseForm apartments={apartments} /></CardContent>
          </Card>
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Chiqim jurnali</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                      <th className="text-left font-semibold px-6 py-3">Sana</th>
                      <th className="text-left font-semibold px-4 py-3">Turi</th>
                      <th className="text-left font-semibold px-4 py-3">Apartament</th>
                      <th className="text-left font-semibold px-4 py-3">Izoh</th>
                      <th className="text-right font-semibold px-4 py-3">Summa</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-[#A8A49B]">Hali chiqim yo&apos;q.</td></tr>
                    )}
                    {expenses.map((e) => (
                      <tr key={e.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                        <td className="px-6 py-3 text-[#A8A49B] whitespace-nowrap">{fmtDate(e.spent_on)}</td>
                        <td className="px-4 py-3 text-[#F5F2EB]">{EXPENSE_CATEGORIES[e.category] || e.category}</td>
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
      )}

      {tab === "kunlik" && (
        <div className="space-y-4">
          {days.length === 0 && (
            <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
              <CardContent className="py-10 text-center text-[#A8A49B]">Oxirgi 30 kunda harakat yo&apos;q.</CardContent>
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
                        <td className="px-2 py-2.5 text-[#F5F2EB]">{KIND_LABELS[p.kind] || "To'lov"} · {p.guest_name || "Mehmon"}</td>
                        <td className="px-4 py-2.5 text-[#A8A49B]">{METHOD_LABELS[p.method] || p.method}</td>
                        <td className={`px-6 py-2.5 text-right font-medium ${p.kind === "refund" ? "text-red-400" : "text-emerald-400"}`}>{p.kind === "refund" ? "−" : "+"}{money(p.amount)}</td>
                      </tr>
                    ))}
                    {d.de.map((e) => (
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
      )}
    </div>
  );
}
