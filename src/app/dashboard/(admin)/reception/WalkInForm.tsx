"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeGuestNow } from "@/app/dashboard/bookings/actions";
import { Loader2, LogIn } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import DateField from "../bookings/DateField";

const inputCls =
  "w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors";
const labelCls = "text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]";

const todayStr = () => new Date().toISOString().split("T")[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function WalkInForm({ apartments }: { apartments: any[] }) {
  const router = useRouter();
  const [f, setF] = useState({
    apartment_id: "", guest_name: "", guest_phone: "",
    check_in: todayStr(), check_out: "", total_price: "", deposit_amount: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const apt = apartments.find((a) => a.id === f.apartment_id);
  const nights = f.check_in && f.check_out
    ? Math.round((new Date(f.check_out).getTime() - new Date(f.check_in).getTime()) / 86400000) : 0;
  const autoTotal = apt && nights > 0 ? nights * Number(apt.price_per_day || 0) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.apartment_id) { setErr("Xonani tanlang"); return; }
    if (!f.guest_name.trim()) { setErr("Mehmon ismini kiriting"); return; }
    if (!f.check_out) { setErr("Ketish sanasini tanlang"); return; }
    setSaving(true); setErr("");
    const res = await placeGuestNow({
      apartment_id: f.apartment_id,
      guest_name: f.guest_name,
      guest_phone: f.guest_phone,
      channel: "direct",
      check_in: f.check_in,
      check_out: f.check_out,
      total_price: Number(f.total_price) || autoTotal,
      deposit_amount: Number(f.deposit_amount) || 0,
      deposit_status: "paid",
      booking_status: "confirmed",
    });
    setSaving(false);
    if (res.success) {
      setF({ apartment_id: "", guest_name: "", guest_phone: "", check_in: todayStr(), check_out: "", total_price: "", deposit_amount: "" });
      router.refresh();
    } else setErr(res.error || "Xatolik");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <div className="rounded-[8px] bg-red-950/40 p-3 text-red-400 border border-red-900/50 text-[13px]">{err}</div>}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Xona *</label>
          <select value={f.apartment_id} onChange={(e) => set("apartment_id", e.target.value)} className={inputCls} required>
            <option value="">— Tanlang —</option>
            {apartments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Mehmon *</label>
          <input value={f.guest_name} onChange={(e) => set("guest_name", e.target.value)} className={inputCls} required />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Telefon</label>
          <input value={f.guest_phone} onChange={(e) => set("guest_phone", e.target.value)} placeholder="+998" className={inputCls} />
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Keldi</label>
          <DateField value={f.check_in} onChange={(v) => set("check_in", v)} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Ketadi *</label>
          <DateField value={f.check_out} onChange={(v) => set("check_out", v)} min={f.check_in || undefined} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Summa ($)</label>
          <input type="number" min="0" value={f.total_price} onChange={(e) => set("total_price", e.target.value)} placeholder={autoTotal ? String(autoTotal) : "0"} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Zaklat ($)</label>
          <input type="number" min="0" value={f.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} placeholder="0" className={inputCls} />
        </div>
      </div>
      <button type="submit" disabled={saving} className={`${btnPrimary} h-11 px-6 text-[14px] gap-2`}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Hozir joylashtirish
      </button>
    </form>
  );
}
