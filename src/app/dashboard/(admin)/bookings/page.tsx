import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import BookingRowActions from "./BookingRowActions";
import { CHANNEL_LABELS, CHANNEL_STYLE } from "./channels";

export const revalidate = 0;

const formatPrice = (amount: number) => `$${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" });

export default async function BookingsPage() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, apartments(title)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Bronlar ro&apos;yxati</h1>
          <p className="text-[14px] text-[#A8A49B] mt-1 font-light">Saytdagi va qo&apos;lда kiritilgan (Airbnb / Booking / Instagram / WhatsApp) bronlar.</p>
        </div>
        <Link href="/dashboard/bookings/new">
          <button className={`${btnPrimary} h-11 px-6 text-[14px] gap-2`}>
            <Plus className="h-4 w-4" /> Qo&apos;lда bron qo&apos;shish
          </button>
        </Link>
      </div>

      {error ? (
        <div className="rounded-[8px] bg-red-950/20 p-4 text-red-400 border border-red-900/50 text-[14px]">
          Ma&apos;lumotlarni yuklashda xatolik: {error.message}
        </div>
      ) : (
        <div className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)] bg-[#0B0D0F]/40">
                  <th className="text-left font-semibold px-6 py-4">Mehmon</th>
                  <th className="text-left font-semibold px-4 py-4">Kanal</th>
                  <th className="text-left font-semibold px-4 py-4">Apartament</th>
                  <th className="text-left font-semibold px-4 py-4">Kelish — Ketish</th>
                  <th className="text-left font-semibold px-4 py-4">Narx</th>
                  <th className="text-left font-semibold px-4 py-4">Zaklat</th>
                  <th className="text-left font-semibold px-4 py-4">Holat</th>
                  <th className="text-right font-semibold px-6 py-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {bookings && bookings.length > 0 ? (
                  bookings.map((b) => {
                    const aptTitle = b.apartments?.title || "O'chirilgan kvartira";
                    const ch = b.channel || "direct";
                    return (
                      <tr key={b.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#F5F2EB]">{b.guest_name}</div>
                          <div className="text-[11px] text-[#A8A49B]">{b.guest_phone}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${CHANNEL_STYLE[ch] || CHANNEL_STYLE.other}`}>
                            {CHANNEL_LABELS[ch] || ch}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#A8A49B] max-w-[180px] truncate" title={aptTitle}>{aptTitle}</td>
                        <td className="px-4 py-4 text-[#A8A49B] whitespace-nowrap">{formatDate(b.check_in)} — {formatDate(b.check_out)}<div className="text-[11px] text-[#A8A49B]/70">{b.nights} kecha</div></td>
                        <td className="px-4 py-4">
                          <div className="text-[#F5F2EB] font-medium">{formatPrice(b.total_price)}</div>
                          <div className="text-[11px] text-[#A8A49B]">Zaklat: {formatPrice(b.deposit_amount)}</div>
                        </td>
                        <td className="px-4 py-4">
                          {b.deposit_status === "paid" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20">To&apos;langan</Badge>
                          ) : b.deposit_status === "refunded" ? (
                            <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20">Qaytarilgan</Badge>
                          ) : (
                            <Badge className="bg-[#C5A46D]/10 text-[#C5A46D] hover:bg-[#C5A46D]/10 border border-[#C5A46D]/20">Kutilmoqda</Badge>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {b.booking_status === "confirmed" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20">Tasdiqlangan</Badge>
                          ) : b.booking_status === "cancelled" ? (
                            <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/10 border border-red-500/20">Bekor</Badge>
                          ) : b.booking_status === "completed" ? (
                            <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20">Yakunlangan</Badge>
                          ) : (
                            <Badge className="bg-[#C5A46D]/10 text-[#C5A46D] hover:bg-[#C5A46D]/10 border border-[#C5A46D]/20">Kutilmoqda</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <BookingRowActions id={b.id} bookingStatus={b.booking_status} depositStatus={b.deposit_status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="h-24 text-center text-[#A8A49B]">Bronlar mavjud emas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
