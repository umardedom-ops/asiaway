"use client";

import { useState } from "react";
import Link from "next/link";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { btnPrimary, btnSecondary, btnLg } from "@/lib/ui";
import { getApartmentImages, AMENITY_LABELS } from "@/lib/seed-data";
import { APARTMENT_TR, type Lang } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const DX: Record<
  Lang,
  {
    back: string; priceLabel: string; perNight: string; specRooms: string; specFloor: string;
    specArea: string; specGuests: string; descTitle: string; amenTitle: string;
    serviceTitle: string; serviceBody: string; book: string; unitFloor: string;
    unitRoom: string; unitGuest: string;
  }
> = {
  uz: { back: "Barcha apartamentlar", priceLabel: "Narx", perNight: "/ kun", specRooms: "Xonalar", specFloor: "Qavat", specArea: "Maydon", specGuests: "Sig'im", descTitle: "Rezidensiya tavsifi", amenTitle: "Qulayliklar", serviceTitle: "AsiaWay eksklyuziv xizmati", serviceBody: "Ijara davomida aeroportdan shaxsiy transfer va 24/7 konsyerj xizmati taqdim etiladi.", book: "Band qilish", unitFloor: "qavat", unitRoom: "xona", unitGuest: "mehmon" },
  ru: { back: "Все апартаменты", priceLabel: "Цена", perNight: "/ сутки", specRooms: "Комнаты", specFloor: "Этаж", specArea: "Площадь", specGuests: "Вместимость", descTitle: "Описание резиденции", amenTitle: "Удобства", serviceTitle: "Эксклюзивный сервис AsiaWay", serviceBody: "На время аренды предоставляются личный трансфер из аэропорта и консьерж-сервис 24/7.", book: "Забронировать", unitFloor: "этаж", unitRoom: "комн.", unitGuest: "гостей" },
  en: { back: "All apartments", priceLabel: "Price", perNight: "/ night", specRooms: "Rooms", specFloor: "Floor", specArea: "Area", specGuests: "Capacity", descTitle: "Residence description", amenTitle: "Amenities", serviceTitle: "AsiaWay exclusive service", serviceBody: "Private airport transfer and 24/7 concierge service are provided during your stay.", book: "Book now", unitFloor: "floor", unitRoom: "rooms", unitGuest: "guests" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ApartmentDetail({ apartment }: { apartment: any }) {
  const { t, lang } = useLang();
  const d = DX[lang];
  const [imageIndex, setImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const images = getApartmentImages(apartment);
  const view =
    lang === "uz"
      ? apartment.view
      : APARTMENT_TR[apartment.id]?.[lang]?.view ?? apartment.view;
  const description =
    lang === "uz"
      ? apartment.description
      : APARTMENT_TR[apartment.id]?.[lang]?.description ?? apartment.description;
  const title =
    lang === "uz"
      ? apartment.title
      : apartment.title.replace(/-qavat/gi, lang === "ru" ? " этаж" : " floor");

  const fmtPrice = (n: number) => `$${Number(n).toLocaleString("en-US")}`;

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F2EB] font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 md:px-10 py-4 bg-[#0B0D0F]/90 backdrop-blur border-b border-[rgba(197,164,109,0.14)]">
        <Link
          href="/#catalog"
          className="inline-flex items-center gap-2 text-[13px] text-[#A8A49B] hover:text-[#C5A46D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {d.back}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="max-w-[1100px] mx-auto px-5 md:px-10 py-10 space-y-12">
        {/* Gallery */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[12px] bg-black group">
          {images.map((img, i) => (
            <div
              key={img + i}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === imageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${view} — ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImageIndex((p) => (p === 0 ? images.length - 1 : p - 1))}
                aria-label="Oldingi rasm"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#111417]/70 backdrop-blur border border-[rgba(197,164,109,0.15)] text-[#F5F2EB] hover:text-[#C5A46D] hover:border-[#C5A46D]/60 flex items-center justify-center transition-all z-20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setImageIndex((p) => (p === images.length - 1 ? 0 : p + 1))}
                aria-label="Keyingi rasm"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#111417]/70 backdrop-blur border border-[rgba(197,164,109,0.15)] text-[#F5F2EB] hover:text-[#C5A46D] hover:border-[#C5A46D]/60 flex items-center justify-center transition-all z-20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-[#111417]/60 px-3 py-1.5 rounded-full border border-[rgba(197,164,109,0.1)] backdrop-blur-sm">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    aria-label={`Rasm ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === imageIndex ? "w-5 bg-[#C5A46D]" : "w-2 bg-[#A8A49B]/40 hover:bg-[#A8A49B]/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title + price */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 border-b border-[rgba(197,164,109,0.14)] pb-8">
          <div className="space-y-3">
            <span className="text-[12px] font-semibold text-[#C5A46D] tracking-[0.12em] uppercase">
              Tashkent City • Nest One
            </span>
            <h1 className="font-heading text-[36px] md:text-[48px] font-medium leading-[1.05]">{title}</h1>
            <p className="text-[15px] text-[#A8A49B] font-light">{view}</p>
          </div>
          <div className="lg:text-right shrink-0">
            <div className="text-[12px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em] mb-1">
              {d.priceLabel}
            </div>
            <div className="text-[28px] text-[#C5A46D] font-medium">
              {fmtPrice(apartment.price_per_day)}{" "}
              <span className="text-[16px] text-[#A8A49B] font-light">{d.perNight}</span>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            [d.specRooms, `${apartment.rooms} ${d.unitRoom}`],
            [d.specFloor, `${apartment.floor}-${d.unitFloor}`],
            [d.specArea, `${apartment.area_m2} m²`],
            [d.specGuests, `${apartment.max_guests || 4} ${d.unitGuest}`],
          ].map(([label, value]) => (
            <div key={label} className="space-y-1 border-l border-[rgba(197,164,109,0.22)] pl-4">
              <div className="text-[11px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em]">{label}</div>
              <div className="text-[16px] font-medium">{value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="space-y-4 max-w-[760px]">
          <h2 className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.12em]">{d.descTitle}</h2>
          <p className="text-[16px] text-[#F5F2EB]/90 leading-[1.7] font-light">{description}</p>
        </div>

        {/* Amenities */}
        {apartment.amenities && apartment.amenities.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.12em]">{d.amenTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-[15px] text-[#F5F2EB]/90 font-light">
              {apartment.amenities.map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#C5A46D] flex-shrink-0" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span>{(t.amenities as any)[amenity.toLowerCase()] || AMENITY_LABELS[amenity.toLowerCase()] || amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service note */}
        <div className="p-6 bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[8px] flex items-start gap-4 max-w-[760px]">
          <Sparkles className="h-5 w-5 text-[#C5A46D] flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-medium tracking-wide">{d.serviceTitle}</h3>
            <p className="text-[14px] text-[#A8A49B] leading-[1.6] font-light">{d.serviceBody}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2 pb-16">
          <Button onClick={() => setIsBookingOpen(true)} className={`${btnPrimary} ${btnLg} sm:min-w-[280px]`}>
            {d.book}
          </Button>
          <Link href="/#catalog" className={`${btnSecondary} ${btnLg} inline-flex`}>
            {d.back}
          </Link>
        </div>
      </main>

      <BookingDialog
        apartment={apartment}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
