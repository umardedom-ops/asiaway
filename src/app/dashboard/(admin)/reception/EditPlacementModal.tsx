"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit3, UserCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateBookingDetails } from "@/app/dashboard/bookings/actions";
import { useDashLang } from "@/components/DashboardLangProvider";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditPlacementModal({ booking }: { booking: any }) {
  const router = useRouter();
  const d = useDashLang();
  const isRu = d.lang === "ru";

  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState(booking?.guest_name === "Zaselenie (To'ldirilmagan)" || booking?.guest_name === "Заселение (Не заполнен)" ? "" : booking?.guest_name || "");
  const [guestPhone, setGuestPhone] = useState(booking?.guest_phone === "-" ? "" : booking?.guest_phone || "");
  const [totalPrice, setTotalPrice] = useState<string>(booking?.total_price ? String(booking.total_price) : "");
  const [depositAmount, setDepositAmount] = useState<string>(booking?.deposit_amount ? String(booking.deposit_amount) : "");
  const [depositStatus, setDepositStatus] = useState<"pending" | "paid" | "refunded">(booking?.deposit_status || "pending");
  const [notes, setNotes] = useState(booking?.notes || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg(isRu ? "Введите имя гостя!" : "Mehmon ismini kiriting!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await updateBookingDetails({
        id: booking.id,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        total_price: Number(totalPrice) || 0,
        deposit_amount: Number(depositAmount) || 0,
        deposit_status: depositStatus,
        notes: notes.trim() || undefined,
      });

      setLoading(false);
      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMsg(false);
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || (isRu ? "Ошибка при сохранении" : "Saqlashda xatolik yuz berdi"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 px-3 h-8 rounded-[6px] bg-[#C5A46D]/15 border border-[rgba(197,164,109,0.3)] text-[#C5A46D] hover:bg-[#C5A46D]/25 hover:text-[#D4B77F] text-[12px] font-medium transition-all cursor-pointer">
        <Edit3 className="h-3.5 w-3.5" />
        <span>{isRu ? "Заполнить данные" : "Ma'lumotlarni to'ldirish"}</span>
      </DialogTrigger>
      <DialogContent className="max-w-md border-[rgba(197,164,109,0.2)] bg-[#111417] text-[#F5F2EB] rounded-[16px] p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-medium text-[#F5F2EB] flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#C5A46D]" />
            <span>{isRu ? "Данные гостя / Заселение" : "Mehmon va Joylashtirish ma'lumotlari"}</span>
          </DialogTitle>
          <p className="text-[12px] text-[#A8A49B] mt-1">
            {booking?.apartment_title || booking?.apartments?.title || "Nest One Apartment"} ({booking?.check_in} ➔ {booking?.check_out})
          </p>
        </DialogHeader>

        {successMsg && (
          <div className="rounded-[8px] bg-emerald-950/60 p-3 text-emerald-400 border border-emerald-800 text-[13px] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{isRu ? "Данные успешно обновлены!" : "Ma'lumotlar muvaffaqiyatli saqlandi!"}</span>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-[8px] bg-red-950/60 p-3 text-red-400 border border-red-800 text-[13px] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">
              {isRu ? "ФИО Гостя *" : "Mehmon F.I.Sh *"}
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={isRu ? "Например: Алишер Навои" : "Masalan: Alisher Navoiy"}
              className="w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">
              {isRu ? "Номер телефона" : "Telefon raqami"}
            </label>
            <input
              type="text"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">
                {isRu ? "Общая сумма ($)" : "Jami сумма ($)"}
              </label>
              <input
                type="number"
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="0"
                className="w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#C5A46D] font-medium outline-none focus:border-[#C5A46D] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">
                {isRu ? "Задаток ($)" : "Zaklat ($)"}
              </label>
              <input
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                className="w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#C5A46D] font-medium outline-none focus:border-[#C5A46D] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">
              {isRu ? "Статус задатка" : "Zaklat holati"}
            </label>
            <select
              value={depositStatus}
              onChange={(e) => setDepositStatus(e.target.value as any)}
              className="w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[13px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors"
            >
              <option value="pending">{isRu ? "Ожидается (Pending)" : "Kutilmoqda"}</option>
              <option value="paid">{isRu ? "Оплачен (Paid)" : "To'langan"}</option>
              <option value="refunded">{isRu ? "Возвращен (Refunded)" : "Qaytarilgan"}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">
              {isRu ? "Примечания / Заметки" : "Izohlar / Qaydlar"}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRu ? "Паспортные данные, особые пожелания..." : "Pasport ma'lumotlari, qo'shimcha eslatmalar..."}
              className="w-full rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] p-3 text-[13px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(197,164,109,0.14)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-10 px-4 rounded-[8px] border-[rgba(197,164,109,0.2)] text-[#A8A49B] hover:text-[#F5F2EB] hover:bg-white/5 text-[13px]"
            >
              {isRu ? "Отмена" : "Bekor qilish"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-[8px] bg-[#C5A46D] text-[#0B0D0F] hover:bg-[#D4B77F] font-semibold text-[13px] flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              <span>{isRu ? "Сохранить данные" : "Ma'lumotlarni saqlash"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
