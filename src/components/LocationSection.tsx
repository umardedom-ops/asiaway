"use client";

import { MapPin } from "lucide-react";
import { useLang } from "./LanguageProvider";
import type { Lang } from "@/lib/i18n";

const TR: Record<Lang, {
  kicker: string; title: string; body: string; nearby: string;
  places: { name: string; dist: string }[];
}> = {
  uz: {
    kicker: "Joylashuv",
    title: "Joylashuv va infratuzilma",
    body: "Nest One — Toshkent shahrining yuragida, jadal rivojlanayotgan Tashkent City hududida joylashgan. Yaqin atrofda Tashkent City Mall, Kongress-markaz hamda Hilton, Fairmont va Holiday Inn kabi eng yaxshi mehmonxonalar bor.",
    nearby: "Yaqin atrofda",
    places: [
      { name: "Tashkent City Park", dist: "Bevosita kirish" },
      { name: "Tashkent City Mall", dist: "400 m" },
      { name: "Kongress-markaz", dist: "500 m" },
      { name: "Hilton Tashkent", dist: "600 m" },
      { name: "Alisher Navoiy metrosi", dist: "900 m" },
      { name: "Xalqaro aeroport", dist: "~15 km" },
    ],
  },
  ru: {
    kicker: "Локация",
    title: "Локация и инфраструктура",
    body: "Nest One расположен в самом сердце Ташкента, в динамично развивающемся районе Tashkent City. Рядом — Tashkent City Mall, Конгресс-центр и лучшие отели: Hilton, Fairmont и Holiday Inn.",
    nearby: "Рядом",
    places: [
      { name: "Tashkent City Park", dist: "Прямой вход" },
      { name: "Tashkent City Mall", dist: "400 м" },
      { name: "Конгресс-центр", dist: "500 м" },
      { name: "Hilton Tashkent", dist: "600 м" },
      { name: "Метро Алишер Навои", dist: "900 м" },
      { name: "Аэропорт", dist: "~15 км" },
    ],
  },
  en: {
    kicker: "Location",
    title: "Location & infrastructure",
    body: "Nest One sits in the heart of Tashkent, in the fast-growing Tashkent City district. Nearby are Tashkent City Mall, the Congress Center and top hotels — Hilton, Fairmont and Holiday Inn.",
    nearby: "Nearby",
    places: [
      { name: "Tashkent City Park", dist: "Direct access" },
      { name: "Tashkent City Mall", dist: "400 m" },
      { name: "Congress Center", dist: "500 m" },
      { name: "Hilton Tashkent", dist: "600 m" },
      { name: "Alisher Navoi metro", dist: "900 m" },
      { name: "International airport", dist: "~15 km" },
    ],
  },
};

export default function LocationSection() {
  const { lang } = useLang();
  const t = TR[lang];

  return (
    <section id="location" className="py-[80px] lg:py-[130px] px-6 lg:px-24 bg-[#0B0D0F]">
      <div className="max-w-[1280px] mx-auto space-y-12">
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

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Yaqin joylar */}
          <div className="lg:col-span-1 rounded-[16px] border border-[rgba(197,164,109,0.14)] bg-[#111417] p-6 md:p-8">
            <div className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.12em] mb-6">{t.nearby}</div>
            <ul className="space-y-5">
              {t.places.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-4 border-b border-[rgba(197,164,109,0.08)] pb-5 last:border-0 last:pb-0">
                  <span className="flex items-center gap-3 text-[15px] text-[#F5F2EB]">
                    <MapPin className="h-4 w-4 text-[#C5A46D] flex-shrink-0" />
                    {p.name}
                  </span>
                  <span className="text-[13px] text-[#C5A46D] font-medium whitespace-nowrap">{p.dist}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Xarita */}
          <div className="lg:col-span-2 relative rounded-[16px] overflow-hidden border border-[rgba(197,164,109,0.18)] aspect-[16/11] lg:aspect-auto lg:min-h-[420px] bg-[#111417]">
            <iframe
              title="Nest One — Tashkent City"
              src="https://maps.google.com/maps?q=41.304217,69.417816&hl=uz&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full"
              style={{ filter: "invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(0.9)", border: 0 }}
            />
            {/* champagne ramka ichki soyasi + markaz belgisi kontrasti uchun nozik qatlam */}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(197,164,109,0.12)] rounded-[16px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
