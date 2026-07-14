"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createManualBooking, placeGuestNow } from "@/app/dashboard/bookings/actions";
import { getBookedDates } from "@/app/actions/booking";
import { Loader2, Check, LogIn } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import { CHANNEL_LABELS } from "./channels";
import DateField from "./DateField";

const inputCls =
  "w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors";
const labelCls = "text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]";

interface Prefill { leadId?: string; name?: string; phone?: string; place?: boolean }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ManualBookingForm({ apartments, prefill }: { apartments: any[]; prefill?: Prefill }) {
  const router = useRouter();
  const [f, setF] = useState({
    apartment_id: "", guest_name: prefill?.name || "", guest_phone: prefill?.phone || "", guest_email: "",
    channel: "airbnb", check_in: "", check_out: "",
    total_price: "", deposit_amount: "", deposit_status: "paid", booking_status: "confirmed",
  });
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [err, setErr] = useState("");
  const [bookedRanges, setBookedRanges] = useState<{ start: Date; end: Date }[]>([]);
  const [placeNow, setPlaceNow] = useState(!!prefill?.place); // "Hozir joylashtirish" (check-in)
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const nights = f.check_in && f.check_out
    ? Math.round((new Date(f.check_out).getTime() - new Date(f.check_in).getTime()) / 86400000)
    : 0;

  const selectedApt = apartments.find((a) => a.id === f.apartment_id);

  // Apartament tanlanganda band sanalarni yuklaymiz (kalendarda bloklash uchun)
  useEffect(() => {
    if (!f.apartment_id) { setBookedRanges([]); return; }
    getBookedDates(f.apartment_id).then((r) => setBookedRanges(r)).catch(() => setBookedRanges([]));
  }, [f.apartment_id]);

  // Sana/apartament o'zgarsa — narx va zaklatni avtomat to'ldiramiz (agar bo'sh bo'lsa)
  useEffect(() => {
    if (selectedApt && nights > 0) {
      const autoTotal = nights * Number(selectedApt.price_per_day || 0);
      setF((p) => ({
        ...p,
        total_price: p.total_price && Number(p.total_price) > 0 ? p.total_price : String(autoTotal),
        deposit_amount: p.deposit_amount && Number(p.deposit_amount) > 0 ? p.deposit_amount : String(selectedApt.deposit_amount || 0),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.apartment_id, f.check_in, f.check_out]);

  // Band sana tekshiruvi (kalendarda o'chirish uchun)
  const isBooked = (date: Date) => {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return bookedRanges.some(({ start, end }) => {
      const s = new Date(start); s.setHours(0, 0, 0, 0);
      const e = new Date(end); e.setHours(0, 0, 0, 0);
      return d >= s && d < e;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving"); setErr("");
    const payload = {
      apartment_id: f.apartment_id,
      guest_name: f.guest_name,
      guest_phone: f.guest_phone,
      guest_email: f.guest_email,
      channel: f.channel,
      check_in: f.check_in,
      check_out: f.check_out,
      total_price: Number(f.total_price) || 0,
      deposit_amount: Number(f.deposit_amount) || 0,
      deposit_status: f.deposit_status as "pending" | "paid" | "refunded",
      booking_status: f.booking_status as "pending" | "confirmed" | "completed",
      lead_id: prefill?.leadId || undefined,
    };
    // "Hozir joylashtirish" belgilangan bo'lsa — bron + check-in bir amalda
    const res = placeNow ? await placeGuestNow(payload) : await createManualBooking(payload);
    if (res.success) {
      router.push(placeNow ? "/dashboard/guests" : "/dashboard/bookings");
      router.refresh();
    } else { setErr(res.error || "Xatolik"); setState("error"); }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {state === "error" && (
        <div className="rounded-[8px] bg-red-950/40 p-4 text-red-400 border border-red-900/50 text-[14px]">{err}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelCls}>Apartament *</label>
          <select value={f.apartment_id} onChange={(e) => set("apartment_id", e.target.value)} className={inputCls} required>
            <option value="">— Tanlang —</option>
            {apartments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Kanal (qayerdan)</label>
          <select value={f.channel} onChange={(e) => set("channel", e.target.value)} className={inputCls}>
            {Object.entries(CHANNEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className={labelCls}>Mehmon ismi *</label>
          <input value={f.guest_name} onChange={(e) => set("guest_name", e.target.value)} className={inputCls} required />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Telefon</label>
          <input value={f.guest_phone} onChange={(e) => set("guest_phone", e.target.value)} placeholder="+998" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Email</label>
          <input type="email" value={f.guest_email} onChange={(e) => set("guest_email", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className={labelCls}>Kelish sanasi *</label>
          <DateField value={f.check_in} onChange={(v) => { set("check_in", v); if (f.check_out && v && f.check_out <= v) set("check_out", ""); }} isBooked={f.apartment_id ? isBooked : undefined} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Ketish sanasi *</label>
          <DateField value={f.check_out} onChange={(v) => set("check_out", v)} min={f.check_in || undefined} isBooked={f.apartment_id ? isBooked : undefined} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Kechalar</label>
          <div className="h-11 flex items-center px-3 text-[14px] text-[#C5A46D] font-medium">{nights > 0 ? `${nights} kecha` : "—"}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className={labelCls}>Umumiy narx ($)</label>
          <input type="number" min="0" value={f.total_price} onChange={(e) => set("total_price", e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Zaklat ($)</label>
          <input type="number" min="0" value={f.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Zaklat holati</label>
          <select value={f.deposit_status} onChange={(e) => set("deposit_status", e.target.value)} className={inputCls}>
            <option value="paid">To&apos;langan</option>
            <option value="pending">Kutilmoqda</option>
            <option value="refunded">Qaytarilgan</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Bron holati</label>
          <select value={f.booking_status} onChange={(e) => set("booking_status", e.target.value)} className={inputCls}>
            <option value="confirmed">Tasdiqlangan</option>
            <option value="pending">Kutilmoqda</option>
            <option value="completed">Yakunlangan</option>
          </select>
        </div>
      </div>

      {/* Hozir joylashtirish (check-in) tanlovi */}
      <label className="flex items-center gap-3 pt-4 cursor-pointer select-none">
        <input type="checkbox" checked={placeNow} onChange={(e) => setPlaceNow(e.target.checked)}
          className="h-5 w-5 rounded border-[rgba(197,164,109,0.4)] bg-[#0B0D0F] accent-[#C5A46D]" />
        <span className="text-[14px] text-[#F5F2EB]">Hozir joylashtirish (mehmon darrov &quot;turibdi&quot; holatiga o&apos;tadi)</span>
      </label>

      <div className="flex gap-4 pt-4 border-t border-[rgba(197,164,109,0.14)]">
        <button type="submit" disabled={state === "saving"} className={`${btnPrimary} h-12 px-8 text-[15px] gap-2`}>
          {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : placeNow ? <LogIn className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {placeNow ? "Joylashtirish" : "Bronni saqlash"}
        </button>
        <button type="button" onClick={() => router.push("/dashboard/bookings")} className={`${btnSecondary} h-12 px-8 text-[15px]`}>
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
