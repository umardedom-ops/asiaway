"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarCheck, BedDouble, DoorClosed, DoorOpen, CalendarDays, UsersRound, ChevronRight, Info } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import BookingRowActions from "../bookings/BookingRowActions";
import GuestCheckoutButton from "../guests/GuestCheckoutButton";
import WalkInForm from "./WalkInForm";
import { CHANNEL_STYLE } from "../bookings/channels";
import { useDashLang } from "@/components/DashboardLangProvider";
import { fmtDate as fmtDateLib } from "@/lib/date-fmt";

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default function ReceptionTabs({ bookings, apartments, clients = [] }: { bookings: Row[]; apartments: Row[]; clients?: Row[] }) {
  const [tab, setTab] = useState<"bron" | "joylash" | "xona" | "mehmon">("bron");
  const today = new Date().toISOString().split("T")[0];
  const aptTitle = (id: string) => apartments.find((a) => a.id === id)?.title || "—";
  const d = useDashLang();
  // BUG FIX: Intl "uz-UZ" bilan month:"short" ishlatilganda "M07" kabi buzuq chiqadi
  const fmtDate = (dt?: string) => fmtDateLib(dt, d.lang, { day: "numeric", month: "short", year: "numeric" });
  const fmtShort = (dt?: string) => fmtDateLib(dt, d.lang, { day: "numeric", month: "short" });

  const staying = bookings.filter((b) => b.checked_in_at && b.booking_status !== "completed" && b.booking_status !== "cancelled");
  const arriving = bookings.filter((b) => !b.checked_in_at && b.booking_status === "confirmed" && b.check_in === today);
  const occupantOf = (aptId: string) => staying.find((b) => b.apartment_id === aptId) || bookings.find((b) => b.apartment_id === aptId && b.booking_status !== "cancelled" && b.booking_status !== "completed" && b.check_in <= today && b.check_out > today);

  const tabs = [
    { key: "bron", label: d.reception.tabs.bookings, icon: <CalendarCheck className="h-4 w-4" /> },
    { key: "joylash", label: d.reception.tabs.placement, icon: <BedDouble className="h-4 w-4" /> },
    { key: "xona", label: d.reception.tabs.rooms, icon: <DoorClosed className="h-4 w-4" /> },
    { key: "mehmon", label: d.reception.tabs.guestsDb, icon: <UsersRound className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-[10px] border border-[rgba(197,164,109,0.2)] bg-[#111417] p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`inline-flex items-center justify-center gap-2 px-4 h-10 rounded-[8px] text-[13.5px] font-medium transition-all duration-200 ${tab === t.key ? "bg-[#C5A46D]/15 text-[#C5A46D] scale-[1.02]" : "text-[#A8A49B] hover:text-[#F5F2EB] hover:bg-white/5 active:scale-[0.98]"}`}>
              {t.icon} <span>{t.label}</span>
            </button>
          ))}
        </div>
        <Link href="/dashboard/bookings/new">
          <button className={`${btnPrimary} h-10 px-5 text-[13.5px] gap-2 flex items-center justify-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}>
            <Plus className="h-4 w-4" /> <span>{d.reception.newBooking}</span>
          </button>
        </Link>
      </div>

      {/* BRONLAR */}
      {tab === "bron" && (
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)] bg-[#0B0D0F]/40">
                  <th className="text-left font-semibold px-6 py-4">{d.reception.guest}</th>
                  <th className="text-left font-semibold px-4 py-4">{d.reception.channel}</th>
                  <th className="text-left font-semibold px-4 py-4">{d.reception.room}</th>
                  <th className="text-left font-semibold px-4 py-4">{d.reception.dates}</th>
                  <th className="text-left font-semibold px-4 py-4">{d.reception.price}</th>
                  <th className="text-left font-semibold px-4 py-4">{d.reception.status}</th>
                  <th className="text-right font-semibold px-6 py-4">{d.reception.actions}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && <tr><td colSpan={7} className="h-24 text-center text-[#A8A49B]">{d.reception.noBookings}</td></tr>}
                {bookings.map((b) => {
                  const ch = b.channel || "direct";
                  const chLabel = d.channels[ch as keyof typeof d.channels] || ch;
                  return (
                    <tr key={b.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                      <td className="px-6 py-4"><div className="font-medium text-[#F5F2EB]">{b.guest_name}</div><div className="text-[11px] text-[#A8A49B]">{b.guest_phone}</div></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${CHANNEL_STYLE[ch] || CHANNEL_STYLE.other}`}>{chLabel}</span>
                          {(b.utm_data || b.source || b.notes) && (
                            <div className="relative flex items-center justify-center">
                              <span className="peer p-1 -m-1 cursor-help text-[#A8A49B] hover:text-[#C5A46D] transition-colors">
                                <Info className="h-4 w-4" />
                              </span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0B0D0F] border border-[rgba(197,164,109,0.2)] rounded-[6px] text-[10px] text-[#A8A49B] opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all z-50 shadow-xl shadow-[#0B0D0F]">
                                {b.source && <div><strong>Source:</strong> {b.source}</div>}
                                {b.utm_data?.utm_medium && <div><strong>Medium:</strong> {b.utm_data.utm_medium}</div>}
                                {b.utm_data?.utm_campaign && <div><strong>Campaign:</strong> {b.utm_data.utm_campaign}</div>}
                                {b.notes && <div className="mt-1 border-t border-[rgba(197,164,109,0.1)] pt-1 text-[#F5F2EB]"><strong>{d.booking.notes}:</strong> {b.notes}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#A8A49B] max-w-[160px] truncate">{b.apartments?.title || "—"}</td>
                      <td className="px-4 py-4 text-[#A8A49B] whitespace-nowrap">{fmtShort(b.check_in)} — {fmtShort(b.check_out)}<div className="text-[11px] text-[#A8A49B]/70">{b.nights} {d.reception.nights}</div></td>
                      <td className="px-4 py-4"><div className="text-[#F5F2EB] font-medium">{money(b.total_price)}</div><div className="text-[11px] text-[#A8A49B]">{d.reception.deposit}: {money(b.deposit_amount)}</div></td>
                      <td className="px-4 py-4">
                        {b.booking_status === "confirmed" && b.checked_in_at ? <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/20">{d.reception.staying}</Badge>
                          : b.booking_status === "confirmed" ? <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{d.reception.confirmed}</Badge>
                          : b.booking_status === "completed" ? <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">{d.reception.completed}</Badge>
                          : b.booking_status === "cancelled" ? <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">{d.reception.cancelled}</Badge>
                          : <Badge className="bg-[#C5A46D]/10 text-[#C5A46D] border border-[#C5A46D]/20">{d.reception.pending}</Badge>}
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
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{d.reception.walkInTitle}</CardTitle></CardHeader>
            <CardContent><WalkInForm apartments={apartments} /></CardContent>
          </Card>

          {arriving.length > 0 && (
            <div className="flex items-start gap-3 rounded-[12px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-[13px]">
              <CalendarDays className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[#F5F2EB]">{d.reception.arrivingToday}: <b className="text-emerald-400">{arriving.length}</b> {d.reception.guestsArrive}: <span className="text-[#A8A49B]">{arriving.map((b) => b.guest_name).join(", ")}</span>. {d.reception.clickPlace}</div>
            </div>
          )}

          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{d.reception.currentGuests} ({staying.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead><tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                    <th className="text-left font-semibold px-6 py-3">{d.reception.guest}</th><th className="text-left font-semibold px-4 py-3">{d.reception.room}</th><th className="text-left font-semibold px-4 py-3">{d.reception.arrived} — {d.reception.leaves}</th><th className="text-right font-semibold px-4 py-3">{d.ownerPay.amount}</th><th className="text-right font-semibold px-6 py-3">{d.reception.action}</th>
                  </tr></thead>
                  <tbody>
                    {staying.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-[#A8A49B]">{d.reception.noGuests}</td></tr>}
                    {staying.map((b) => (
                      <tr key={b.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                        <td className="px-6 py-3"><div className="text-[#F5F2EB] font-medium">{b.guest_name}</div><div className="text-[11px] text-[#A8A49B]">{b.guest_phone}</div></td>
                        <td className="px-4 py-3 text-[#A8A49B] max-w-[160px] truncate">{b.apartments?.title || aptTitle(b.apartment_id)}</td>
                        <td className="px-4 py-3 text-[#A8A49B] whitespace-nowrap">{fmtShort(b.check_in)} → {fmtShort(b.check_out)}<div className="text-[11px] text-[#A8A49B]/70">{b.nights} {d.reception.nights}</div></td>
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
            <CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{d.reception.roomStatus}</CardTitle>
            <div className="flex items-center gap-4 text-[12px]">
              <span className="inline-flex items-center gap-1.5 text-red-400"><span className="h-2 w-2 rounded-full bg-red-400" />{d.reception.busy}</span>
              <span className="inline-flex items-center gap-1.5 text-blue-400"><span className="h-2 w-2 rounded-full bg-blue-400" />{d.reception.free}</span>
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
                        <span className={`h-2 w-2 rounded-full ${busy ? "bg-red-400" : "bg-blue-400"}`} /> {busy ? d.reception.busy : d.reception.free}
                      </span>
                      {a.floor != null && <span className="text-[11px] text-[#A8A49B]">{a.floor}-{d.reception.floor}</span>}
                    </div>
                    <div className="text-[14px] font-medium text-[#F5F2EB] leading-snug line-clamp-2">{a.title}</div>
                    {occ && <div className="mt-2 pt-2 border-t border-[rgba(197,164,109,0.1)] text-[12px] text-[#A8A49B]"><div className="text-[#F5F2EB]">{occ.guest_name}</div><div>{fmtDate(occ.check_in)} → {fmtDate(occ.check_out)}</div></div>}
                  </div>
                );
              })}
              {apartments.length === 0 && <div className="col-span-full text-center text-[#A8A49B] py-8">{d.reception.noActiveApt}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MEHMONLAR BAZASI */}
      {tab === "mehmon" && (
        <div className="space-y-6">
          <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{d.reception.clientsDb} ({clients.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                      <th className="text-left font-semibold px-6 py-3">{d.reception.client}</th>
                      <th className="text-right font-semibold px-4 py-3">{d.reception.visits}</th>
                      <th className="text-right font-semibold px-4 py-3">{d.reception.totalSpent}</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-[#A8A49B]">{d.reception.noClients}</td></tr>}
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
