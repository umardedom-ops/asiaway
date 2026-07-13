"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Plus, Trash2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any;

type InvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
};

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export default function InvoiceModal({ isOpen, onClose, booking }: InvoiceModalProps) {
  const [extraServices, setExtraServices] = useState<{ name: string; price: number }[]>([
    { name: "Mini-bar", price: 0 },
    { name: "Transfer", price: 0 },
  ]);

  const addService = () => setExtraServices([...extraServices, { name: "", price: 0 }]);
  const removeService = (i: number) => setExtraServices(extraServices.filter((_, idx) => idx !== i));
  const changeService = (i: number, field: "name" | "price", value: string) => {
    const updated = [...extraServices];
    if (field === "price") updated[i].price = Number(value) || 0;
    else updated[i].name = value;
    setExtraServices(updated);
  };

  const nights = booking?.nights || 0;
  const perNight = nights > 0 ? Math.round((booking?.total_price || 0) / nights) : (booking?.total_price || 0);
  const basePrice = Number(booking?.total_price || 0);
  const deposit = Number(booking?.deposit_amount ?? booking?.deposit ?? 0);
  const depositPaid = booking?.deposit_status === "paid";
  const extraTotal = extraServices.reduce((s, x) => s + (x.price || 0), 0);
  // Zaklat to'langan bo'lsagina yakuniy summadan chegiriladi
  const finalTotal = basePrice + extraTotal - (depositPaid ? deposit : 0);

  const aptTitle = booking?.apartments?.title || booking?.apartment_title || "Apartament";
  const guestName = booking?.clients?.full_name || booking?.guest_name || "Mehmon";
  const invoiceNo = booking?.id ? booking.id.slice(0, 8).toUpperCase() : "—";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0B0D0F] text-[#F5F2EB] border-[rgba(197,164,109,0.22)] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#C5A46D] font-heading text-xl border-b border-[rgba(197,164,109,0.22)] pb-4">
            Chek · Hisob-faktura (Check-out)
          </DialogTitle>
        </DialogHeader>

        {/* ===== PRINTABLE INVOICE ===== */}
        <div id="print-area" className="bg-white text-black rounded-md my-2 print:m-0 print:rounded-none">
          <div className="p-8 print:p-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#C5A46D] pb-5 mb-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                  ASIA WAY <span className="text-[#B8925A]">APARTMENTS</span>
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">Nest One, Tashkent City</p>
                <p className="text-[13px] text-gray-500">Tel: +998 99 000 00 00 · asiaway.uz</p>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Chek raqami</div>
                <div className="text-lg font-bold text-[#B8925A]">#{invoiceNo}</div>
                <div className="text-[12px] text-gray-500 mt-2">Sana: {fmtDate(new Date().toISOString())}</div>
              </div>
            </div>

            {/* Guest + stay info */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-[13px]">
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Mehmon</div>
                <div className="font-semibold text-[15px]">{guestName}</div>
                {booking?.guest_phone && <div className="text-gray-600">{booking.guest_phone}</div>}
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Apartament</div>
                <div className="font-semibold">{aptTitle}</div>
                <div className="text-gray-600">
                  {fmtDate(booking?.check_in)} → {fmtDate(booking?.check_out)} · {nights} kecha
                </div>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-left mb-5 text-[13px]">
              <thead>
                <tr className="border-b-2 border-gray-800 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-2">Xizmat</th>
                  <th className="py-2 text-center w-24">Miqdor</th>
                  <th className="py-2 text-right w-28">Summa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2.5">Ijara (arenda)</td>
                  <td className="py-2.5 text-center text-gray-500">{money(perNight)} × {nights}</td>
                  <td className="py-2.5 text-right font-medium">{money(basePrice)}</td>
                </tr>
                {extraServices.filter((s) => s.name && s.price > 0).map((s, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-2.5">{s.name}</td>
                    <td className="py-2.5 text-center text-gray-500">1</td>
                    <td className="py-2.5 text-right font-medium">{money(s.price)}</td>
                  </tr>
                ))}
                {depositPaid && deposit > 0 && (
                  <tr className="border-b border-gray-200 text-emerald-700">
                    <td className="py-2.5">Oldindan to&apos;langan zaklat (chegirma)</td>
                    <td className="py-2.5 text-center">—</td>
                    <td className="py-2.5 text-right font-medium">−{money(deposit)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-[13px]">
                <div className="flex justify-between text-gray-600">
                  <span>Ijara + xizmatlar</span>
                  <span>{money(basePrice + extraTotal)}</span>
                </div>
                {depositPaid && deposit > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Zaklat chegirmasi</span>
                    <span>−{money(deposit)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-gray-800 pt-2 mt-1 text-[16px] font-bold">
                  <span>JAMI TO&apos;LOV</span>
                  <span className="text-[#B8925A]">{money(finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[12px] text-gray-400">
              Tashrifingiz uchun rahmat! ASIA WAY sizni yana kutib qoladi.
            </div>
          </div>
        </div>

        {/* ===== EDITOR (chop etilmaydi) ===== */}
        <div className="space-y-3 print:hidden border-t border-[rgba(197,164,109,0.22)] pt-4">
          <h3 className="text-[#C5A46D] font-medium text-[14px]">Qo&apos;shimcha xizmatlar / jarimalar</h3>
          {extraServices.map((service, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input
                value={service.name}
                onChange={(e) => changeService(index, "name", e.target.value)}
                placeholder="Xizmat nomi (masalan: Mini-bar)"
                className="bg-[#111417] border-[rgba(197,164,109,0.22)] h-10"
              />
              <Input
                type="number"
                value={service.price || ""}
                onChange={(e) => changeService(index, "price", e.target.value)}
                placeholder="$"
                className="w-28 bg-[#111417] border-[rgba(197,164,109,0.22)] h-10"
              />
              <button
                onClick={() => removeService(index)}
                aria-label="O'chirish"
                className="text-[#A8A49B] hover:text-red-400 transition-colors p-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addService} className="text-[#A8A49B] border-[rgba(197,164,109,0.3)] hover:text-[#C5A46D]">
            <Plus className="h-4 w-4 mr-1.5" /> Xizmat qo&apos;shish
          </Button>
        </div>

        <DialogFooter className="print:hidden gap-2">
          <Button variant="outline" onClick={onClose} className="border-[rgba(197,164,109,0.22)]">Yopish</Button>
          <Button onClick={() => window.print()} className="bg-[#C5A46D] text-black hover:bg-[#D4B77F]">
            <Printer className="w-4 h-4 mr-2" /> Chek chiqarish (PDF)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
