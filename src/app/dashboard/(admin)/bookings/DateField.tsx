"use client";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Champagne kalendar maydoni — qiymat 'yyyy-MM-dd' string sifatida saqlanadi.
export default function DateField({
  value,
  onChange,
  min,
  isBooked,
  placeholder = "Sana tanlang",
  open,
  onOpenChange,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string; // 'yyyy-MM-dd' — bundan oldingilar bloklanadi
  isBooked?: (date: Date) => boolean; // band (🔴) — tanlab bo'lmaydi
  placeholder?: string;
  /**
   * Nazoratli ochiq/yopiq holat (ixtiyoriy). BUG FIX: ikkita DateField
   * (Kirish/Ketish) yonma-yon bo'lganda, ikkalasi mustaqil o'z holatini
   * boshqarganda, ikkisi BIR VAQTDA ochiq qolib, bir joyda ustma-ust
   * chiqishi mumkin edi. Chaqiruvchi shu ikkovini uzatib, faqat bittasi
   * ochiq bo'lishini ta'minlaydi. Berilmasa — avvalgidek mustaqil ishlaydi.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const selected = value ? new Date(value + "T00:00:00") : undefined;
  const minDate = min ? new Date(min + "T00:00:00") : undefined;

  const disabled = (date: Date) => {
    if (minDate) {
      const d = new Date(date); d.setHours(0, 0, 0, 0);
      const m = new Date(minDate); m.setHours(0, 0, 0, 0);
      if (d < m) return true;
    }
    if (isBooked && isBooked(date)) return true;
    return false;
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="w-full flex h-11 items-center justify-start rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] hover:border-[#C5A46D] transition-colors">
        <CalendarIcon className="mr-2.5 h-4 w-4 text-[#C5A46D]" />
        {selected ? (
          format(selected, "dd.MM.yyyy")
        ) : (
          <span className="text-[#A8A49B]/50">{placeholder}</span>
        )}
      </PopoverTrigger>
      {/* BUG FIX: yopiq-chiqish CSS animatsiyasi tugamay, popover ekranda
          "yopishib" qolib, boshqa maydonning kalendarini bosishga xalaqit
          berardi. Nazoratli rejimda (open aniq false) butunlay render
          qilinmaydi — DOM'da qolib ketmaydi. */}
      {open !== false && (
        <PopoverContent
          className="w-auto p-0 bg-[#111417] border-[rgba(197,164,109,0.22)] text-[#F5F2EB] z-[100]"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d?: Date) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
            disabled={disabled}
            modifiers={isBooked ? { booked: (date: Date) => isBooked(date) } : undefined}
            modifiersClassNames={{ booked: "line-through text-red-400/60 opacity-50" }}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
