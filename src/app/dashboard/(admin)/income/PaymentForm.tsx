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

import { getCleanApartmentLabel, sortApartments } from "@/lib/apartment-label";
import { useDashLang } from "@/components/DashboardLangProvider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PaymentForm({ bookings = [], apartments = [] }: { bookings?: any[]; apartments?: any[] }) {
  const router = useRouter();
  const d = useDashLang();
  const isRu = d.lang === "ru";

  const [apartmentId, setApartmentId] = useState("");
  const [f, setF] = useState({ booking_id: "", guest_name: "", amount: "", method: "naqd", note: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const sortedApartments = sortApartments(apartments);

  // Kvartira tanlanganda tegishli bron va mehmonni avtomat topish
  const onApartmentChange = (aptId: string) => {
    setApartmentId(aptId);
    if (!aptId) {
      return;
    }
    // Shu kvartiraga tegishli eng oxirgi faol bronni topish
    const matchedBooking = bookings.find((b) => b.apartment_id === aptId || b.apartments?.id === aptId);
    if (matchedBooking) {
      setF((p) => ({
        ...p,
        booking_id: matchedBooking.id,
        guest_name: matchedBooking.guest_name || p.guest_name,
      }));
    } else {
      setF((p) => ({
        ...p,
        booking_id: "",
      }));
    }
  };

  const onBooking = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (b) {
      setF((p) => ({ ...p, booking_id: id, guest_name: b.guest_name || p.guest_name }));
      if (b.apartment_id || b.apartments?.id) {
        setApartmentId(b.apartment_id || b.apartments?.id);
      }
    } else {
      setF((p) => ({ ...p, booking_id: id }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr("");

    const chosenApt = apartments.find((a) => a.id === apartmentId);
    const aptLabel = chosenApt ? getCleanApartmentLabel(chosenApt, d.lang) : "";

    // Agar bronsiz kiritilayotgan bo'lsa, izohda kvartira nomi saqlanadi
    let finalNote = f.note.trim();
    if (chosenApt && !f.booking_id) {
      finalNote = finalNote ? `[${aptLabel}] ${finalNote}` : `[${aptLabel}]`;
    }

    const res = await addPayment({
      booking_id: f.booking_id || undefined,
      guest_name: f.guest_name,
      amount: Number(f.amount) || 0,
      method: f.method,
      note: finalNote,
    });
    setSaving(false);
    if (res.success) {
      setApartmentId("");
      setF({ booking_id: "", guest_name: "", amount: "", method: "naqd", note: "" });
      router.refresh();
    } else {
      setErr(res.error || (isRu ? "Ошибка" : "Xatolik"));
    }
  };

  // Tanlangan kvartira bo'yicha filtr yoki barcha bronlar
  const filteredBookings = apartmentId
    ? bookings.filter((b) => b.apartment_id === apartmentId || b.apartments?.id === apartmentId)
    : bookings;

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <div className="rounded-[8px] bg-red-950/40 p-3 text-red-400 border border-red-900/50 text-[13px]">{err}</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Apartament tanlash */}
        <div className="space-y-2 lg:col-span-2">
          <label className={labelCls}>{isRu ? "Апартамент" : "Apartament"}</label>
          <select value={apartmentId} onChange={(e) => onApartmentChange(e.target.value)} className={inputCls}>
            <option value="">— {isRu ? "Все апартаменты / Не выбран" : "Barcha apartamentlar / Tanlanmagan"} —</option>
            {sortedApartments.map((a) => (
              <option key={a.id} value={a.id}>
                {getCleanApartmentLabel(a, d.lang)}
              </option>
            ))}
          </select>
        </div>

        {/* Bron tanlash (agar bo'lsa) */}
        <div className="space-y-2 lg:col-span-1">
          <label className={labelCls}>{isRu ? "Бронь (если есть)" : "Bron (agar bo'lsa)"}</label>
          <select value={f.booking_id} onChange={(e) => onBooking(e.target.value)} className={inputCls}>
            <option value="">— {isRu ? "Без брони" : "Bronsiz"} —</option>
            {filteredBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.guest_name} {b.apartments ? `· ${getCleanApartmentLabel(b.apartments, d.lang)}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className={labelCls}>{isRu ? "Гость *" : "Mehmon *"}</label>
          <input value={f.guest_name} onChange={(e) => set("guest_name", e.target.value)} placeholder={isRu ? "Имя гостя" : "Mehmon ismi"} className={inputCls} required />
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className={labelCls}>{isRu ? "Сумма ($) *" : "Summa ($) *"}</label>
          <input type="number" min="0" value={f.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0" className={inputCls} required />
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className={labelCls}>{isRu ? "Способ" : "Usul"}</label>
          <select value={f.method} onChange={(e) => set("method", e.target.value)} className={inputCls}>
            {METHODS.map((m) => <option key={m.v} value={m.v}>{isRu && m.v === "naqd" ? "Наличные" : isRu && m.v === "karta" ? "Карта" : isRu && m.v === "otkazma" ? "Перевод" : isRu && m.v === "boshqa" ? "Другое" : m.l}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="space-y-2 flex-1">
          <label className={labelCls}>{isRu ? "Примечание" : "Izoh"}</label>
          <input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder={isRu ? "Например: остаток суммы, мини-бар..." : "Masalan: qolgan summa, mini-bar..."} className={inputCls} />
        </div>
        <button type="submit" disabled={saving} className={`${btnPrimary} h-11 px-6 text-[14px] gap-2 shrink-0`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {isRu ? "Добавить оплату" : "To'lov qo'shish"}
        </button>
      </div>
    </form>
  );
}
