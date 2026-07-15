import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, CalendarDays, Wallet, Repeat } from "lucide-react";
import { CHANNEL_LABELS } from "../../bookings/channels";

export const revalidate = 0;

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!client) notFound();

  let bookingsRaw: any[] | null = [];

  if (client.phone) {
    // Agar mijozda telefon bo'lsa, qadimiy (client_id yo'q, lekin telefoni mos) bronlarni ham topish uchun:
    const [{ data: bById }, { data: bByPhone }] = await Promise.all([
      supabase.from("bookings").select("*, apartments(title)").eq("client_id", id).order("check_in", { ascending: false }),
      supabase.from("bookings").select("*, apartments(title)").eq("guest_phone", client.phone).order("check_in", { ascending: false })
    ]);
    const all = [...(bById ?? []), ...(bByPhone ?? [])];
    const uniqueMap = new Map();
    for (const b of all) uniqueMap.set(b.id, b);
    bookingsRaw = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());
  } else {
    const { data } = await supabase.from("bookings").select("*, apartments(title)").eq("client_id", id).order("check_in", { ascending: false });
    bookingsRaw = data;
  }
  
  const bookings = bookingsRaw ?? [];

  const totalPaid = bookings
    .filter((b) => b.booking_status !== "cancelled")
    .reduce((s, b) => s + Number(b.total_price || 0), 0);
  const validStays = bookings.filter((b) => b.booking_status !== "cancelled").length;

  return (
    <div className="space-y-8">
      <Link href="/dashboard/clients" className="inline-flex items-center gap-2 text-[13px] text-[#A8A49B] hover:text-[#C5A46D] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Mehmonlar ro&apos;yxati
      </Link>

      {/* Mehmon sarlavha */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{client.full_name}</h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-[13px] text-[#A8A49B]">
            {client.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#C5A46D]" /> {client.phone}</span>}
            {client.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#C5A46D]" /> {client.email}</span>}
            <span>Kanal: {CHANNEL_LABELS[client.channel] || client.channel || "—"}</span>
          </div>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Umumiy sarf" value={money(totalPaid)} icon={<Wallet className="h-4 w-4 text-[#C5A46D]" />} sub="Bekor qilinmagan bronlar" accent />
        <StatCard title="Tashriflar" value={`${validStays} marta`} icon={<CalendarDays className="h-4 w-4 text-emerald-400" />} sub="Jami bronlar" />
        <StatCard title="Bosqich" value={client.total_stays > 1 ? "Takroriy" : "Yangi"} icon={<Repeat className="h-4 w-4 text-amber-400" />} sub={`${client.total_stays || 0} ta yakunlangan`} />
      </div>

      {/* To'lov tarixi */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">To&apos;lov tarixi</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                  <th className="text-left font-semibold px-6 py-3">Sana</th>
                  <th className="text-left font-semibold px-4 py-3">Apartament</th>
                  <th className="text-left font-semibold px-4 py-3">Muddat</th>
                  <th className="text-right font-semibold px-4 py-3">Summa</th>
                  <th className="text-left font-semibold px-4 py-3">Zaklat</th>
                  <th className="text-left font-semibold px-6 py-3">Holat</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-[#A8A49B]">Bu mehmon uchun bron topilmadi.</td></tr>
                )}
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                    <td className="px-6 py-3 text-[#A8A49B] whitespace-nowrap">{fmtDate(b.check_in)}</td>
                    <td className="px-4 py-3 text-[#F5F2EB] max-w-[180px] truncate">{b.apartments?.title || "—"}</td>
                    <td className="px-4 py-3 text-[#A8A49B] whitespace-nowrap">{b.nights} kecha</td>
                    <td className="px-4 py-3 text-right text-[#C5A46D] font-medium">{money(b.total_price)}</td>
                    <td className="px-4 py-3">
                      {b.deposit_status === "paid" ? (
                        <span className="text-[11px] text-emerald-400">To&apos;langan</span>
                      ) : b.deposit_status === "refunded" ? (
                        <span className="text-[11px] text-blue-400">Qaytarilgan</span>
                      ) : (
                        <span className="text-[11px] text-[#A8A49B]">Kutilmoqda</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {b.booking_status === "confirmed" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20">Tasdiqlangan</Badge>
                      ) : b.booking_status === "completed" ? (
                        <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20">Yakunlangan</Badge>
                      ) : b.booking_status === "cancelled" ? (
                        <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/10 border border-red-500/20">Bekor</Badge>
                      ) : (
                        <Badge className="bg-[#C5A46D]/10 text-[#C5A46D] hover:bg-[#C5A46D]/10 border border-[#C5A46D]/20">Kutilmoqda</Badge>
                      )}
                    </td>
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
