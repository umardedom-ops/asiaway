import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Scale, Wallet } from "lucide-react";
import KassaTabs from "./KassaTabs";

export const revalidate = 0;

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const dayKey = (d: string) => new Date(d).toISOString().split("T")[0];

export default async function KassaPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const todayKey = now.toISOString().split("T")[0];

  const [{ data: payments }, { data: expenses }, { data: bookings }, { data: apartments }] = await Promise.all([
    supabase.from("payments").select("*").order("paid_at", { ascending: false }).limit(400),
    supabase.from("expenses").select("*").order("spent_on", { ascending: false }).limit(400),
    supabase.from("bookings").select("id, guest_name, apartments(title)").neq("booking_status", "cancelled").order("created_at", { ascending: false }).limit(100),
    supabase.from("apartments").select("id, title"),
  ]);

  const pays = payments ?? [];
  const exps = expenses ?? [];
  const sign = (p: { amount: number; kind: string }) => Number(p.amount || 0) * (p.kind === "refund" ? -1 : 1);

  const todayIn = pays.filter((p) => dayKey(p.paid_at) === todayKey).reduce((s, p) => s + sign(p), 0);
  const todayOut = exps.filter((e) => e.spent_on === todayKey).reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthIn = pays.filter((p) => p.paid_at >= monthStart).reduce((s, p) => s + sign(p), 0);
  const monthOut = exps.filter((e) => e.spent_on >= monthStartDate).reduce((s, e) => s + Number(e.amount || 0), 0);

  const monthLabel = now.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Kassa</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          Mehmonlardan kirim (prixod), xarajatlar (rasxod) va kunlik oqim — bitta joyda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Bugun kirim" value={money(todayIn)} icon={<ArrowUpCircle className="h-4 w-4 text-emerald-400" />} sub={todayKey} accent />
        <StatCard title="Bugun chiqim" value={money(todayOut)} icon={<ArrowDownCircle className="h-4 w-4 text-red-400" />} sub="Rasxod" />
        <StatCard title={`${monthLabel} kirim`} value={money(monthIn)} icon={<Wallet className="h-4 w-4 text-[#C5A46D]" />} sub={`Chiqim: ${money(monthOut)}`} />
        <StatCard title="Shu oy sof kassa" value={money(monthIn - monthOut)} icon={<Scale className="h-4 w-4 text-[#C5A46D]" />} sub="Kirim − chiqim" accent={monthIn - monthOut >= 0} />
      </div>

      <KassaTabs payments={pays} expenses={exps} bookings={bookings ?? []} apartments={apartments ?? []} />
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
