import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DoorOpen, DoorClosed, CalendarDays } from "lucide-react";
import GuestCheckoutButton from "./GuestCheckoutButton";
import { getDashDict } from "@/lib/dash-lang";
import StatCard from "@/components/dashboard/StatCard";

export const revalidate = 0;

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const todayStr = () => new Date().toISOString().split("T")[0];

// Mehmon joylashtirish: hozir turgan mehmonlar + xonalar bandligi (band / bo'sh)
export default async function GuestsPage() {
  const supabase = await createClient();
  const d = await getDashDict();
  const today = todayStr();
  const dateLocale = d.lang === "ru" ? "ru-RU" : d.lang === "en" ? "en-US" : "uz-UZ";
  const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString(dateLocale, { day: "numeric", month: "short" }) : "—";

  const [{ data: aptsRaw }, { data: bookingsRaw }] = await Promise.all([
    supabase.from("apartments").select("id, title, floor, status").eq("status", "active").order("floor", { ascending: false }),
    supabase
      .from("bookings")
      .select("id, apartment_id, guest_name, guest_phone, check_in, check_out, nights, total_price, checked_in_at, booking_status")
      .in("booking_status", ["confirmed"])
      .order("check_in", { ascending: true }),
  ]);

  const apartments = aptsRaw ?? [];
  const bookings = bookingsRaw ?? [];

  // Xona bandligi — bugungi kun bron oralig'iga to'g'ri kelsa band (sana asosida)
  const occupantOf = (aptId: string) =>
    bookings.find(
      (b) => b.apartment_id === aptId && b.check_in <= today && b.check_out > today
    );

  // "Hozir turibdi" — faqat JOYLASHTIRILGAN (check-in qilingan) mehmonlar.
  // Voronka bilan bir xil ta'rif (chalkashlik bo'lmasin).
  const staying = bookings.filter((b) => b.checked_in_at);

  // Bugun keladi (kutilmoqda) — sana bugun, lekin hali joylashtirilmagan
  const arrivingToday = bookings.filter(
    (b) => !b.checked_in_at && b.check_in === today
  );

  const occupiedCount = apartments.filter((a) => occupantOf(a.id)).length;
  const freeCount = apartments.length - occupiedCount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{d.guestsPage.title}</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">{d.guestsPage.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title={d.guestsPage.stayingNow} value={`${staying.length}`} icon={<Users className="h-4 w-4 text-purple-300" />} sub={d.guestsPage.placedGuests} />
        <StatCard title={d.guestsPage.busyRooms} value={`${occupiedCount}`} icon={<DoorClosed className="h-4 w-4 text-red-400" />} sub={d.guestsPage.busyToday} />
        <StatCard title={d.guestsPage.freeRooms} value={`${freeCount}`} icon={<DoorOpen className="h-4 w-4 text-blue-400" />} sub={d.guestsPage.ready} accent />
      </div>

      {arrivingToday.length > 0 && (
        <div className="flex items-start gap-3 rounded-[12px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-[13px]">
          <CalendarDays className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[#F5F2EB]">
            {d.guestsPage.arrivingA} <b className="text-emerald-400">{arrivingToday.length}</b> {d.guestsPage.arrivingB}{" "}
            <span className="text-[#A8A49B]">{arrivingToday.map((b) => b.guest_name).join(", ")}</span>.
            <span className="text-[#A8A49B]"> {d.guestsPage.clickPlace}</span>
          </div>
        </div>
      )}

      {/* Xonalar bandligi tablosi */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{d.guestsPage.roomsStatus}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {apartments.map((a) => {
              const occ = occupantOf(a.id);
              const busy = !!occ;
              return (
                <div
                  key={a.id}
                  className={`rounded-[12px] border p-4 transition-colors ${
                    busy
                      ? "border-red-500/20 bg-red-500/5 opacity-60"
                      : "border-blue-500/25 bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${busy ? "text-red-400" : "text-blue-400"}`}>
                      <span className={`h-2 w-2 rounded-full ${busy ? "bg-red-400" : "bg-blue-400"}`} />
                      {busy ? d.guestsPage.busy : d.guestsPage.free}
                    </span>
                    {a.floor != null && <span className="text-[11px] text-[#A8A49B]">{a.floor}{d.guestsPage.floorSuffix}</span>}
                  </div>
                  <div className="text-[14px] font-medium text-[#F5F2EB] leading-snug line-clamp-2">{a.title}</div>
                  {occ && (
                    <div className="mt-2 pt-2 border-t border-[rgba(197,164,109,0.1)] text-[12px] text-[#A8A49B]">
                      <div className="text-[#F5F2EB]">{occ.guest_name}</div>
                      <div>{fmtDate(occ.check_in)} → {fmtDate(occ.check_out)}</div>
                    </div>
                  )}
                </div>
              );
            })}
            {apartments.length === 0 && (
              <div className="col-span-full text-center text-[#A8A49B] py-8">{d.guestsPage.noActiveApt}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hozir turgan mehmonlar */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{d.guestsPage.currentGuests}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                  <th className="text-left font-semibold px-6 py-3">{d.guestsPage.guest}</th>
                  <th className="text-left font-semibold px-4 py-3">{d.guestsPage.room}</th>
                  <th className="text-left font-semibold px-4 py-3">{d.guestsPage.datesCol}</th>
                  <th className="text-right font-semibold px-4 py-3">{d.guestsPage.amount}</th>
                  <th className="text-right font-semibold px-6 py-3">{d.guestsPage.action}</th>
                </tr>
              </thead>
              <tbody>
                {staying.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-[#A8A49B]">{d.guestsPage.noStaying}</td></tr>
                )}
                {staying.map((b) => {
                  const apt = apartments.find((a) => a.id === b.apartment_id);
                  return (
                    <tr key={b.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                      <td className="px-6 py-3">
                        <div className="text-[#F5F2EB] font-medium">{b.guest_name}</div>
                        <div className="text-[11px] text-[#A8A49B]">{b.guest_phone || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-[#A8A49B] max-w-[180px] truncate">{apt?.title || "—"}</td>
                      <td className="px-4 py-3 text-[#A8A49B] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#C5A46D]" /> {fmtDate(b.check_in)} → {fmtDate(b.check_out)}</span>
                        <div className="text-[11px] text-[#A8A49B]/70">{b.nights} {d.guestsPage.nights}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-[#C5A46D] font-medium">{money(b.total_price)}</td>
                      <td className="px-6 py-3 text-right"><GuestCheckoutButton id={b.id} booking={{ ...b, apartment_title: apt?.title }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
