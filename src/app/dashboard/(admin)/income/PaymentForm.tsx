"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPayment } from "./actions";
import { Loader2, Plus } from "lucide-react";
import { btnPrimary } from "@/lib/ui";

const inputCls =
  "w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors";
const labelCls = "text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]";

const METHODS = [
  { v: "naqd", l: "Naqd" },
  { v: "karta", l: "Karta" },
  { v: "payme", l: "Payme" },
  { v: "click", l: "Click" },
  { v: "otkazma", l: "O'tkazma" },
  { v: "boshqa", l: "Boshqa" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PaymentForm({ bookings }: { bookings: any[] }) {
  const router = useRouter();
  const [f, setF] = useState({ booking_id: "", guest_name: "", amount: "", method: "naqd", note: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const onBooking = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    setF((p) => ({ ...p, booking_id: id, guest_name: b ? b.guest_name : p.guest_name }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr("");
    const res = await addPayment({
      booking_id: f.booking_id || undefined,
      guest_name: f.guest_name,
      amount: Number(f.amount) || 0,
      method: f.method,
      note: f.note,
    });
    setSaving(false);
    if (res.success) { setF({ booking_id: "", guest_name: "", amount: "", method: "naqd", note: "" }); router.refresh(); }
    else setErr(res.error || "Xatolik");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <div className="rounded-[8px] bg-red-950/40 p-3 text-red-400 border border-red-900/50 text-[13px]">{err}</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2 lg:col-span-2">
          <label className={labelCls}>Bron (ixtiyoriy)</label>
          <select value={f.booking_id} onChange={(e) => onBooking(e.target.value)} className={inputCls}>
            <option value="">— Bronsiz —</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>{b.guest_name} · {b.apartments?.title || ""}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Mehmon *</label>
          <input value={f.guest_name} onChange={(e) => set("guest_name", e.target.value)} className={inputCls} required />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Summa ($) *</label>
          <input type="number" min="0" value={f.amount} onChange={(e) => set("amount", e.target.value)} className={inputCls} required />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Usul</label>
          <select value={f.method} onChange={(e) => set("method", e.target.value)} className={inputCls}>
            {METHODS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="space-y-2 flex-1">
          <label className={labelCls}>Izoh</label>
          <input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Masalan: qolgan summa, mini-bar..." className={inputCls} />
        </div>
        <button type="submit" disabled={saving} className={`${btnPrimary} h-11 px-6 text-[14px] gap-2`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} To&apos;lov qo&apos;shish
        </button>
      </div>
    </form>
  );
}
