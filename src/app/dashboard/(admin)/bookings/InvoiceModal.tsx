"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer } from "lucide-react";

type InvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // O'rniga aniq tip berish mumkin
};

export default function InvoiceModal({ isOpen, onClose, booking }: InvoiceModalProps) {
  const [extraServices, setExtraServices] = useState<{ name: string; price: number }[]>([
    { name: "Mini-bar", price: 0 },
    { name: "Transfer", price: 0 }
  ]);

  const handleAddService = () => {
    setExtraServices([...extraServices, { name: "", price: 0 }]);
  };

  const handleServiceChange = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...extraServices];
    if (field === 'price') {
      updated[index].price = Number(value);
    } else {
      updated[index].name = value;
    }
    setExtraServices(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const basePrice = booking?.total_price || 0;
  const deposit = booking?.deposit || 0;
  const extraTotal = extraServices.reduce((sum, item) => sum + item.price, 0);
  const finalTotal = basePrice + extraTotal - deposit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0B0D0F] text-[#F5F2EB] border-[rgba(197,164,109,0.22)]">
        <DialogHeader>
          <DialogTitle className="text-[#C5A46D] font-heading text-xl border-b border-[rgba(197,164,109,0.22)] pb-4">
            Chek (Invoice) / Check-out
          </DialogTitle>
        </DialogHeader>

        {/* Printable Area */}
        <div id="print-area" className="p-6 bg-white text-black rounded-md my-4 print:m-0 print:p-0 print:w-full print:h-full">
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold font-heading">ASIA WAY APARTMENTS</h1>
            <p className="text-sm text-gray-500">Tashkent City, Nest One</p>
            <p className="text-sm text-gray-500">Tel: +998 99 000 00 00</p>
          </div>
          
          <div className="flex justify-between mb-6">
            <div>
              <p className="font-bold">Mijoz:</p>
              <p>{booking?.clients?.full_name || "Noma'lum"}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Chek No:</p>
              <p>#{booking?.id?.slice(0, 8).toUpperCase()}</p>
              <p className="font-bold mt-2">Sana:</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <table className="w-full text-left mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2">Xizmat nomi</th>
                <th className="py-2 text-right">Summa ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2">Ijara to'lovi (Arenda)</td>
                <td className="py-2 text-right">${basePrice}</td>
              </tr>
              {extraServices.filter(s => s.name && s.price > 0).map((service, i) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="py-2">{service.name}</td>
                  <td className="py-2 text-right">${service.price}</td>
                </tr>
              ))}
              {deposit > 0 && (
                <tr className="border-b border-gray-300 text-red-600">
                  <td className="py-2">Oldindan to'lov (Deposit) chegirildi</td>
                  <td className="py-2 text-right">-${deposit}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="text-right text-xl font-bold">
            JAMI TO'LOV: ${finalTotal}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            Tashrifingiz uchun rahmat! Yana kutib qolamiz.
          </div>
        </div>

        {/* Editor Area (Not Printed) */}
        <div className="space-y-4 print:hidden border-t border-[rgba(197,164,109,0.22)] pt-4">
          <h3 className="text-[#C5A46D] font-medium mb-2">Qo'shimcha Xizmatlar / Jarimalar</h3>
          {extraServices.map((service, index) => (
            <div key={index} className="flex gap-4">
              <Input 
                value={service.name} 
                onChange={(e) => handleServiceChange(index, 'name', e.target.value)} 
                placeholder="Xizmat nomi (Masalan: Mini-bar)"
                className="bg-[#111417] border-[rgba(197,164,109,0.22)]"
              />
              <Input 
                type="number"
                value={service.price || ''} 
                onChange={(e) => handleServiceChange(index, 'price', e.target.value)} 
                placeholder="Summa"
                className="w-32 bg-[#111417] border-[rgba(197,164,109,0.22)]"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddService} className="text-[#A8A49B] border-[#A8A49B]">
            + Yana qo'shish
          </Button>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose} className="border-[rgba(197,164,109,0.22)]">Bekor qilish</Button>
          <Button onClick={handlePrint} className="bg-[#C5A46D] text-black hover:bg-[#D4B77F]">
            <Printer className="w-4 h-4 mr-2" /> PDF / Chop etish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
