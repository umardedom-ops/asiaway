import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { CHANNEL_LABELS } from "../bookings/channels";
import BookingStatCards from "../BookingStatCards";

export const revalidate = 0;

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const STAGE_LABELS: Record<string, string> = {
  lead: "Murojaat",
  contacted: "Aloqada",
  booked: "Bron qildi",
  staying: "Yashamoqda",
  checked_out: "Ketdi",
  repeat: "Takroriy",
};

const STAGE_STYLE: Record<string, string> = {
  lead: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-[#A8A49B]/10 text-[#A8A49B] border-[#A8A49B]/20",
  booked: "bg-[#C5A46D]/10 text-[#C5A46D] border-[#C5A46D]/25",
  staying: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  checked_out: "bg-[#A8A49B]/10 text-[#A8A49B] border-[#A8A49B]/20",
  repeat: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: clientsRaw }] = await Promise.all([
    supabase.from("clients").select("*").order("total_spent", { ascending: false }),
  ]);

  const clients = clientsRaw ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Mehmonlar</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">Bron qilgan, kelayotgan, turgan va chiqib ketgan mehmonlar. Ismni bosing — to&apos;lov tarixi chiqadi.</p>
      </div>

      <BookingStatCards />

      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Mijozlar ro&apos;yxati</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                  <th className="text-left font-semibold px-6 py-3">Mijoz</th>
                  <th className="text-left font-semibold px-4 py-3">Kanal</th>
                  <th className="text-left font-semibold px-4 py-3">Bosqich</th>
                  <th className="text-right font-semibold px-4 py-3">Tashriflar</th>
                  <th className="text-right font-semibold px-4 py-3">Sarf</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-[#A8A49B]">Hali mehmon yo&apos;q. Bron kiritilganда avtomatik qo&apos;shiladi.</td></tr>
                )}
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30 cursor-pointer group">
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/clients/${c.id}`} className="block">
                        <div className="text-[#F5F2EB] font-medium group-hover:text-[#C5A46D] transition-colors">{c.full_name}</div>
                        <div className="text-[11px] text-[#A8A49B]">{c.phone || "—"}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#A8A49B]">{CHANNEL_LABELS[c.channel] || c.channel || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${STAGE_STYLE[c.stage] || STAGE_STYLE.lead}`}>
                        {STAGE_LABELS[c.stage] || c.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#F5F2EB]">{c.total_stays || 0}</td>
                    <td className="px-4 py-3 text-right text-[#C5A46D] font-medium">{money(c.total_spent)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/dashboard/clients/${c.id}`} className="inline-flex text-[#A8A49B] group-hover:text-[#C5A46D] transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
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
