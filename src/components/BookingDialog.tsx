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
import { CalendarIcon, Loader2, CreditCard, CheckCircle2, Phone, User, Mail, Sparkles, MapPin } from "lucide-react";
import Image from "next/image";

interface BookingDialogProps {
  apartment: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDialog({ apartment, isOpen, onClose }: BookingDialogProps) {
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
      setErrorMsg("Iltimos, to'g'ri kelish va ketish sanalarini belgilang.");
      return;
    }
    if (guestPhone.length < 9) {
      setErrorMsg("Iltimos, telefon raqamingizni to'liq kiriting.");
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleSimulatePayment = async () => {
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setErrorMsg("Iltimos, 16 xonali karta raqamini kiriting.");
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
        setErrorMsg(res.error || "Bron qilishda xatolik yuz berdi.");
        setStep(1);
      } else {
        setBookingResult(res.booking);
        setStep(3);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Tizim xatoligi yuz berdi.");
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatUzPrice = (amount: number) => {
    return `$${Number(amount).toLocaleString("en-US")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[480px] w-full bg-[#0B0D0F] border-[rgba(197,164,109,0.22)] text-[#F5F2EB] rounded-[12px] overflow-y-auto max-h-[90vh] shadow-2xl p-0">
        
        {/* STEP 1: DATE PICKER & GUEST INFO */}
        {step === 1 && (
          <div className="p-8 space-y-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="font-heading text-[28px] font-medium text-[#F5F2EB] flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#C5A46D]" /> Band qilish
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">Kelish sanasi</Label>
                  <Popover>
                    <PopoverTrigger className="w-full flex h-12 items-center justify-start rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#111417] px-4 py-2 text-[15px] text-[#F5F2EB] hover:border-[#C5A46D] transition-colors">
                      <CalendarIcon className="mr-3 h-4 w-4 text-[#C5A46D]" />
                      {checkIn ? format(checkIn, "dd.MM.yyyy") : <span className="text-[#A8A49B]/50">Sana tanlang</span>}
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
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">Ketish sanasi</Label>
                  <Popover>
                    <PopoverTrigger className="w-full flex h-12 items-center justify-start rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#111417] px-4 py-2 text-[15px] text-[#F5F2EB] hover:border-[#C5A46D] transition-colors">
                      <CalendarIcon className="mr-3 h-4 w-4 text-[#C5A46D]" />
                      {checkOut ? format(checkOut, "dd.MM.yyyy") : <span className="text-[#A8A49B]/50">Sana tanlang</span>}
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
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Kalendar yangilanmoqda...
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#C5A46D]" /> Bo&apos;sh
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#111417] border border-[#A8A49B]/30" /> Band (o&apos;chirilgan)
                    </span>
                  </>
                )}
              </div>

              {/* Guest Information */}
              <div className="space-y-4 pt-4 border-t border-[rgba(197,164,109,0.14)]">
                <div className="space-y-2">
                  <Label htmlFor="guestName" className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">F.I.SH. (Mehmon ismi)</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-[#A8A49B]" />
                    <Input
                      id="guestName"
                      required
                      placeholder="Eshmatov Toshmat"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="pl-12 h-12 border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#F5F2EB] placeholder-[#A8A49B]/50 focus:border-[#C5A46D] rounded-[8px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone" className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">Telefon raqam</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#A8A49B]" />
                    <Input
                      id="guestPhone"
                      required
                      placeholder="+998 90 123 45 67"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="pl-12 h-12 border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#F5F2EB] placeholder-[#A8A49B]/50 focus:border-[#C5A46D] rounded-[8px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail" className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">Elektron pochta (Ixtiyoriy)</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#A8A49B]" />
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="pl-12 h-12 border-[rgba(197,164,109,0.22)] bg-[#111417] text-[#F5F2EB] placeholder-[#A8A49B]/50 focus:border-[#C5A46D] rounded-[8px]"
                    />
                  </div>
                </div>
              </div>

              {/* Price Calculation details */}
              {nights > 0 && (
                <div className="p-5 bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[8px] space-y-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#A8A49B] font-light">Kunlik ijara:</span>
                    <span className="text-[#F5F2EB]">{formatUzPrice(apartment.price_per_day)} x {nights} tun</span>
                  </div>
                  <div className="flex justify-between border-t border-[rgba(197,164,109,0.14)] pt-3 text-[15px] font-medium">
                    <span className="text-[#A8A49B] font-light">Jami ijara:</span>
                    <span className="text-[#F5F2EB]">{formatUzPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#C5A46D] font-medium text-[15px] pt-1">
                    <span>Qaytariladigan zaklat (depozit):</span>
                    <span>{formatUzPrice(deposit)}</span>
                  </div>
                  <p className="text-[11px] text-[#A8A49B] mt-2 font-light leading-relaxed">
                    * Kvartiraga kirishda depozit (zaklat) summasi to&apos;lanishi shart. Chiqishda zarar yetmagan bo&apos;lsa, to&apos;liq qaytariladi.
                  </p>
                </div>
              )}

              {/* Select payment gateway */}
              <div className="space-y-3 pt-2">
                <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">To&apos;lov tizimi</Label>
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
                Tasdiqlash va to&apos;lovga o&apos;tish
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: SIMULATED PAYMENT SCREEN */}
        {step === 2 && (
          <div className="p-8 space-y-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="font-heading text-[28px] font-medium text-[#F5F2EB] flex items-center justify-between">
                <span>{paymentMethod === "payme" ? "Payme Checkout" : "Click Merchant"}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] px-3 py-1 bg-[#C5A46D]/10 border border-[#C5A46D]/30 text-[#C5A46D] rounded-full">Test Mode</span>
              </DialogTitle>
              <DialogDescription className="text-[#A8A49B] text-[14px]">
                Zaklat (depozit) to&apos;lovini tasdiqlang: <span className="font-medium text-[#C5A46D]">{formatUzPrice(deposit)}</span>
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="rounded-[8px] bg-red-950/50 p-4 text-[13px] text-red-400 border border-red-900/50 leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div className="space-y-6 bg-[#111417] p-6 rounded-[8px] border border-[rgba(197,164,109,0.14)]">
              <div className="space-y-2">
                <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">Plastik karta raqami</Label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 h-4 w-4 text-[#A8A49B]" />
                  <Input
                    required
                    placeholder="8600 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 16))}
                    className="pl-12 h-12 border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] font-mono tracking-widest text-[15px] focus:border-[#C5A46D] rounded-[6px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">Muddati (MM/YY)</Label>
                  <Input
                    required
                    placeholder="12/29"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                    className="h-12 border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] text-center font-mono text-[15px] focus:border-[#C5A46D] rounded-[6px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">SMS kod</Label>
                  <Input
                    type="password"
                    required
                    placeholder="••••"
                    value={cardCode}
                    onChange={(e) => setCardCode(e.target.value.slice(0, 4))}
                    className="h-12 border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] text-center font-mono text-[15px] focus:border-[#C5A46D] rounded-[6px]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#A8A49B]/70 text-center font-light">
                * Test rejimda istalgan 16 xonali karta raqami va kodni kiritishingiz mumkin.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className={`${btnSecondary} h-14 text-[15px]`}
              >
                Orqaga
              </Button>
              <Button
                onClick={handleSimulatePayment}
                disabled={isSubmitting}
                className={`${btnPrimary} h-14 text-[15px]`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> To&apos;lanmoqda...
                  </>
                ) : (
                  "To'lovni tasdiqlash"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: BOOKING SUCCESS RECEIPT */}
        {step === 3 && bookingResult && (
          <div className="p-8 space-y-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#C5A46D]/10 text-[#C5A46D] border border-[#C5A46D]/30 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-3">
              <h2 className="font-heading text-[32px] font-medium text-[#F5F2EB]">Bron tasdiqlandi.</h2>
              <p className="text-[15px] text-[#A8A49B] font-light">AsiaWay ni tanlaganingiz uchun minnatdormiz.</p>
            </div>

            {/* Voucher summary */}
            <div className="bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[8px] p-6 text-left space-y-4 text-[14px]">
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3">
                <span className="text-[#A8A49B]">Bron ID:</span>
                <span className="font-mono text-[#F5F2EB]">{bookingResult.id?.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3">
                <span className="text-[#A8A49B]">Apartament:</span>
                <span className="font-medium text-[#F5F2EB]">{apartment.title}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3">
                <span className="text-[#A8A49B]">Muddati:</span>
                <span className="text-[#F5F2EB]">
                  {formatDate(bookingResult.check_in)} — {formatDate(bookingResult.check_out)} ({bookingResult.nights} tun)
                </span>
              </div>
              <div className="flex justify-between border-b border-[rgba(197,164,109,0.1)] pb-3">
                <span className="text-[#A8A49B]">Mehmon:</span>
                <span className="text-[#F5F2EB]">{bookingResult.guest_name}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#C5A46D] font-medium">Zaklat holati:</span>
                <span className="text-[#F5F2EB] font-medium">To&apos;landi</span>
              </div>
            </div>

            {/* AsiaWay Premium service details */}
            <div className="p-6 bg-[#0B0D0F] border border-[#C5A46D]/30 rounded-[8px] text-left space-y-3">
              <h3 className="font-medium text-[#C5A46D] flex items-center gap-2 text-[15px]">
                <Sparkles className="h-4 w-4" /> AsiaWay Eksklyuziv Xizmati
              </h3>
              <p className="text-[13px] text-[#A8A49B] leading-[1.6]">
                Siz uchun bepul aeroport transferi (kutib olish va kuzatish) tashkil qilinadi.
              </p>
              <div className="pt-3 border-t border-[rgba(197,164,109,0.14)] space-y-1">
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#A8A49B]">Transfer koordinatori</p>
                <p className="font-medium text-[#F5F2EB] tracking-wide">+998 90 110 13 01</p>
              </div>
            </div>

            <Button
              onClick={onClose}
              className={`w-full ${btnSecondary} h-14 text-[15px]`}
            >
              Yopish
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
