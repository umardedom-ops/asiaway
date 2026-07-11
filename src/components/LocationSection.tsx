"use client";

import { useRef } from "react";
import { MapPin, Footprints, Car } from "lucide-react";
import { useLang } from "./LanguageProvider";
import type { Lang } from "@/lib/i18n";

/* ============================================================
   JOYLASHUV — stilniy xarita + turistik joylar galereyasi.
   Har karta: haqiqiy foto (Wikimedia Commons, erkin litsenziya),
   hover'da POP-OUT (ko'tarilib bo'rtib chiqadi) + 3D tilt + glare.
   Yon scroll: strelka tugmalar + swipe.
   ============================================================ */

const WM = "https://upload.wikimedia.org/wikipedia/commons/thumb";

type Place = { key: string; min: number; mode: "walk" | "drive"; img: string };

// Islom sivilizatsiyasi markazi — 1-o'rinda (egasi talabi)
const PLACES: Place[] = [
  { key: "islamic_center", min: 12, mode: "drive", img: `${WM}/f/f2/Center_of_Islamic_Civilization_of_Uzbekistan_Tashkent_2026_034.jpg/1280px-Center_of_Islamic_Civilization_of_Uzbekistan_Tashkent_2026_034.jpg` },
  { key: "city_park", min: 1, mode: "walk", img: `${WM}/7/7c/Tashkent_City_Park_at_night_4.jpg/1280px-Tashkent_City_Park_at_night_4.jpg` },
  { key: "city_mall", min: 3, mode: "walk", img: `${WM}/a/a6/Tashkent_City_Mall_%28inside%29.jpg/1280px-Tashkent_City_Mall_%28inside%29.jpg` },
  { key: "hilton", min: 6, mode: "walk", img: `${WM}/5/5f/Hilton_Tashkent_City.jpg/1280px-Hilton_Tashkent_City.jpg` },
  { key: "hazrati_imom", min: 12, mode: "drive", img: `${WM}/a/a9/Minaret_of_Hazrati_Imam_Mosque_01.jpg/1280px-Minaret_of_Hazrati_Imam_Mosque_01.jpg` },
  { key: "mustaqillik", min: 10, mode: "drive", img: `${WM}/2/26/Monument_at_Mustaqillik_maydoni_02.jpg/1280px-Monument_at_Mustaqillik_maydoni_02.jpg` },
  { key: "chorsu", min: 10, mode: "drive", img: `${WM}/b/ba/Chorsu_Bazaar_in_Tashkent.jpg/1280px-Chorsu_Bazaar_in_Tashkent.jpg` },
  { key: "magic_city", min: 15, mode: "drive", img: `${WM}/b/bb/Magic_city_Tashkent.jpg/1280px-Magic_city_Tashkent.jpg` },
  { key: "airport", min: 15, mode: "drive", img: `${WM}/1/19/TASHKENT_AIRPORT.2_-_panoramio.jpg/1280px-TASHKENT_AIRPORT.2_-_panoramio.jpg` },
];

const TR: Record<Lang, {
  kicker: string; title: string; body: string; nearby: string; unit: string;
  walk: string; drive: string; names: Record<string, string>;
}> = {
  uz: {
    kicker: "Joylashuv",
    title: "Joylashuv va infratuzilma",
    body: "Nest One — Toshkent shahrining yuragida, Tashkent City hududida. Shahar diqqatga sazovor joylari — Islom sivilizatsiyasi markazi, Hazrati Imom, Chorsu — bir qadamda.",
    nearby: "Bizga yaqin joylar",
    unit: "daqiqa", walk: "piyoda", drive: "mashinada",
    names: {
      islamic_center: "Islom sivilizatsiyasi markazi", city_park: "Tashkent City Park",
      city_mall: "Tashkent City Mall", hilton: "Hilton Tashkent", hazrati_imom: "Hazrati Imom majmuasi",
      mustaqillik: "Mustaqillik maydoni", chorsu: "Chorsu bozori", magic_city: "Magic City", airport: "Xalqaro aeroport",
    },
  },
  ru: {
    kicker: "Локация",
    title: "Локация и инфраструктура",
    body: "Nest One расположен в сердце Ташкента, в районе Tashkent City. Главные достопримечательности города — Центр исламской цивилизации, Хазрати Имам, Чорсу — в шаге от вас.",
    nearby: "Рядом с нами",
    unit: "мин", walk: "пешком", drive: "на машине",
    names: {
      islamic_center: "Центр исламской цивилизации", city_park: "Tashkent City Park",
      city_mall: "Tashkent City Mall", hilton: "Hilton Tashkent", hazrati_imom: "Комплекс Хазрати Имам",
      mustaqillik: "Площадь Мустакиллик", chorsu: "Базар Чорсу", magic_city: "Magic City", airport: "Международный аэропорт",
    },
  },
  en: {
    kicker: "Location",
    title: "Location & infrastructure",
    body: "Nest One sits in the heart of Tashkent, in the Tashkent City district. The city's main sights — the Center of Islamic Civilization, Hazrati Imam, Chorsu — are moments away.",
    nearby: "Nearby places",
    unit: "min", walk: "on foot", drive: "by car",
    names: {
      islamic_center: "Center of Islamic Civilization", city_park: "Tashkent City Park",
      city_mall: "Tashkent City Mall", hilton: "Hilton Tashkent", hazrati_imom: "Hazrati Imam Complex",
      mustaqillik: "Mustaqillik Square", chorsu: "Chorsu Bazaar", magic_city: "Magic City", airport: "International airport",
    },
  },
};

/** Karta: hover'da POP-OUT (ko'tarilib bo'rtadi) + sichqonchaga qarab 3D tilt + glare. */
function TiltCard({ place, name, unit, modeLabel }: { place: Place; name: string; unit: string; modeLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) translateY(-14px) translateZ(40px) rotateY(${px * 12}deg) rotateX(${py * -12}deg) scale(1.06)`;
    el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) translateY(0) translateZ(0) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <div className="shrink-0 w-[240px] md:w-[280px] mr-4 md:mr-6 py-4" style={{ perspective: "900px" }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative aspect-[3/4] rounded-[18px] overflow-hidden border border-[rgba(197,164,109,0.18)] bg-[#111417] transition-transform duration-300 ease-out will-change-transform hover:border-[#C5A46D]/70 hover:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9),0_0_60px_-8px_rgba(197,164,109,0.35)]"
      >
        {/* Foto */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.img}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12]"
        />
        {/* Qoraytirish gradienti */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/20 to-transparent" />
        {/* Sichqonchaga ergashuvchi champagne yorug'lik */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), rgba(197,164,109,0.22), transparent 65%)" }}
        />
        {/* Vaqt chipi */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-[#0B0D0F]/70 backdrop-blur-md border border-[rgba(197,164,109,0.3)] px-3 py-1.5">
          {place.mode === "walk"
            ? <Footprints className="h-3.5 w-3.5 text-[#C5A46D]" />
            : <Car className="h-3.5 w-3.5 text-[#C5A46D]" />}
          <span className="text-[12px] font-semibold text-[#F5F2EB] [font-variant-numeric:lining-nums]">{place.min} {unit}</span>
        </div>
        {/* Pastki matn */}
        <div className="absolute bottom-0 inset-x-0 p-5">
          <div className="text-[17px] md:text-[18px] font-semibold text-[#F5F2EB] leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{name}</div>
          <div className="text-[12px] text-[#C5A46D] mt-1 tracking-wide">{modeLabel}</div>
        </div>
      </div>
    </div>
  );
}

export default function LocationSection() {
  const { lang } = useLang();
  const t = TR[lang];
  // Seamless loop uchun ikki nusxa
  const loop = [...PLACES, ...PLACES];

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

        {/* Xarita — dark, champagne "Nest One" belgisi */}
        <div className="relative rounded-[18px] overflow-hidden border border-[rgba(197,164,109,0.2)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] h-[360px] md:h-[500px] bg-[#111417]">
          <iframe
            title="Nest One — Tashkent City"
            src="https://maps.google.com/maps?q=41.304217,69.417816&hl=uz&z=15&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
            style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(0.65) brightness(1.05) contrast(0.92)", border: 0 }}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(100%+2px)] flex flex-col items-center">
            <span className="px-3 py-1 rounded-full bg-[#C5A46D] text-[#0B0D0F] text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-lg mb-1">Nest One</span>
            <MapPin className="h-9 w-9 text-[#C5A46D] drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" fill="#C5A46D" strokeWidth={1.5} />
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(197,164,109,0.14)] rounded-[18px]" />
        </div>

        {/* Yaqin joylar — avtomatik aylanuvchi (marquee) fotoli pop-out kartalar */}
        <div className="space-y-4">
          <div className="text-[12px] font-semibold text-[#A8A49B] uppercase tracking-[0.14em]">{t.nearby}</div>
          <div className="marquee-wrap relative overflow-hidden">
            <div className="marquee-track flex">
              {loop.map((p, i) => (
                <TiltCard
                  key={`${p.key}-${i}`}
                  place={p}
                  name={t.names[p.key]}
                  unit={t.unit}
                  modeLabel={p.mode === "walk" ? t.walk : t.drive}
                />
              ))}
            </div>
            {/* Chekka gradientlar — silliq kirib-chiqish */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 lg:w-24 bg-gradient-to-r from-[#0B0D0F] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 lg:w-24 bg-gradient-to-l from-[#0B0D0F] to-transparent" />
          </div>
          <div className="text-[10px] text-[#A8A49B]/50">Foto: Wikimedia Commons (erkin litsenziya) · sichqoncha kelganda to&apos;xtaydi</div>
        </div>
      </div>
    </section>
  );
}
