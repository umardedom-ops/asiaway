"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarCheck, BedDouble, DoorClosed, DoorOpen, CalendarDays, UsersRound, ChevronRight } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import BookingRowActions from "../bookings/BookingRowActions";
import GuestCheckoutButton from "../guests/GuestCheckoutButton";
import WalkInForm from "./WalkInForm";
import { CHANNEL_LABELS, CHANNEL_STYLE } from "../bookings/channels";

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtShort = (d?: string) => d ? new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" }) : "—";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function ReceptionTabs({ bookings, apartments, clients = [] }: { bookings: Row[]; apartments: Row[]; clients?: Row[] }) {
  const [tab, setTab] = useState<"bron" | "joylash" | "xona" | "mehmon">("bron");
  const today = new Date().toISOString().split("T")[0];
  const aptTitle = (id: string) => apartments.find((a) => a.id === id)?.title || "—";

  const staying = bookings.filter((b) => b.checked_in_at && b.booking_status !== "completed" && b.booking_status !== "cancelled");
  const arriving = bookings.filter((b) => !b.checked_in_at && b.booking_status === "confirmed" && b.check_in === today);
  const occupantOf = (aptId: string) => bookings.find((b) => b.apartment_id === aptId && b.booking_status !== "cancelled" && b.booking_status !== "completed" && b.check_in <= today && b.check_out > today);

  // Mehmonlar tabi uchun bron holati statistikasi
  const active = bookings.filter((b) => b.booking_status !== "cancelled");
  const bookedCount = active.filter((b) => b.booking_status === "confirmed" && b.check_in > today).length;
  const arrivingToday = active.filter((b) => b.booking_status === "confirmed" && b.check_in === today).length;
  const stayingCount = active.filter((b) => b.booking_status === "confirmed" && b.check_in < today && b.check_out > today).length;
  const leftCount = active.filter((b) => b.booking_status === "completed").length;

  const tabs = [
    { key: "bron", label: "Bronlar", icon: <CalendarCheck className="h-4 w-4" /> },
    { key: "joylash", label: "Joylashtirish", icon: <BedDouble className="h-4 w-4" /> },
    { key: "xona", label: "Xonalar holati", icon: <DoorClosed className="h-4 w-4" /> },
    { key: "mehmon", label: "Mehmonlar bazasi", icon: <UsersRound className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-[10px] border border-[rgba(197,164,109,0.2)] bg-[#111417] p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 h-10 rounded-[8px] text-[13.5px] font-medium transition-colors ${tab === t.key ? "bg-[#C5A46D]/15 text-[#C5A46D]" : "text-[#A8A49B] hover:text-[#F5F2EB]"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <Link href="/dashboard/bookings/new">
          <button className={`${btnPrimary} h-10 px-5 text-[13.5px] gap-2`}><Plus className="h-4 w-4" /> Qo&apos;lда bron</button>
        </Link>
      </div>

      {/* 4 ta tablo — har doim ko'rinadi */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MiniStat title="Bron qilganlar" value={`${bookedCount} ta`} color="text-[#C5A46D]" sub="Kelgusida keladi" />
        <MiniStat title="Bugun keladi" value={`${arrivingToday} ta`} color="text-emerald-400" sub="Bugungi kelishlar" />
        <MiniStat title="Hozir turibdi" value={`${stayingCount} ta`} color="text-purple-300" sub="Yashayotganlar" />
        <MiniStat title="Chiqib ketgan" value={`${leftCount} ta`} color="text-[#A8A49B]" sub="Yakunlangan" />
      </div>

      {/* BRONLAR */}
      {tab === "bron" && (
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)] bg-[#0B0D0F]/40">
                  <th className="text-left font-semibold px-6 py-4">Mehmon</th>
                  <th className="text-left font-semibold px-4 py-4">Kanal</th>
                  <th className="text-left font-semibold px-4 py-4">Xona</th>
                  <th className="text-left font-semibold px-4 py-4">Sanalar</th>
                  <th className="text-left font-semibold px-4 py-4">Narx</th>
                  <th className="text-left font-semibold px-4 py-4">Holat</th>
                  <th className="text-right font-semibold px-6 py-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && <tr><td colSpan={7} className="h-24 text-center text-[#A8A49B]">Bron yo&apos;q.</td></tr>}
                {bookings.map((b) => {
                  const ch = b.channel || "direct";
                  return (
                    <tr key={b.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                      <td className="px-6 py-4"><div className="font-medium text-[#F5F2EB]">{b.guest_name}</div><div className="text-[11px] text-[#A8A49B]">{b.guest_phone}</div></td>
                      <td className="px-4 py-4"><span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${CHANNEL_STYLE[ch] || CHANNEL_STYLE.other}`}>{CHANNEL_LABELS[ch] || ch}</span></td>
                      <td className="px-4 py-4 text-[#A8A49B] max-w-[160px] truncate">{b.apartments?.title || "—"}</td>
                      <td className="px-4 py-4 text-[#A8A49B] whitespace-nowrap">{fmtShort(b.check_in)} — {fmtShort(b.check_out)}<div className="text-[11px] text-[#A8A49B]/70">{b.nights} kecha</div></td>
                      <td className="px-4 py-4"><div className="text-[#F5F2EB] font-medium">{money(b.total_price)}</div><div className="text-[11px] text-[#A8A49B]">Zaklat: {money(b.deposit_amount)}</div></td>
                      <td className="px-4 py-4">
                        {b.booking_status === "confirmed" && b.checked_in_at ? <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/20">Turibdi</Badge>
                          : b.booking_status === "confirmed" ? <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tasdiqlangan</Badge>
                          : b.booking_status === "completed" ? <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">Yakunlangan</Badge>
                          : b.booking_status === "cancelled" ? <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">Bekor</Badge>
                          : <Badge className="bg-[#C5A46D]/10 text-[#C5A46D] border border-[#C5A46D]/20">Kutilmoqda</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right"><BookingRowActions id={b.id} bookingStatus={b.booking_status} depositStatus={b.deposit_status} checkedIn={!!b.checked_in_at} booking={b} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* JOYLASHTIRISH */}
      {tab === "joylash" && (
        <div className="space-y-6">
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Walk-in — mehmonni hozir joylashtirish</CardTitle></CardHeader>
            <CardContent><WalkInForm apartments={apartments} /></CardContent>
          </Card>

          {arriving.length > 0 && (
            <div className="flex items-start gap-3 rounded-[12px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-[13px]">
              <CalendarDays className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[#F5F2EB]">Bugun <b className="text-emerald-400">{arriving.length} ta</b> mehmon keladi: <span className="text-[#A8A49B]">{arriving.map((b) => b.guest_name).join(", ")}</span>. &quot;Bronlar&quot; tabidan &quot;Joylashtirish&quot; bosing.</div>
            </div>
          )}

          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Hozir turgan mehmonlar ({staying.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead><tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                    <th className="text-left font-semibold px-6 py-3">Mehmon</th><th className="text-left font-semibold px-4 py-3">Xona</th><th className="text-left font-semibold px-4 py-3">Keldi — Ketadi</th><th className="text-right font-semibold px-4 py-3">Summa</th><th className="text-right font-semibold px-6 py-3">Amal</th>
                  </tr></thead>
                  <tbody>
                    {staying.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-[#A8A49B]">Hozir turgan mehmon yo&apos;q.</td></tr>}
                    {staying.map((b) => (
                      <tr key={b.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                        <td className="px-6 py-3"><div className="text-[#F5F2EB] font-medium">{b.guest_name}</div><div className="text-[11px] text-[#A8A49B]">{b.guest_phone}</div></td>
                        <td className="px-4 py-3 text-[#A8A49B] max-w-[160px] truncate">{b.apartments?.title || aptTitle(b.apartment_id)}</td>
                        <td className="px-4 py-3 text-[#A8A49B] whitespace-nowrap">{fmtShort(b.check_in)} → {fmtShort(b.check_out)}<div className="text-[11px] text-[#A8A49B]/70">{b.nights} kecha</div></td>
                        <td className="px-4 py-3 text-right text-[#C5A46D] font-medium">{money(b.total_price)}</td>
                        <td className="px-6 py-3 text-right"><GuestCheckoutButton id={b.id} booking={{ ...b, apartment_title: b.apartments?.title || aptTitle(b.apartment_id) }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* XONALAR HOLATI */}
      {tab === "xona" && (
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Xonalar holati</CardTitle>
            <div className="flex items-center gap-4 text-[12px]">
              <span className="inline-flex items-center gap-1.5 text-red-400"><span className="h-2 w-2 rounded-full bg-red-400" /> Band</span>
              <span className="inline-flex items-center gap-1.5 text-blue-400"><span className="h-2 w-2 rounded-full bg-blue-400" /> Bo&apos;sh</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {apartments.map((a) => {
                const occ = occupantOf(a.id);
                const busy = !!occ;
                return (
                  <div key={a.id} className={`rounded-[12px] border p-4 transition-colors ${busy ? "border-red-500/20 bg-red-500/5 opacity-60" : "border-blue-500/25 bg-blue-500/5"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${busy ? "text-red-400" : "text-blue-400"}`}>
                        <span className={`h-2 w-2 rounded-full ${busy ? "bg-red-400" : "bg-blue-400"}`} /> {busy ? "Band" : "Bo'sh"}
                      </span>
                      {a.floor != null && <span className="text-[11px] text-[#A8A49B]">{a.floor}-qavat</span>}
                    </div>
                    <div className="text-[14px] font-medium text-[#F5F2EB] leading-snug line-clamp-2">{a.title}</div>
                    {occ && <div className="mt-2 pt-2 border-t border-[rgba(197,164,109,0.1)] text-[12px] text-[#A8A49B]"><div className="text-[#F5F2EB]">{occ.guest_name}</div><div>{fmtDate(occ.check_in)} → {fmtDate(occ.check_out)}</div></div>}
                  </div>
                );
              })}
              {apartments.length === 0 && <div className="col-span-full text-center text-[#A8A49B] py-8">Faol apartament yo&apos;q.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MEHMONLAR BAZASI */}
      {tab === "mehmon" && (
        <div className="space-y-6">
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Mehmonlar bazasi ({clients.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                      <th className="text-left font-semibold px-6 py-3">Mijoz</th>
                      <th className="text-right font-semibold px-4 py-3">Tashriflar</th>
                      <th className="text-right font-semibold px-4 py-3">Umumiy sarf</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-[#A8A49B]">Hali mehmon yo&apos;q. Bron kiritilganda avtomat qo&apos;shiladi.</td></tr>}
                    {clients.map((c) => (
                      <tr key={c.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30 group">
                        <td className="px-6 py-3">
                          <Link href={`/dashboard/clients/${c.id}`} className="block">
                            <div className="text-[#F5F2EB] font-medium group-hover:text-[#C5A46D] transition-colors">{c.full_name}</div>
                            <div className="text-[11px] text-[#A8A49B]">{c.phone || "—"}</div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right text-[#F5F2EB]">{c.total_stays || 0}</td>
                        <td className="px-4 py-3 text-right text-[#C5A46D] font-medium">{money(c.total_spent)}</td>
                        <td className="px-6 py-3 text-right"><Link href={`/dashboard/clients/${c.id}`} className="inline-flex text-[#A8A49B] group-hover:text-[#C5A46D]"><ChevronRight className="h-4 w-4" /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MiniStat({ title, value, color, sub }: { title: string; value: string; color: string; sub: string }) {
  return (
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
      <CardHeader className="pb-2"><CardTitle className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{title}</CardTitle></CardHeader>
      <CardContent><div className={`text-[26px] font-medium ${color}`}>{value}</div><p className="text-[11px] text-[#A8A49B] mt-1.5 font-light">{sub}</p></CardContent>
    </Card>
  );
}
