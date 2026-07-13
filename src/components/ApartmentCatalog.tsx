"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BookingDialog from "./BookingDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AMENITY_LABELS, getApartmentImages } from "@/lib/seed-data";
import { APARTMENT_TR, type Lang } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import { Search, SlidersHorizontal, CheckCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// Modal / karta uchun mayda matnlar (i18n.ts ni shishirtmaslik uchun shu yerda)
const MX: Record<Lang, {
  priceLabel: string; specRooms: string; specFloor: string; specArea: string; specGuests: string;
  descTitle: string; amenTitle: string; serviceTitle: string; serviceBody: string; close: string; view: string; unitFloor: string; unitRoom: string; unitGuest: string;
}> = {
  uz: { priceLabel: "Narx", specRooms: "Xonalar", specFloor: "Qavat", specArea: "Maydon", specGuests: "Sig'im", descTitle: "Rezidensiya tavsifi", amenTitle: "Qulayliklar", serviceTitle: "AsiaWay eksklyuziv xizmati", serviceBody: "Ushbu rezidensiya ijarasi davomida sizga aeroportdan shaxsiy transfer va 24/7 konsyerj xizmati taqdim etiladi.", close: "Yopish", view: "Apartamentni ko'rish", unitFloor: "qavat", unitRoom: "xona", unitGuest: "mehmon" },
  ru: { priceLabel: "Цена", specRooms: "Комнаты", specFloor: "Этаж", specArea: "Площадь", specGuests: "Вместимость", descTitle: "Описание резиденции", amenTitle: "Удобства", serviceTitle: "Эксклюзивный сервис AsiaWay", serviceBody: "На время аренды этой резиденции вам предоставляются личный трансфер из аэропорта и консьерж-сервис 24/7.", close: "Закрыть", view: "Смотреть апартамент", unitFloor: "этаж", unitRoom: "комн.", unitGuest: "гостей" },
  en: { priceLabel: "Price", specRooms: "Rooms", specFloor: "Floor", specArea: "Area", specGuests: "Capacity", descTitle: "Residence description", amenTitle: "Amenities", serviceTitle: "AsiaWay exclusive service", serviceBody: "During this residence's stay, private airport transfer and 24/7 concierge service are provided.", close: "Close", view: "View apartment", unitFloor: "floor", unitRoom: "rooms", unitGuest: "guests" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ApartmentCatalog({ initialApartments }: { initialApartments: any[] }) {
  const { t, lang } = useLang();
  const f = t.filters;
  const mx = MX[lang];

  const [apartments] = useState(initialApartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDetails = (apt: any) => {
    setSelectedApartment(apt);
    setCurrentImageIndex(0);
    setIsDetailsOpen(true);
  };

  // Apartament matnini joriy tilga o'girish
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locView = (apt: any) => (lang === "uz" ? apt.view : APARTMENT_TR[apt.id]?.[lang]?.view ?? apt.view);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locDesc = (apt: any) => (lang === "uz" ? apt.description : APARTMENT_TR[apt.id]?.[lang]?.description ?? apt.description);
  const locTitle = (title: string) => (lang === "uz" ? title : title.replace(/-qavat/gi, lang === "ru" ? " этаж" : " floor"));

  const filteredApartments = apartments.filter((apt) => {
    const hay = `${apt.title} ${apt.description} ${locView(apt)} ${locDesc(apt)}`.toLowerCase();
    const matchesSearch = hay.includes(searchTerm.toLowerCase());
    const matchesRooms =
      roomFilter === "all" ||
      (roomFilter === "1" && Number(apt.rooms) === 1) ||
      (roomFilter === "2" && Number(apt.rooms) === 2) ||
      (roomFilter === "3" && Number(apt.rooms) >= 3);
    const price = Number(apt.price_per_day);
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && price <= 120) ||
      (priceFilter === "mid" && price > 120 && price <= 145) ||
      (priceFilter === "high" && price > 145);
    const floor = Number(apt.floor) || 0;
    const matchesFloor =
      floorFilter === "all" ||
      (floorFilter === "low" && floor < 10) ||
      (floorFilter === "mid" && floor >= 10 && floor <= 25) ||
      (floorFilter === "high" && floor > 25);
    return matchesSearch && matchesRooms && matchesPrice && matchesFloor;
  });

  const fmtPrice = (amount: number) => `$${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-12" id="catalog-inner">
      {/* FILTER BAR */}
      <div className="p-6 md:p-8 bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[8px] space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#A8A49B]" />
            <Input
              placeholder={f.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] placeholder-[#A8A49B]/50 focus:border-[#C5A46D] focus:ring-[#C5A46D] rounded-[6px] text-[15px]"
            />
          </div>
          <div className="flex items-center space-x-3 text-[#C5A46D] text-[12px] font-semibold uppercase tracking-[0.12em] md:border-l md:border-[rgba(197,164,109,0.22)] md:pl-6">
            <SlidersHorizontal className="h-4 w-4" />
            <span>{f.filters}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{f.rooms}</label>
            <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="w-full h-12 px-4 rounded-[6px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[15px] text-[#F5F2EB] focus:border-[#C5A46D] outline-none">
              <option value="all">{f.all}</option>
              <option value="1">{f.r1}</option>
              <option value="2">{f.r2}</option>
              <option value="3">{f.r3}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{f.price}</label>
            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="w-full h-12 px-4 rounded-[6px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[15px] text-[#F5F2EB] focus:border-[#C5A46D] outline-none">
              <option value="all">{f.all}</option>
              <option value="low">{f.pLow}</option>
              <option value="mid">{f.pMid}</option>
              <option value="high">{f.pHigh}</option>
            </select>
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-[#A8A49B] text-[12px] font-semibold uppercase tracking-[0.12em]">{f.floor}</label>
            <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} className="w-full h-12 px-4 rounded-[6px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[15px] text-[#F5F2EB] focus:border-[#C5A46D] outline-none">
              <option value="all">{f.all}</option>
              <option value="low">{f.fLow}</option>
              <option value="mid">{f.fMid}</option>
              <option value="high">{f.fHigh}</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {filteredApartments.length > 0 ? (
          filteredApartments.map((apt, index) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] overflow-hidden group hover:border-[rgba(197,164,109,0.4)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full shadow-none">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B0D0F] cursor-pointer" onClick={() => openDetails(apt)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={apt.cover_image} alt={locView(apt)} className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-[1000ms] ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-[10px] font-semibold tracking-[0.12em] text-[#F5F2EB] uppercase">
                    <span>{apt.area_m2} m² • {apt.rooms} {mx.unitRoom}</span>
                  </div>
                </div>
                <CardContent className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 cursor-pointer" onClick={() => openDetails(apt)}>
                    <h3 className="font-heading text-[24px] md:text-[28px] font-medium text-[#F5F2EB] group-hover:text-[#C5A46D] transition-colors leading-[1.1] line-clamp-2">
                       {locTitle(apt.title)}
                    </h3>
                    <div className="text-[13px] text-[#A8A49B] font-light">
                      {apt.floor}-{mx.unitFloor} • {apt.max_guests || 4} {mx.unitGuest}
                    </div>
                  </div>
                  <div className="mt-6 flex items-end justify-between border-t border-[rgba(197,164,109,0.14)] pt-5">
                    <div className="space-y-1">
                      <div className="text-[11px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em]">{mx.priceLabel}</div>
                      <div className="text-[16px] text-[#F5F2EB] font-medium">{fmtPrice(apt.price_per_day)} <span className="text-[13px] text-[#A8A49B] font-light">{t.card.perNight}</span></div>
                    </div>
                    <Button onClick={() => openDetails(apt)} className={`${btnSecondary} h-10 px-5 text-[12px]`}>
                      {mx.view}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center text-[#A8A49B] space-y-4">
            <SlidersHorizontal className="mx-auto h-8 w-8 text-[#C5A46D]/50" />
            <p className="text-[16px] font-light">{t.card.noResults}</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent showCloseButton={false} className="max-w-[800px] sm:max-w-[800px] md:max-w-[960px] lg:max-w-[1100px] w-[calc(100%-2rem)] bg-[#0B0D0F] border-[rgba(197,164,109,0.22)] text-[#F5F2EB] rounded-[12px] overflow-hidden p-0 gap-0 shadow-2xl h-[85svh] max-h-[85svh] md:h-[650px] lg:h-[750px] md:max-h-[85vh] flex flex-col">
          {selectedApartment && (() => {
            const images = getApartmentImages(selectedApartment);
            return (
              <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
                {/* LEFT: Image Slider */}
                <div className="relative h-[240px] md:h-full w-full md:w-[45%] lg:w-[50%] shrink-0 group/slider overflow-hidden bg-black">
                  {/* Images */}
                  <div className="w-full h-full relative">
                    {images.map((imgUrl, index) => (
                      <div
                        key={imgUrl + index}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                          index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`${locView(selectedApartment)} - ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-transparent to-transparent opacity-90 z-20 pointer-events-none" />

                  {/* Close Button for Mobile ONLY (hidden on md+) */}
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="md:hidden absolute top-4 right-4 bg-[#111417]/85 backdrop-blur border border-[rgba(197,164,109,0.22)] text-[#F5F2EB] hover:text-[#C5A46D] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 z-30 shadow-lg hover:scale-105 active:scale-95"
                  >
                    ✕
                  </button>

                  {/* Left/Right Buttons - elegant desktop hover arrows, always visible on mobile */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#111417]/70 backdrop-blur border border-[rgba(197,164,109,0.15)] text-[#F5F2EB] hover:text-[#C5A46D] hover:border-[#C5A46D]/60 flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 active:scale-95 md:opacity-0 md:group-hover/slider:opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#111417]/70 backdrop-blur border border-[rgba(197,164,109,0.15)] text-[#F5F2EB] hover:text-[#C5A46D] hover:border-[#C5A46D]/60 flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 active:scale-95 md:opacity-0 md:group-hover/slider:opacity-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Indicator Dots */}
                  {images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 bg-[#111417]/60 px-3 py-1.5 rounded-full border border-[rgba(197,164,109,0.1)] backdrop-blur-sm">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? "w-5 bg-[#C5A46D]"
                              : "w-2 bg-[#A8A49B]/40 hover:bg-[#A8A49B]/80"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Content Area */}
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full md:w-[55%] lg:w-[50%] bg-[#0B0D0F] relative">
                  {/* Close Button for Desktop ONLY */}
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="hidden md:flex absolute top-6 right-6 bg-[#111417]/85 backdrop-blur border border-[rgba(197,164,109,0.22)] text-[#F5F2EB] hover:text-[#C5A46D] rounded-full w-10 h-10 items-center justify-center transition-all duration-300 z-30 shadow-lg hover:scale-105 active:scale-95"
                  >
                    ✕
                  </button>

                  <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden p-8 md:p-10 lg:p-12 md:pt-20 custom-scrollbar">
                    <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-6 mb-10 border-b border-[rgba(197,164,109,0.14)] pb-8">
                      <div className="space-y-4 pr-12 md:pr-0">
                        <span className="text-[12px] font-semibold text-[#C5A46D] tracking-[0.12em] uppercase">Tashkent City • Nest One</span>
                        <h2 className="font-heading text-[32px] lg:text-[42px] font-medium text-[#F5F2EB] leading-[1.05]">{locTitle(selectedApartment.title)}</h2>
                      </div>
                      <div className="text-left xl:text-right shrink-0">
                        <div className="text-[12px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em] mb-1">{mx.priceLabel}</div>
                        <div className="text-[24px] text-[#C5A46D] font-medium">{fmtPrice(selectedApartment.price_per_day)} <span className="text-[16px] text-[#A8A49B] font-light">{t.card.perNight}</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      <div className="space-y-1 text-center md:text-left border-l border-[rgba(197,164,109,0.22)] pl-4">
                        <div className="text-[11px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em]">{mx.specRooms}</div>
                        <div className="text-[16px] font-medium text-[#F5F2EB]">{selectedApartment.rooms} {mx.unitRoom}</div>
                      </div>
                      <div className="space-y-1 text-center md:text-left border-l border-[rgba(197,164,109,0.22)] pl-4">
                        <div className="text-[11px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em]">{mx.specFloor}</div>
                        <div className="text-[16px] font-medium text-[#F5F2EB]">{selectedApartment.floor}-{mx.unitFloor}</div>
                      </div>
                      <div className="space-y-1 text-center md:text-left border-l border-[rgba(197,164,109,0.22)] pl-4">
                        <div className="text-[11px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em]">{mx.specArea}</div>
                        <div className="text-[16px] font-medium text-[#F5F2EB]">{selectedApartment.area_m2} m²</div>
                      </div>
                      <div className="space-y-1 text-center md:text-left border-l border-[rgba(197,164,109,0.22)] pl-4">
                        <div className="text-[11px] text-[#A8A49B] font-semibold uppercase tracking-[0.12em]">{mx.specGuests}</div>
                        <div className="text-[16px] font-medium text-[#F5F2EB]">{selectedApartment.max_guests || 4} {mx.unitGuest}</div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-12">
                      <h3 className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.12em]">{mx.descTitle}</h3>
                      <p className="text-[16px] text-[#F5F2EB]/90 leading-[1.7] font-light">{locDesc(selectedApartment)}</p>
                    </div>

                    {selectedApartment.amenities && selectedApartment.amenities.length > 0 && (
                      <div className="space-y-6 mb-12">
                        <h3 className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.12em]">{mx.amenTitle}</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[15px] text-[#F5F2EB]/90 font-light">
                          {selectedApartment.amenities.map((amenity: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-3">
                              <CheckCircle className="h-4 w-4 text-[#C5A46D] flex-shrink-0" />
                              <span>{(t.amenities as any)[amenity.toLowerCase()] || AMENITY_LABELS[amenity.toLowerCase()] || amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[8px] mb-4 flex items-start gap-4">
                      <Sparkles className="h-5 w-5 text-[#C5A46D] flex-shrink-0 mt-1" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-[#F5F2EB] tracking-wide">{mx.serviceTitle}</h4>
                        <p className="text-[14px] text-[#A8A49B] leading-[1.6] font-light">{mx.serviceBody}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 border-t border-[rgba(197,164,109,0.14)] bg-[#0B0D0F] shrink-0">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={() => { setIsDetailsOpen(false); setTimeout(() => setIsBookingOpen(true), 50); }} className={`w-full sm:w-2/3 ${btnPrimary} h-14 text-[15px]`}>{t.nav.book}</Button>
                      <Button onClick={() => setIsDetailsOpen(false)} className={`w-full sm:w-1/3 ${btnSecondary} h-14 text-[15px]`}>{mx.close}</Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <BookingDialog apartment={selectedApartment} isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
}
