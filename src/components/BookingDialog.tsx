"use client";

import { useState, useEffect } from "react";
import { createBooking, getBookedDates } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, CreditCard, CheckCircle2, Phone, User, Mail, Sparkles } from "lucide-react";
import { CONTACTS } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";
import type { Lang } from "@/lib/i18n";

const B_MX: Record<Lang, {
  title: string; errorDates: string; errorPhone: string; errorCard: string; errorGeneric: string; checkIn: string; checkOut: string; selectDate: string; statusUpdating: string; statusFree: string; statusBooked: string; guestName: string; guestPhone: string; guestEmail: string; optional: string; nextStep: string; paymentTitle: string; paymentDesc: string; priceTotal: string; depositTotal: string; methodLabel: string; cardNumber: string; cardExpiry: string; cardCode: string; payBtn: string; payingBtn: string; successTitle: string; successDesc: string; bookingRef: string; doneBtn: string; backBtn: string; pricePerNight: string; priceRentDay: string; priceRentTotal: string; priceDepositInfo: string; testModeInfo: string; voucherApt: string; voucherDates: string; voucherGuest: string; voucherDepositStatus: string; voucherPaid: string; exclusiveService: string; exclusiveServiceDesc: string; transferCoord: string;
}> = {
  uz: { title: "Band qilish", errorDates: "Iltimos, to'g'ri kelish va ketish sanalarini belgilang.", errorPhone: "Iltimos, telefon raqamingizni to'liq kiriting.", errorCard: "Iltimos, 16 xonali karta raqamini kiriting.", errorGeneric: "Tizim xatoligi yuz berdi.", checkIn: "Kelish sanasi", checkOut: "Ketish sanasi", selectDate: "Sana tanlang", statusUpdating: "Kalendar yangilanmoqda...", statusFree: "Bo'sh", statusBooked: "Band (o'chirilgan)", guestName: "F.I.SH. (Mehmon ismi)", guestPhone: "Telefon raqam", guestEmail: "Elektron pochta", optional: "(Ixtiyoriy)", nextStep: "Tasdiqlash va to'lovga o'tish", paymentTitle: "Zaklat to'lovi", paymentDesc: "Zaklat (depozit) to'lovini tasdiqlang: ", priceTotal: "Umumiy ijara", depositTotal: "Qaytariladigan zaklat (depozit)", methodLabel: "To'lov tizimi", cardNumber: "Plastik karta raqami", cardExpiry: "Muddati (MM/YY)", cardCode: "SMS kod", payBtn: "To'lovni tasdiqlash", payingBtn: "To'lanmoqda...", successTitle: "Bron tasdiqlandi.", successDesc: "AsiaWay ni tanlaganingiz uchun minnatdormiz.", bookingRef: "Bron ID", doneBtn: "Yopish", backBtn: "Orqaga", pricePerNight: " tun", priceRentDay: "Kunlik ijara", priceRentTotal: "Jami ijara", priceDepositInfo: "* Kvartiraga kirishda depozit (zaklat) summasi to'lanishi shart. Chiqishda zarar yetmagan bo'lsa, to'liq qaytariladi.", testModeInfo: "* Test rejimda istalgan 16 xonali karta raqami va kodni kiritishingiz mumkin.", voucherApt: "Apartament", voucherDates: "Muddati", voucherGuest: "Mehmon", voucherDepositStatus: "Zaklat holati", voucherPaid: "To'landi", exclusiveService: "AsiaWay Eksklyuziv Xizmati", exclusiveServiceDesc: "Siz uchun bepul aeroport transferi (kutib olish va kuzatish) tashkil qilinadi.", transferCoord: "Transfer koordinatori" },
  ru: { title: "Бронирование", errorDates: "Укажите корректные даты заезда и выезда.", errorPhone: "Введите полный номер телефона.", errorCard: "Введите 16-значный номер карты.", errorGeneric: "Произошла системная ошибка.", checkIn: "Дата заезда", checkOut: "Дата выезда", selectDate: "Выберите дату", statusUpdating: "Обновление календаря...", statusFree: "Свободно", statusBooked: "Занято", guestName: "Ф.И.О. (Имя гостя)", guestPhone: "Номер телефона", guestEmail: "Электронная почта", optional: "(Необязательно)", nextStep: "Подтвердить и перейти к оплате", paymentTitle: "Оплата депозита", paymentDesc: "Подтвердите оплату депозита: ", priceTotal: "Общая аренда", depositTotal: "Возвратный депозит", methodLabel: "Платежная система", cardNumber: "Номер пластиковой карты", cardExpiry: "Срок (ММ/ГГ)", cardCode: "SMS код", payBtn: "Подтвердить оплату", payingBtn: "Оплата...", successTitle: "Бронь подтверждена.", successDesc: "Благодарим за выбор AsiaWay.", bookingRef: "ID брони", doneBtn: "Закрыть", backBtn: "Назад", pricePerNight: " ночь(и)", priceRentDay: "Аренда за сутки", priceRentTotal: "Итого аренда", priceDepositInfo: "* Депозит обязателен при заезде. Возвращается полностью при выезде, если нет повреждений.", testModeInfo: "* В тестовом режиме введите любой 16-значный номер и код.", voucherApt: "Апартамент", voucherDates: "Период", voucherGuest: "Гость", voucherDepositStatus: "Статус депозита", voucherPaid: "Оплачено", exclusiveService: "Эксклюзивный сервис AsiaWay", exclusiveServiceDesc: "Для вас организован бесплатный трансфер из аэропорта (встреча и проводы).", transferCoord: "Координатор трансфера" },
  en: { title: "Booking", errorDates: "Please select valid check-in and check-out dates.", errorPhone: "Please enter a valid phone number.", errorCard: "Please enter a 16-digit card number.", errorGeneric: "System error occurred.", checkIn: "Check-in date", checkOut: "Check-out date", selectDate: "Select date", statusUpdating: "Updating calendar...", statusFree: "Available", statusBooked: "Booked", guestName: "Full Name (Guest)", guestPhone: "Phone number", guestEmail: "Email", optional: "(Optional)", nextStep: "Confirm and proceed to payment", paymentTitle: "Deposit Payment", paymentDesc: "Confirm the deposit payment: ", priceTotal: "Total rental", depositTotal: "Refundable deposit", methodLabel: "Payment system", cardNumber: "Credit card number", cardExpiry: "Expiry (MM/YY)", cardCode: "SMS code", payBtn: "Confirm payment", payingBtn: "Paying...", successTitle: "Booking confirmed.", successDesc: "Thank you for choosing AsiaWay.", bookingRef: "Booking ID", doneBtn: "Close", backBtn: "Back", pricePerNight: " night(s)", priceRentDay: "Daily rent", priceRentTotal: "Total rent", priceDepositInfo: "* A security deposit is required upon check-in. Fully refundable upon check-out if no damages occur.", testModeInfo: "* In test mode, you can enter any 16-digit card number and code.", voucherApt: "Apartment", voucherDates: "Period", voucherGuest: "Guest", voucherDepositStatus: "Deposit status", voucherPaid: "Paid", exclusiveService: "AsiaWay Exclusive Service", exclusiveServiceDesc: "Free airport transfer (pickup and drop-off) is arranged for you.", transferCoord: "Transfer coordinator" }
};

interface BookingDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apartment: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDialog({ apartment, isOpen, onClose }: BookingDialogProps) {
  const { lang } = useLang();
  const b = B_MX[lang];

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form & Dates, 2: Payment Simulation, 3: Success Receipt
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"payme" | "click">("payme");
  
  // Card payment inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCode, setCardCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingResult, setBookingResult] = useState<any>(null);

  const [bookedRanges, setBookedRanges] = useState<{ start: Date; end: Date }[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCheckIn(undefined);
      setCheckOut(undefined);
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      setCardNumber("");
      setCardExpiry("");
      setCardCode("");
      setErrorMsg(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && apartment?.id) {
      setLoadingDates(true);
      getBookedDates(apartment.id)
        .then((ranges) => setBookedRanges(ranges))
        .catch(() => setBookedRanges([]))
        .finally(() => setLoadingDates(false));
    }
  }, [isOpen, apartment?.id]);

  if (!apartment) return null;

  const isDateBooked = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return bookedRanges.some(({ start, end }) => {
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      const e = new Date(end);
      e.setHours(0, 0, 0, 0);
      return d >= s && d < e;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nights = 0;
  let totalPrice = 0;
  const deposit = Number(apartment.deposit_amount) || 200;

  if (checkIn && checkOut && checkOut > checkIn) {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalPrice = nights * Number(apartment.price_per_day);
  }

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setErrorMsg(b.errorDates);
      return;
    }
    if (guestPhone.length < 9) {
      setErrorMsg(b.errorPhone);
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleSimulatePayment = async () => {
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setErrorMsg(b.errorCard);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const checkInStr = format(checkIn!, "yyyy-MM-dd");
    const checkOutStr = format(checkOut!, "yyyy-MM-dd");

    try {
      const res = await createBooking({
        apartment_id: apartment.id,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail || undefined,
        check_in: checkInStr,
        check_out: checkOutStr,
        nights,
        total_price: totalPrice,
        deposit_amount: deposit,
        payment_method: paymentMethod,
      });

      if (!res.success) {
        setErrorMsg(res.error || b.errorGeneric);
        setStep(1);
      } else {
        setBookingResult(res.booking);
        setStep(3);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.message || b.errorGeneric);
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => {
    return `$${Number(amount).toLocaleString("en-US")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[600px] sm:max-w-[650px] md:max-w-[700px] w-full bg-[#0B0D0F] border-[rgba(197,164,109,0.22)] text-[#F5F2EB] rounded-[12px] overflow-hidden h-[90vh] max-h-[90vh] md:h-[85vh] md:max-h-[85vh] shadow-2xl p-0">
        
        <div className="h-full w-full overflow-y-auto custom-scrollbar relative">
        {/* STEP 1: DATE PICKER & GUEST INFO */}
        {step === 1 && (
          <div className="p-6 md:p-10 space-y-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="font-heading text-[28px] md:text-[32px] font-medium text-[#F5F2EB] flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#C5A46D]" /> {b.title}
              </DialogTitle>
              <DialogDescription className="text-[#A8A49B] text-[14px]">
                {apartment.title} · Nest One
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="rounded-[8px] bg-red-950/50 p-4 text-[13px] text-red-400 border border-red-900/50 leading-relaxed">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleNextToPayment} className="space-y-6">
              {/* Date selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.checkIn}</Label>
                  <Popover>
                    <PopoverTrigger className="w-full flex h-14 items-center justify-start rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#111417] px-4 py-2 text-[15px] text-[#F5F2EB] hover:border-[#C5A46D] transition-colors">
                      <CalendarIcon className="mr-3 h-4 w-4 text-[#C5A46D]" />
                      {checkIn ? format(checkIn, "dd.MM.yyyy") : <span className="text-[#A8A49B]/50">{b.selectDate}</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#111417] border-[rgba(197,164,109,0.22)] text-[#F5F2EB]" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={(d?: Date) => { setCheckIn(d); if (d && checkOut && checkOut <= d) setCheckOut(undefined); }}
                        disabled={(date: Date) => date < today || isDateBooked(date)}
                        modifiers={{ booked: (date: Date) => isDateBooked(date) }}
                        modifiersClassNames={{ booked: "line-through text-[#A8A49B]/50 opacity-60" }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.checkOut}</Label>
                  <Popover>
                    <PopoverTrigger className="w-full flex h-14 items-center justify-start rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#111417] px-4 py-2 text-[15px] text-[#F5F2EB] hover:border-[#C5A46D] transition-colors">
                      <CalendarIcon className="mr-3 h-4 w-4 text-[#C5A46D]" />
                      {checkOut ? format(checkOut, "dd.MM.yyyy") : <span className="text-[#A8A49B]/50">{b.selectDate}</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#111417] border-[rgba(197,164,109,0.22)] text-[#F5F2EB]" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date: Date) => date <= (checkIn || today) || isDateBooked(date)}
                        modifiers={{ booked: (date: Date) => isDateBooked(date) }}
                        modifiersClassNames={{ booked: "line-through text-[#A8A49B]/50 opacity-60" }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4 text-[12px] text-[#A8A49B] tracking-wide">
                {loadingDates ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {b.statusUpdating}
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#C5A46D]" /> {b.statusFree}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#111417] border border-[#A8A49B]/30" /> {b.statusBooked}
                    </span>
                  </>
                )}
              </div>

              {/* Guest Information */}
              <div className="space-y-4 pt-4 border-t border-[rgba(197,164,109,0.14)]">
                <div className="space-y-2">
                  <Label htmlFor="guestName" className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.guestName}</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-[#A8A49B]" />
                    <Input
                      id="guestName"
                      required
                      placeholder="Eshmatov Toshmat"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="pl-12 h-14 border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#F5F2EB] placeholder-[#A8A49B]/50 focus:border-[#C5A46D] rounded-[8px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone" className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.guestPhone}</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 h-5 w-5 text-[#A8A49B]" />
                    <Input
                      id="guestPhone"
                      required
                      placeholder="+998 90 123 45 67"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="pl-12 h-14 border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#F5F2EB] placeholder-[#A8A49B]/50 focus:border-[#C5A46D] rounded-[8px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail" className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.guestEmail} <span className="lowercase">{b.optional}</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-[#A8A49B]" />
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="pl-12 h-14 border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#F5F2EB] placeholder-[#A8A49B]/50 focus:border-[#C5A46D] rounded-[8px]"
                    />
                  </div>
                </div>
              </div>

              {/* Price Calculation details */}
              {nights > 0 && (
                <div className="p-6 bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[8px] space-y-3">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#A8A49B] font-light">{b.priceRentDay}:</span>
                    <span className="text-[#F5F2EB]">{formatPrice(apartment.price_per_day)} x {nights}{b.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between border-t border-[rgba(197,164,109,0.14)] pt-3 text-[16px] font-medium">
                    <span className="text-[#A8A49B] font-light">{b.priceRentTotal}:</span>
                    <span className="text-[#F5F2EB]">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#C5A46D] font-medium text-[16px] pt-1">
                    <span>{b.depositTotal}:</span>
                    <span>{formatPrice(deposit)}</span>
                  </div>
                  <p className="text-[12px] text-[#A8A49B] mt-2 font-light leading-relaxed">
                    {b.priceDepositInfo}
                  </p>
                </div>
              )}

              {/* Select payment gateway */}
              <div className="space-y-3 pt-2">
                <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.methodLabel}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("payme")}
                    className={`flex items-center justify-center h-14 rounded-[8px] border transition-all duration-300 ${
                      paymentMethod === "payme"
                        ? "border-[#C5A46D] bg-[#C5A46D]/10 text-[#C5A46D]"
                        : "border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#A8A49B] hover:border-[#C5A46D]/50"
                    }`}
                  >
                    <span className="font-semibold text-[14px] tracking-wider uppercase">Payme</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("click")}
                    className={`flex items-center justify-center h-14 rounded-[8px] border transition-all duration-300 ${
                      paymentMethod === "click"
                        ? "border-[#C5A46D] bg-[#C5A46D]/10 text-[#C5A46D]"
                        : "border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#A8A49B] hover:border-[#C5A46D]/50"
                    }`}
                  >
                    <span className="font-semibold text-[14px] tracking-wider uppercase">Click</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={nights === 0}
                className={`w-full ${btnPrimary} h-14 text-[15px] mt-4`}
              >
                {b.nextStep}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: SIMULATED PAYMENT SCREEN */}
        {step === 2 && (
          <div className="p-6 md:p-10 space-y-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="font-heading text-[28px] md:text-[32px] font-medium text-[#F5F2EB] flex items-center justify-between">
                <span>{paymentMethod === "payme" ? "Payme Checkout" : "Click Merchant"}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] px-3 py-1 bg-[#C5A46D]/10 border border-[#C5A46D]/30 text-[#C5A46D] rounded-full hidden sm:inline-block">Test Mode</span>
              </DialogTitle>
              <DialogDescription className="text-[#A8A49B] text-[15px]">
                {b.paymentDesc} <span className="font-medium text-[#C5A46D]">{formatPrice(deposit)}</span>
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="rounded-[8px] bg-red-950/50 p-4 text-[13px] text-red-400 border border-red-900/50 leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div className="space-y-6 bg-[#111417] p-6 rounded-[8px] border border-[rgba(197,164,109,0.14)]">
              <div className="space-y-2">
                <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.cardNumber}</Label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-4 h-5 w-5 text-[#A8A49B]" />
                  <Input
                    required
                    placeholder="8600 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 16))}
                    className="pl-12 h-14 border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] font-mono tracking-widest text-[16px] focus:border-[#C5A46D] rounded-[6px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.cardExpiry}</Label>
                  <Input
                    required
                    placeholder="12/29"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                    className="h-14 border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] text-center font-mono text-[16px] focus:border-[#C5A46D] rounded-[6px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{b.cardCode}</Label>
                  <Input
                    type="password"
                    required
                    placeholder="••••"
                    value={cardCode}
                    onChange={(e) => setCardCode(e.target.value.slice(0, 4))}
                    className="h-14 border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] text-center font-mono text-[16px] focus:border-[#C5A46D] rounded-[6px]"
                  />
                </div>
              </div>

              <p className="text-[12px] text-[#A8A49B]/70 text-center font-light">
                {b.testModeInfo}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className={`${btnSecondary} h-14 text-[15px]`}
              >
                {b.backBtn}
              </Button>
              <Button
                onClick={handleSimulatePayment}
                disabled={isSubmitting}
                className={`${btnPrimary} h-14 text-[15px] sm:order-last order-first`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {b.payingBtn}
                  </>
                ) : (
                  b.payBtn
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: BOOKING SUCCESS RECEIPT */}
        {step === 3 && bookingResult && (
          <div className="p-6 md:p-10 space-y-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#C5A46D]/10 text-[#C5A46D] border border-[#C5A46D]/30 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-3">
              <h2 className="font-heading text-[32px] font-medium text-[#F5F2EB]">{b.successTitle}</h2>
              <p className="text-[16px] text-[#A8A49B] font-light">{b.successDesc}</p>
            </div>

            {/* Voucher summary */}
            <div className="bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[8px] p-6 text-left space-y-4 text-[15px]">
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3">
                <span className="text-[#A8A49B]">{b.bookingRef}:</span>
                <span className="font-mono text-[#F5F2EB]">{bookingResult.id?.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3">
                <span className="text-[#A8A49B]">{b.voucherApt}:</span>
                <span className="font-medium text-[#F5F2EB]">{apartment.title}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3 flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-[#A8A49B]">{b.voucherDates}:</span>
                <span className="text-[#F5F2EB] text-right">
                  {formatDate(bookingResult.check_in)} — {formatDate(bookingResult.check_out)} ({bookingResult.nights}{b.pricePerNight})
                </span>
              </div>
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3">
                <span className="text-[#A8A49B]">{b.voucherGuest}:</span>
                <span className="text-[#F5F2EB] text-right">{bookingResult.guest_name}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#C5A46D] font-medium">{b.voucherDepositStatus}:</span>
                <span className="text-[#F5F2EB] font-medium">{b.voucherPaid}</span>
              </div>
            </div>

            {/* AsiaWay Premium service details */}
            <div className="p-6 bg-[#0B0D0F] border border-[#C5A46D]/30 rounded-[8px] text-left space-y-3">
              <h3 className="font-medium text-[#C5A46D] flex items-center gap-2 text-[16px]">
                <Sparkles className="h-4 w-4" /> {b.exclusiveService}
              </h3>
              <p className="text-[14px] text-[#A8A49B] leading-[1.6]">
                {b.exclusiveServiceDesc}
              </p>
              <div className="pt-3 border-t border-[rgba(197,164,109,0.14)] space-y-1">
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#A8A49B]">{b.transferCoord}</p>
                <p className="font-medium text-[#F5F2EB] tracking-wide">{CONTACTS.phone}</p>
              </div>
            </div>

            <Button
              onClick={onClose}
              className={`w-full ${btnSecondary} h-14 text-[16px]`}
            >
              {b.doneBtn}
            </Button>
          </div>
        )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
