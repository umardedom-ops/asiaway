"use client";

import { MapPin, Footprints, Car } from "lucide-react";
import { useLang } from "./LanguageProvider";
import type { Lang } from "@/lib/i18n";

type Place = { name: string; min: number; mode: "walk" | "drive" };

const TR: Record<Lang, {
  kicker: string; title: string; body: string; nearby: string; unit: string;
  walk: string; drive: string; places: Place[];
}> = {
  uz: {
    kicker: "Joylashuv",
    title: "Joylashuv va infratuzilma",
    body: "Nest One — Toshkent shahrining yuragida, jadal rivojlanayotgan Tashkent City hududida. Yaqin atrofda Tashkent City Mall, Kongress-markaz hamda Hilton, Fairmont va Holiday Inn kabi eng yaxshi mehmonxonalar joylashgan.",
    nearby: "Bizga yaqin joylar",
    unit: "daqiqa", walk: "piyoda", drive: "mashinada",
    places: [
      { name: "Tashkent City Park", min: 1, mode: "walk" },
      { name: "Tashkent City Mall", min: 3, mode: "walk" },
      { name: "Kongress-markaz", min: 5, mode: "walk" },
      { name: "Hilton Tashkent", min: 6, mode: "walk" },
      { name: "Alisher Navoiy metrosi", min: 7, mode: "walk" },
      { name: "Mustaqillik maydoni", min: 10, mode: "walk" },
      { name: "Xalqaro aeroport", min: 15, mode: "drive" },
    ],
  },
  ru: {
    kicker: "Локация",
    title: "Локация и инфраструктура",
    body: "Nest One расположен в самом сердце Ташкента, в динамично развивающемся районе Tashkent City. Рядом — Tashkent City Mall, Конгресс-центр и лучшие отели: Hilton, Fairmont и Holiday Inn.",
    nearby: "Рядом с нами",
    unit: "мин", walk: "пешком", drive: "на машине",
    places: [
      { name: "Tashkent City Park", min: 1, mode: "walk" },
      { name: "Tashkent City Mall", min: 3, mode: "walk" },
      { name: "Конгресс-центр", min: 5, mode: "walk" },
      { name: "Hilton Tashkent", min: 6, mode: "walk" },
      { name: "Метро Алишер Навои", min: 7, mode: "walk" },
      { name: "Площадь Мустакиллик", min: 10, mode: "walk" },
      { name: "Аэропорт", min: 15, mode: "drive" },
    ],
  },
  en: {
    kicker: "Location",
    title: "Location & infrastructure",
    body: "Nest One sits in the heart of Tashkent, in the fast-growing Tashkent City district. Nearby are Tashkent City Mall, the Congress Center and top hotels — Hilton, Fairmont and Holiday Inn.",
    nearby: "Nearby places",
    unit: "min", walk: "on foot", drive: "by car",
    places: [
      { name: "Tashkent City Park", min: 1, mode: "walk" },
      { name: "Tashkent City Mall", min: 3, mode: "walk" },
      { name: "Congress Center", min: 5, mode: "walk" },
      { name: "Hilton Tashkent", min: 6, mode: "walk" },
      { name: "Alisher Navoi metro", min: 7, mode: "walk" },
      { name: "Mustaqillik Square", min: 10, mode: "walk" },
      { name: "International airport", min: 15, mode: "drive" },
    ],
  },
};

export default function LocationSection() {
  const { lang } = useLang();
  const t = TR[lang];

  return (
    <section id="location" className="py-[80px] lg:py-[130px] bg-[#0B0D0F]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-24 space-y-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 lg:items-end">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#C5A46D]" />
              <span className="text-[12px] md:text-[13px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">{t.kicker}</span>
            </div>
            <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[60px] font-medium text-[#F5F2EB] leading-[1.08] tracking-tight">{t.title}</h2>
          </div>
          <p className="text-[16px] md:text-[18px] text-[#A8A49B] leading-[1.65] lg:pb-2">{t.body}</p>
        </div>

        {/* Xarita — dark, champagne "Nest One" belgisi bilan */}
        <div className="relative rounded-[18px] overflow-hidden border border-[rgba(197,164,109,0.2)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] h-[360px] md:h-[500px] bg-[#111417]">
          <iframe
            title="Nest One — Tashkent City"
            src="https://maps.google.com/maps?q=41.304217,69.417816&hl=uz&z=15&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
            style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(0.65) brightness(1.05) contrast(0.92)", border: 0 }}
          />
          {/* Champagne markaziy belgi (Nest One) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(100%+2px)] flex flex-col items-center">
            <span className="px-3 py-1 rounded-full bg-[#C5A46D] text-[#0B0D0F] text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-lg mb-1">Nest One</span>
            <MapPin className="h-9 w-9 text-[#C5A46D] drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" fill="#C5A46D" strokeWidth={1.5} />
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(197,164,109,0.14)] rounded-[18px]" />
        </div>

        {/* Yaqin joylar — piyoda vaqti bilan gorizontal gallereya */}
        <div className="space-y-6">
          <div className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.14em]">{t.nearby}</div>
          <div className="flex gap-4 md:gap-5 overflow-x-auto pb-3 snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {t.places.map((p) => (
              <div
                key={p.name}
                className="group relative shrink-0 snap-start w-[210px] md:w-[240px] aspect-[3/4] rounded-[16px] overflow-hidden border border-[rgba(197,164,109,0.16)] bg-gradient-to-br from-[#161b21] to-[#0e1114] p-6 flex flex-col justify-between hover:border-[rgba(197,164,109,0.4)] transition-colors"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#C5A46D]/12 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <MapPin className="h-6 w-6 text-[#C5A46D]" />
                  {p.mode === "walk"
                    ? <Footprints className="h-5 w-5 text-[#A8A49B]" />
                    : <Car className="h-5 w-5 text-[#A8A49B]" />}
                </div>
                <div className="relative">
                  <div className="flex items-end gap-2">
                    <span className="font-heading text-[64px] leading-[0.82] font-medium text-[#F5F2EB] [font-variant-numeric:lining-nums]">{p.min}</span>
                    <span className="text-[13px] text-[#A8A49B] pb-2 lowercase">{t.unit}</span>
                  </div>
                  <div className="text-[16px] text-[#F5F2EB] font-medium mt-3 leading-tight">{p.name}</div>
                  <div className="text-[12px] text-[#C5A46D] mt-1 tracking-wide">{p.mode === "walk" ? t.walk : t.drive}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
