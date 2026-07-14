"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Plus, Trash2, Loader2 } from "lucide-react";
import { getBookingPayments } from "@/app/dashboard/bookings/actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any;
interface Payment { id: string; amount: number; method: string; kind: string; note: string | null; paid_at: string }

type InvoiceModalProps = { isOpen: boolean; onClose: () => void; booking: Booking };

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const fmtDT = (d: string) => new Date(d).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const METHOD: Record<string, string> = { naqd: "Naqd", karta: "Karta", payme: "Payme", click: "Click", otkazma: "O'tkazma", boshqa: "Boshqa" };
const KIND: Record<string, string> = { deposit: "Zaklat", payment: "To'lov", refund: "Qaytarish" };

export default function InvoiceModal({ isOpen, onClose, booking }: InvoiceModalProps) {
  const [extraServices, setExtraServices] = useState<{ name: string; price: number }[]>([
    { name: "Mini-bar", price: 0 },
  ]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal ochilганда — bron to'lovlarini yuklaymiz (haqiqiy olingan pul)
  useEffect(() => {
    if (isOpen && booking?.id) {
      setLoading(true);
      getBookingPayments(booking.id)
        .then((p) => setPayments(p as Payment[]))
        .catch(() => setPayments([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, booking?.id]);

  const addService = () => setExtraServices([...extraServices, { name: "", price: 0 }]);
  const removeService = (i: number) => setExtraServices(extraServices.filter((_, idx) => idx !== i));
  const changeService = (i: number, field: "name" | "price", value: string) => {
    const updated = [...extraServices];
    if (field === "price") updated[i].price = Number(value) || 0;
    else updated[i].name = value;
    setExtraServices(updated);
  };

  const nights = booking?.nights || 0;
  const basePrice = Number(booking?.total_price || 0);
  const perNight = nights > 0 ? Math.round(basePrice / nights) : basePrice;
  const extraList = extraServices.filter((s) => s.name && s.price > 0);
  const extraTotal = extraList.reduce((s, x) => s + x.price, 0);
  const totalCharge = basePrice + extraTotal;

  // Haqiqatда olingan pul (payments jadvalidan)
  const paidTotal = payments.reduce((s, p) => s + Number(p.amount || 0) * (p.kind === "refund" ? -1 : 1), 0);
  const balance = totalCharge - paidTotal;

  const aptTitle = booking?.apartments?.title || booking?.apartment_title || "Apartament";
  const guestName = booking?.clients?.full_name || booking?.guest_name || "Mehmon";
  const invoiceNo = booking?.id ? booking.id.slice(0, 8).toUpperCase() : "—";

  // Chekni ALOHIDA oynada chop etamiz (modal ichida bo'sh chiqmasligi uchun)
  const printInvoice = () => {
    const rows: string[] = [];
    rows.push(`<tr><td>Ijara (arenda)</td><td class="c">${money(perNight)} × ${nights}</td><td class="r">${money(basePrice)}</td></tr>`);
    for (const s of extraList) rows.push(`<tr><td>${esc(s.name)}</td><td class="c">1</td><td class="r">${money(s.price)}</td></tr>`);

    const payRows = payments.map((p) =>
      `<tr><td>${fmtDT(p.paid_at)}</td><td>${KIND[p.kind] || p.kind} · ${METHOD[p.method] || p.method}</td><td class="r">${p.kind === "refund" ? "−" : ""}${money(p.amount)}</td></tr>`
    ).join("");

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Chek ${invoiceNo}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Georgia,'Times New Roman',serif;color:#111;padding:28px;max-width:720px;margin:0 auto}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #C5A46D;padding-bottom:16px;margin-bottom:16px}
  h1{font-size:22px;letter-spacing:.5px}
  h1 span{color:#B8925A}
  .muted{color:#666;font-size:12px;margin-top:3px}
  .lbl{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:bold}
  .no{font-size:18px;font-weight:bold;color:#B8925A}
  .info{display:flex;justify-content:space-between;gap:24px;margin-bottom:18px;font-size:13px}
  .strong{font-weight:bold;font-size:15px}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px}
  th{text-align:left;border-bottom:2px solid #333;padding:6px 0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#777}
  td{padding:7px 0;border-bottom:1px solid #e5e5e5}
  td.r,th.r{text-align:right}
  td.c{text-align:center;color:#777}
  .sec{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;font-weight:bold;margin:14px 0 4px}
  .totals{margin-left:auto;width:280px;font-size:13px}
  .totals div{display:flex;justify-content:space-between;padding:4px 0}
  .totals .big{border-top:2px solid #333;margin-top:6px;padding-top:8px;font-size:16px;font-weight:bold}
  .paid{color:#0a7c3a}
  .bal{color:${balance > 0 ? "#c0392b" : "#0a7c3a"}}
  .foot{margin-top:26px;padding-top:14px;border-top:1px solid #e5e5e5;text-align:center;color:#999;font-size:12px}
</style></head><body>
  <div class="hd">
    <div><h1>ASIA WAY <span>APARTMENTS</span></h1><div class="muted">Nest One, Tashkent City</div><div class="muted">Tel: +998 99 000 00 00 · asiaway.uz</div></div>
    <div style="text-align:right"><div class="lbl">Chek raqami</div><div class="no">#${invoiceNo}</div><div class="muted" style="margin-top:8px">Sana: ${fmtDate(new Date().toISOString())}</div></div>
  </div>
  <div class="info">
    <div><div class="lbl">Mehmon</div><div class="strong">${esc(guestName)}</div>${booking?.guest_phone ? `<div class="muted">${esc(booking.guest_phone)}</div>` : ""}</div>
    <div style="text-align:right"><div class="lbl">Apartament</div><div class="strong">${esc(aptTitle)}</div><div class="muted">${fmtDate(booking?.check_in)} → ${fmtDate(booking?.check_out)} · ${nights} kecha</div></div>
  </div>
  <table><thead><tr><th>Xizmat</th><th class="c">Miqdor</th><th class="r">Summa</th></tr></thead><tbody>${rows.join("")}</tbody></table>
  ${payments.length ? `<div class="sec">To'lovlar tarixi</div><table><thead><tr><th>Sana / soat</th><th>Turi</th><th class="r">Summa</th></tr></thead><tbody>${payRows}</tbody></table>` : ""}
  <div class="totals">
    <div><span>Jami xizmat</span><span>${money(totalCharge)}</span></div>
    <div class="paid"><span>To'langan</span><span>${money(paidTotal)}</span></div>
    <div class="big bal"><span>${balance > 0 ? "QOLDIQ (to'lanadi)" : "TO'LIQ TO'LANDI"}</span><span>${money(Math.abs(balance))}</span></div>
  </div>
  <div class="foot">Tashrifingiz uchun rahmat! ASIA WAY sizni yana kutib qoladi.</div>
  <script>window.onload=function(){window.print();}</script>
</body></html>`;

    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) { alert("Chek oynasi bloklandi — brauzer pop-up ruxsatini bering."); return; }
    w.document.write(html);
    w.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0B0D0F] text-[#F5F2EB] border-[rgba(197,164,109,0.22)] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#C5A46D] font-heading text-xl border-b border-[rgba(197,164,109,0.22)] pb-4">
            Chek · Hisob-faktura
          </DialogTitle>
        </DialogHeader>

        {/* Ekrandagi ko'rinish (preview) */}
        <div className="bg-white text-black rounded-md p-6 my-2 text-[13px]">
          <div className="flex justify-between border-b-2 border-[#C5A46D] pb-3 mb-3">
            <div>
              <div className="text-lg font-bold" style={{ fontFamily: "Georgia, serif" }}>ASIA WAY <span className="text-[#B8925A]">APARTMENTS</span></div>
              <div className="text-[11px] text-gray-500">Nest One, Tashkent City</div>
            </div>
            <div className="text-right"><div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Chek</div><div className="font-bold text-[#B8925A]">#{invoiceNo}</div></div>
          </div>
          <div className="flex justify-between mb-3">
            <div><div className="text-[10px] uppercase text-gray-400 font-bold">Mehmon</div><div className="font-semibold">{guestName}</div></div>
            <div className="text-right"><div className="text-[10px] uppercase text-gray-400 font-bold">Apartament</div><div className="font-semibold">{aptTitle}</div><div className="text-gray-500 text-[12px]">{fmtDate(booking?.check_in)} → {fmtDate(booking?.check_out)} · {nights} kecha</div></div>
          </div>

          <table className="w-full mb-3">
            <thead><tr className="border-b-2 border-gray-800 text-[10px] uppercase text-gray-500"><th className="text-left py-1.5">Xizmat</th><th className="text-right py-1.5">Summa</th></tr></thead>
            <tbody>
              <tr className="border-b border-gray-200"><td className="py-1.5">Ijara ({money(perNight)} × {nights})</td><td className="py-1.5 text-right font-medium">{money(basePrice)}</td></tr>
              {extraList.map((s, i) => <tr key={i} className="border-b border-gray-200"><td className="py-1.5">{s.name}</td><td className="py-1.5 text-right font-medium">{money(s.price)}</td></tr>)}
            </tbody>
          </table>

          {loading ? (
            <div className="text-gray-400 text-[12px] flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> To&apos;lovlar yuklanmoqda...</div>
          ) : payments.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">To&apos;lovlar tarixi</div>
              <table className="w-full mb-3">
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 text-[12px]">
                      <td className="py-1 text-gray-600">{fmtDT(p.paid_at)}</td>
                      <td className="py-1 text-gray-600">{KIND[p.kind] || p.kind} · {METHOD[p.method] || p.method}</td>
                      <td className="py-1 text-right font-medium text-emerald-700">{p.kind === "refund" ? "−" : ""}{money(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="ml-auto w-64 text-[13px]">
            <div className="flex justify-between text-gray-600"><span>Jami xizmat</span><span>{money(totalCharge)}</span></div>
            <div className="flex justify-between text-emerald-700"><span>To&apos;langan</span><span>{money(paidTotal)}</span></div>
            <div className={`flex justify-between border-t-2 border-gray-800 pt-2 mt-1 text-[15px] font-bold ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>
              <span>{balance > 0 ? "QOLDIQ" : "TO'LIQ TO'LANDI"}</span><span>{money(Math.abs(balance))}</span>
            </div>
          </div>
        </div>

        {/* Qo'shimcha xizmat */}
        <div className="space-y-3 pt-2 border-t border-[rgba(197,164,109,0.22)]">
          <h3 className="text-[#C5A46D] font-medium text-[14px]">Qo&apos;shimcha xizmat / jarima</h3>
          {extraServices.map((service, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input value={service.name} onChange={(e) => changeService(index, "name", e.target.value)} placeholder="Masalan: Mini-bar" className="bg-[#111417] border-[rgba(197,164,109,0.22)] h-10" />
              <Input type="number" value={service.price || ""} onChange={(e) => changeService(index, "price", e.target.value)} placeholder="$" className="w-28 bg-[#111417] border-[rgba(197,164,109,0.22)] h-10" />
              <button onClick={() => removeService(index)} aria-label="O'chirish" className="text-[#A8A49B] hover:text-red-400 p-2"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addService} className="text-[#A8A49B] border-[rgba(197,164,109,0.3)] hover:text-[#C5A46D]"><Plus className="h-4 w-4 mr-1.5" /> Xizmat qo&apos;shish</Button>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-[rgba(197,164,109,0.22)]">Yopish</Button>
          <Button onClick={printInvoice} className="bg-[#C5A46D] text-black hover:bg-[#D4B77F]"><Printer className="w-4 h-4 mr-2" /> Chek chiqarish (PDF)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function esc(s: string) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c));
}
