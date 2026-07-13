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
  placeholder = "Sana tanlang",
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string; // 'yyyy-MM-dd' — bundan oldingilar bloklanadi
  placeholder?: string;
}) {
  const selected = value ? new Date(value + "T00:00:00") : undefined;
  const minDate = min ? new Date(min + "T00:00:00") : undefined;

  return (
    <Popover>
      <PopoverTrigger className="w-full flex h-11 items-center justify-start rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] hover:border-[#C5A46D] transition-colors">
        <CalendarIcon className="mr-2.5 h-4 w-4 text-[#C5A46D]" />
        {selected ? (
          format(selected, "dd.MM.yyyy")
        ) : (
          <span className="text-[#A8A49B]/50">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-[#111417] border-[rgba(197,164,109,0.22)] text-[#F5F2EB] z-[100]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d?: Date) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          disabled={minDate ? (date: Date) => date < minDate : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
