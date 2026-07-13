"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLang } from "./LanguageProvider";
import { btnPrimary, btnLg } from "@/lib/ui";
import type { Lang } from "@/lib/i18n";

const TR: Record<Lang, {
  kicker: string; title: string; body: string; points: string[]; cta: string; free: string; badge: string;
}> = {
  uz: {
    kicker: "Aeroport xizmati",
    title: "Aeroportda kutib olamiz",
    body: "Toshkent aeroportidan shaxsiy transfer bilan kutib olamiz va to'g'ridan-to'g'ri apartamentgacha kuzatib qo'yamiz. Uzoq yo'ldan so'ng — hech qanday tashvishsiz, bamaylixotir.",
    points: ["Shaxsiy avtomobilda transfer", "24/7 kutib olish va kuzatish", "Ismingiz bilan kutib olish (meet & greet)"],
    cta: "Bog'lanish",
    free: "Rezidensiya ijarasida — shunday xizmatimiz bor",
    badge: "Meet & Greet",
  },
  ru: {
    kicker: "Аэропорт-сервис",
    title: "Встретим в аэропорту",
    body: "Встречаем в аэропорту Ташкента на личном авто и сопровождаем прямо до апартамента. После долгой дороги — спокойно и без забот.",
    points: ["Трансфер на личном авто", "Встреча и сопровождение 24/7", "Встреча с табличкой (meet & greet)"],
    cta: "Связаться",
    free: "Доступна услуга трансфера при аренде",
    badge: "Meet & Greet",
  },
  en: {
    kicker: "Airport service",
    title: "We meet you at the airport",
    body: "We meet you at Tashkent airport with a private transfer and escort you straight to your residence. After a long journey — calm and completely worry-free.",
    points: ["Private car transfer", "24/7 meet & escort", "Personal meet & greet"],
    cta: "Get in touch",
    free: "Airport transfer service available",
    badge: "Meet & Greet",
  },
};

export default function AirportService() {
  const { lang } = useLang();
  const t = TR[lang];
  const vidRef = useRef<HTMLVideoElement>(null);

  // Ko'rinishga kelganda ijro et, chiqib ketganда to'xtat (autoplay siyosati + tejamkorlik)
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.play().catch(() => {});
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())),
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="py-[80px] lg:py-[130px] px-6 lg:px-24 bg-[#0B0D0F]" id="airport">
      <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        {/* Video — nafis, kichik ramka */}
        <div className="relative order-1 lg:order-none mx-auto lg:mx-0 w-full max-w-[520px]">
          <div className="relative rounded-[22px] overflow-hidden border border-[rgba(197,164,109,0.2)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] aspect-[4/3] bg-[#111417]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={vidRef}
              src="/video/airport-service.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/70 via-transparent to-[#0B0D0F]/10" />
            <div className="absolute top-4 left-4 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#0B0D0F] bg-[#C5A46D] px-3 py-1.5 rounded-full">
              {t.badge}
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2 text-[13px] text-[#F5F2EB]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A46D]" />
              <span className="font-medium">{t.free}</span>
            </div>
          </div>
          {/* nozik champagne halo */}
          <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[30px] bg-[#C5A46D]/10 blur-2xl" />
        </div>

        {/* Matn */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#C5A46D]" />
            <span className="text-[12px] md:text-[13px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">{t.kicker}</span>
          </div>
          <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[56px] font-medium text-[#F5F2EB] leading-[1.08] tracking-tight">{t.title}</h2>
          <p className="text-[16px] md:text-[18px] text-[#A8A49B] leading-[1.65] max-w-[520px]">{t.body}</p>
          <ul className="space-y-4 pt-2">
            {t.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] md:text-[16px] text-[#F5F2EB]">
                <CheckCircle2 className="h-5 w-5 text-[#C5A46D] flex-shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <a href="#contact">
              <button className={`${btnPrimary} ${btnLg}`}>{t.cta}</button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
