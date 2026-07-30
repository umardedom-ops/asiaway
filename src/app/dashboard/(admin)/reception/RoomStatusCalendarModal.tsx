"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { placeGuestNow } from "@/app/dashboard/bookings/actions";
import { useDashLang } from "@/components/DashboardLangProvider";
import { useRouter } from "next/navigation";

interface ExistingBooking {
  id?: string;
  check_in: string;
  check_out: string;
  guest_name?: string;
  booking_status?: string;
}

interface RoomStatusCalendarModalProps {
  apartment: {
    id: string;
    title: string;
    price_per_day?: number;
  };
  existingBookings?: ExistingBooking[];
}

export default function RoomStatusCalendarModal({ apartment, existingBookings = [] }: RoomStatusCalendarModalProps) {
  const router = useRouter();
  const d = useDashLang();
  const isRu = d.lang === "ru";

  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Oyni o'zgartirish
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Kalendar kunlarini hisoblash
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Dushanbadan boshlash (0-6)
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNamesUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const monthNamesRu = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const currentMonthName = isRu ? monthNamesRu[month] : monthNamesUz[month];

  const todayStr = new Date().toISOString().split("T")[0];

  // Kun bandligini tekshirish
  const isDateBooked = (dateStr: string) => {
    return existingBookings.some((b) => {
      if (b.booking_status === "cancelled") return false;
      return dateStr >= b.check_in && dateStr < b.check_out;
    });
  };

  // Kunni tanlash mantiqi
  const handleDateClick = (dateStr: string) => {
    if (isDateBooked(dateStr)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (dateStr > startDate) {
        // Tanlangan oraliqda band kun borligini tekshirish
        const hasBookedInRange = existingBookings.some((b) => {
          if (b.booking_status === "cancelled") return false;
          return b.check_in < dateStr && b.check_out > startDate;
        });

        if (hasBookedInRange) {
          setErrorMsg(isRu ? "Выбранный интервал содержит забронированные дни!" : "Tanlangan oraliqda band qilingan kunlar bor!");
          setStartDate(dateStr);
          setEndDate(null);
          return;
        }

        setErrorMsg(null);
        setEndDate(dateStr);
      } else {
        setStartDate(dateStr);
        setEndDate(null);
      }
    }
  };

  // Oraliqni belgilash stilini aniqlash
  const getDayClass = (dateStr: string) => {
    const isBooked = isDateBooked(dateStr);
    if (isBooked) {
      return "bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed font-medium opacity-80";
    }

    const isStart = dateStr === startDate;
    const isEnd = dateStr === endDate;

    if (isStart || isEnd) {
      return "bg-[#C5A46D] text-[#0B0D0F] font-bold shadow-lg shadow-[#C5A46D]/20 scale-105 transition-all";
    }

    const activeEnd = endDate || hoverDate;
    if (startDate && activeEnd && dateStr > startDate && dateStr < activeEnd) {
      return "bg-[#C5A46D]/20 text-[#C5A46D] border-y border-[rgba(197,164,109,0.3)] font-medium";
    }

    if (dateStr < todayStr) {
      return "text-[#A8A49B]/40 hover:bg-[#111417] cursor-pointer";
    }

    return "text-[#F5F2EB] hover:bg-[#C5A46D]/15 hover:text-[#C5A46D] cursor-pointer transition-colors";
  };

  // Saqlash va Zaselenie yaratish amali
  const handleSaveBlock = async () => {
    if (!startDate || !endDate) {
      setErrorMsg(isRu ? "Выберите дату начала и окончания!" : "Boshlanish va tugash sanasini tanlang!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await placeGuestNow({
      apartment_id: apartment.id,
      guest_name: isRu ? "Заселение (Не заполнен)" : "Zaselenie (To'ldirilmagan)",
      guest_phone: "-",
      channel: "direct",
      check_in: startDate,
      check_out: endDate,
      total_price: 0,
      deposit_amount: 0,
      deposit_status: "pending",
      booking_status: "confirmed",
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg(false);
        setStartDate(null);
        setEndDate(null);
        router.refresh();
      }, 1000);
    } else {
      setErrorMsg(res.error || (isRu ? "Ошибка при сохранении" : "Saqlashda xatolik yuz berdi"));
    }
  };

  // Kunlar ro'yxatini shakllantirish
  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    const formattedDay = String(d).padStart(2, "0");
    const formattedMonth = String(month + 1).padStart(2, "0");
    daysArray.push(`${year}-${formattedMonth}-${formattedDay}`);
  }

  // Tungi sonini hisoblash
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-full h-10 rounded-[8px] border border-[rgba(197,164,109,0.35)] bg-gradient-to-r from-[#111417] via-[#1A1E23] to-[#111417] hover:bg-[#C5A46D]/15 text-[#C5A46D] hover:text-[#D4B77F] text-[13px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[#C5A46D]/10 active:scale-[0.98]">
        <CalendarIcon className="h-4 w-4 text-[#C5A46D]" />
        <span>{isRu ? "Забронировать номер" : "Xonani band qilish"}</span>
      </DialogTrigger>
      <DialogContent className="max-w-md border-[rgba(197,164,109,0.2)] bg-[#111417] text-[#F5F2EB] rounded-[16px] p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-medium text-[#F5F2EB] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#C5A46D]" />
            <span>{isRu ? "Забронировать номер (Заселение)" : "Xonaga band (Zaselenie) sanalarini belgilash"}</span>
          </DialogTitle>
          <p className="text-[12px] text-[#A8A49B] mt-1 line-clamp-1">{apartment.title}</p>
        </DialogHeader>

        {/* Success Alert */}
        {successMsg && (
          <div className="rounded-[8px] bg-emerald-950/60 p-3 text-emerald-400 border border-emerald-800 text-[13px] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{isRu ? "Заселение создано! Даты заблокированы." : "Zaselenie yaratildi! Sanalar yopildi."}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="rounded-[8px] bg-red-950/60 p-3 text-red-400 border border-red-800 text-[13px] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-2 px-2 py-1 bg-[#0B0D0F] rounded-[10px] border border-[rgba(197,164,109,0.14)]">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#A8A49B] hover:text-[#F5F2EB] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[14px] font-semibold text-[#C5A46D]">
            {currentMonthName} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#A8A49B] hover:text-[#F5F2EB] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="mt-3">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#A8A49B] mb-2 uppercase tracking-wider">
            <span>{isRu ? "Пн" : "Du"}</span>
            <span>{isRu ? "Вт" : "Se"}</span>
            <span>{isRu ? "Ср" : "Ch"}</span>
            <span>{isRu ? "Чт" : "Pa"}</span>
            <span>{isRu ? "Пт" : "Ju"}</span>
            <span>{isRu ? "Сб" : "Sh"}</span>
            <span className="text-red-400/80">{isRu ? "Вс" : "Yak"}</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-10" />;
              }

              const dayNumber = parseInt(dateStr.split("-")[2], 10);
              const isBooked = isDateBooked(dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  onMouseEnter={() => startDate && !endDate && setHoverDate(dateStr)}
                  className={`h-10 rounded-[8px] flex items-center justify-center text-[13px] relative ${getDayClass(
                    dateStr
                  )}`}
                  title={isBooked ? (isRu ? "Занято" : "Band") : dateStr}
                >
                  {dayNumber}
                  {isBooked && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-red-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Dates Summary */}
        <div className="mt-4 p-3 bg-[#0B0D0F] rounded-[10px] border border-[rgba(197,164,109,0.14)] space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#A8A49B]">{isRu ? "Период заезда:" : "Joylashtirish oralig'i:"}</span>
            <span className="font-medium text-[#C5A46D]">
              {startDate ? startDate : "—"} {endDate ? `➔ ${endDate}` : ""}
            </span>
          </div>
          {startDate && endDate && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#A8A49B]">{isRu ? "Количество ночей:" : "Tungi soni:"}</span>
              <span className="font-semibold text-[#F5F2EB]">{calculateNights()} {isRu ? "ночей" : "kecha"}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="h-10 px-4 rounded-[8px] border-[rgba(197,164,109,0.2)] text-[#A8A49B] hover:text-[#F5F2EB] hover:bg-white/5 text-[13px]"
          >
            {isRu ? "Отмена" : "Bekor qilish"}
          </Button>
          <Button
            type="button"
            onClick={handleSaveBlock}
            disabled={loading || !startDate || !endDate}
            className="h-10 px-6 rounded-[8px] bg-[#C5A46D] text-[#0B0D0F] hover:bg-[#D4B77F] font-semibold text-[13px] disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#C5A46D]/15"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            <span>{isRu ? "Создать заселение" : "Zaselenie yaratish"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
