"use client";

import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { APARTMENTS } from "@/lib/seed-data";
import { APARTMENT_TR } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";
import { btnPrimary } from "@/lib/ui";

/* ============================================================
   NEST ONE — Scroll-driven kinematik galereya (haqiqiy suratlar)
   Til-sezgir: kicker, sarlavha/tavsif va CTA joriy tilга o'giriladi.
   ============================================================ */

type SlideData = { image: string; kicker: string; title: string; sub: string; price: number };

const FLOOR_WORD = { uz: "QAVAT", ru: "ЭТАЖ", en: "FLOOR" } as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Slide({
  slide,
  index,
  total,
  bookLabel,
  perNight,
}: {
  slide: SlideData;
  index: number;
  total: number;
  bookLabel: string;
  perNight: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.32, 0.68, 1], [1.25, 1.06, 1.06, 1.14]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.32, 0.68, 1],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]
  );
  
  const textY = useTransform(scrollYProgress, [0, 0.32, 0.68, 1], [70, 0, 0, -70]);
  const panelY = useTransform(scrollYProgress, [0, 0.32, 0.68, 1], [30, 0, 0, -30]);

  return (
    <div ref={ref} className="relative h-[150vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0B0D0F]">
        <motion.div style={{ opacity, scale }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>

        {/* Navy gradient */}
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/40 via-40% to-transparent to-75%"
        />
        <motion.div
          style={{ opacity }}
          className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0B0D0F]/80 to-transparent"
        />

        {/* Text */}
        <motion.div
          style={{ opacity, y: textY }}
          className="absolute inset-x-0 bottom-0 px-6 md:px-16 pb-40 md:pb-44"
        >
          <div className="max-w-xl">
            <span className="text-[11px] md:text-[12px] font-semibold tracking-[0.2em] text-[#C5A46D] uppercase">
              {slide.kicker}
            </span>
            <h2 className="mt-4 font-heading text-4xl md:text-5xl lg:text-6xl font-medium text-[#F5F2EB] leading-[1.05]">
              {slide.title}
            </h2>
            <p className="mt-5 text-[15px] md:text-[16px] text-[#F5F2EB]/80 font-light leading-relaxed max-w-md">
              {slide.sub}
            </p>
          </div>
        </motion.div>

        {/* CTA Panel */}
        <motion.div
          style={{ opacity, y: panelY }}
          className="absolute inset-x-0 bottom-0 px-6 md:px-16 pb-8 md:pb-10"
        >
          <div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417]/80 backdrop-blur-xl px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-center gap-4 md:gap-8">
              <span className="font-heading text-xl md:text-2xl font-semibold text-[#F5F2EB] tabular-nums tracking-wide">
                {pad(index + 1)}
                <span className="text-[#A8A49B]"> / {pad(total)}</span>
              </span>
              <span className="hidden sm:block h-8 w-px bg-[rgba(197,164,109,0.22)]" />
              <span className="hidden sm:block text-[15px] text-[#A8A49B] font-light">
                <span className="text-[#C5A46D] font-medium tracking-wide">${slide.price}</span> {perNight}
              </span>
            </div>
            <a href="#catalog" className={`${btnPrimary} h-11 px-6 text-[13px] whitespace-nowrap`}>
              {bookLabel}
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* Header */}
        {index === 0 && (
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 md:px-16 py-8">
            <span className="font-heading text-xl md:text-2xl font-medium tracking-wide text-[#F5F2EB]">
              NEST ONE
            </span>
            <span className="text-[11px] md:text-[12px] font-semibold tracking-[0.2em] text-[#C5A46D] uppercase">
              Tashkent City
            </span>
          </div>
        )}

        {/* Scroll indicator */}
        {index === 0 && (
          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
            className="absolute bottom-[8rem] md:bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[#A8A49B] z-10"
          >
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">Scroll</span>
            <span className="h-10 w-6 rounded-full border border-[rgba(197,164,109,0.4)] flex justify-center pt-2">
              <span className="h-1.5 w-1 rounded-full bg-[#C5A46D] animate-bounce" />
            </span>
          </motion.div>
        )}

        {/* Progress line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#111417] z-10">
          <motion.div
            style={{
              width: `${((index + 1) / total) * 100}%`,
              opacity: useTransform(scrollYProgress, [0, 0.5], [0.3, 1]),
            }}
            className="h-full bg-[#C5A46D]"
          />
        </div>
      </div>
    </div>
  );
}

export default function NestOneShowcase() {
  const { t, lang } = useLang();

  const slides = useMemo<SlideData[]>(
    () =>
      APARTMENTS.filter((a) => a.cover_image)
        .slice(0, 5)
        .map((a) => {
          const tr = lang === "uz" ? null : APARTMENT_TR[a.id]?.[lang];
          return {
            image: a.cover_image,
            kicker: `${a.floor}-${FLOOR_WORD[lang]} · ${a.area_m2} M²`,
            title: tr?.view ?? a.view,
            sub: tr?.description ?? a.description,
            price: a.price_per_day,
          };
        }),
    [lang]
  );

  return (
    <section className="relative bg-[#0B0D0F]">
      {slides.map((slide, i) => (
        <Slide
          key={i}
          slide={slide}
          index={i}
          total={slides.length}
          bookLabel={t.nav.book}
          perNight={t.card.perNight}
        />
      ))}
    </section>
  );
}
