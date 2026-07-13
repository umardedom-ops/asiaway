import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, CalendarDays, Banknote } from "lucide-react";
import PaymentForm from "./PaymentForm";
import DeletePaymentButton from "./DeletePaymentButton";

export const revalidate = 0;

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const fmtDateTime = (d: string) => {
  const x = new Date(d);
  return x.toLocaleString("uz-UZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const METHOD_LABELS: Record<string, string> = {
  naqd: "Naqd", karta: "Karta", payme: "Payme", click: "Click", otkazma: "O'tkazma", boshqa: "Boshqa",
};
const KIND_LABELS: Record<string, string> = {
  deposit: "Zaklat", payment: "To'lov", refund: "Qaytarish",
};
const KIND_STYLE: Record<string, string> = {
  deposit: "bg-[#C5A46D]/10 text-[#C5A46D] border-[#C5A46D]/25",
  payment: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  refund: "bg-red-500/10 text-red-400 border-red-500/20",
};

// Kirim kassasi — har mehmon to'lovi sana+soatgacha
export default async function IncomePage() {
  const supabase = await createClient();

  const now = new Date();
  const todayKey = now.toISOString().split("T")[0];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ data: paymentsRaw }, { data: bookings }] = await Promise.all([
    supabase.from("payments").select("*").order("paid_at", { ascending: false }).limit(300),
    supabase
      .from("bookings")
      .select("id, guest_name, apartments(title)")
      .neq("booking_status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const payments = paymentsRaw ?? [];

  const totalAll = payments.reduce((s, p) => s + Number(p.amount || 0) * (p.kind === "refund" ? -1 : 1), 0);
  const todayTotal = payments
    .filter((p) => String(p.paid_at).split("T")[0] === todayKey)
    .reduce((s, p) => s + Number(p.amount || 0) * (p.kind === "refund" ? -1 : 1), 0);
  const monthTotal = payments
    .filter((p) => p.paid_at >= monthStart)
    .reduce((s, p) => s + Number(p.amount || 0) * (p.kind === "refund" ? -1 : 1), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Kirim kassasi</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          Mehmonlardan kelgan har bir to&apos;lov — sana va soatgacha. Bron yaratilganda avtomat, qolgani qo&apos;lda kiritiladi.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Bugun kirim" value={money(todayTotal)} icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} sub={todayKey} accent />
        <StatCard title="Shu oy kirim" value={money(monthTotal)} icon={<CalendarDays className="h-4 w-4 text-[#C5A46D]" />} sub="Joriy oy" />
        <StatCard title="Jami (oxirgi 300)" value={money(totalAll)} icon={<Banknote className="h-4 w-4 text-[#C5A46D]" />} sub={`${payments.length} ta yozuv`} />
      </div>

      {/* Qo'lda to'lov qo'shish */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">To&apos;lov qo&apos;shish</CardTitle></CardHeader>
        <CardContent><PaymentForm bookings={bookings ?? []} /></CardContent>
      </Card>

      {/* To'lovlar jurnali */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">To&apos;lovlar jurnali</CardTitle></CardHeader>
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
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-[#A8A49B]">Hali to&apos;lov yo&apos;q. Bron yaratilganda avtomat qo&apos;shiladi yoki yuqoridan qo&apos;lda kiriting.</td></tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                    <td className="px-6 py-3 text-[#A8A49B] whitespace-nowrap">{fmtDateTime(p.paid_at)}</td>
                    <td className="px-4 py-3 text-[#F5F2EB] font-medium">{p.guest_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${KIND_STYLE[p.kind] || KIND_STYLE.payment}`}>
                        {KIND_LABELS[p.kind] || p.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#A8A49B]">{METHOD_LABELS[p.method] || p.method}</td>
                    <td className="px-4 py-3 text-[#A8A49B] max-w-[220px] truncate">{p.note || "—"}</td>
                    <td className={`px-4 py-3 text-right font-medium ${p.kind === "refund" ? "text-red-400" : "text-emerald-400"}`}>
                      {p.kind === "refund" ? "−" : "+"}{money(p.amount)}
                    </td>
                    <td className="px-6 py-3 text-right"><DeletePaymentButton id={p.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
