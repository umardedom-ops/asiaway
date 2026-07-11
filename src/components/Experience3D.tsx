"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/LanguageProvider";
import { btnPrimary, btnLg } from "@/lib/ui";

export default function Experience3D() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);

  /* Orqa rasm sekin parallax harakatlanadi */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  /* Matn animatsiyasi — pastdan yuqoriga */
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" as const } },
  };

  return (
    <section
      ref={ref}
      id="experience"
      className="relative min-h-[82vh] lg:min-h-[90vh] flex items-end overflow-hidden border-y border-[rgba(197,164,109,0.14)]"
    >
      {/* ── Orqa fon rasmi — parallax ── */}
      <motion.div
        className="absolute inset-0 z-0 h-[125%] w-full top-[-12%]"
        style={{ y: yBg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nestone/balcony-34floor.jpg"
          alt="34-qavat balkonidan Toshkent manzarasi"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Chapdan qoraytirish — matn kontrasti */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,13,15,0.92) 0%, rgba(11,13,15,0.55) 42%, rgba(11,13,15,0.05) 78%)",
        }}
      />
      {/* Pastki grounding */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(0deg, #0B0D0F 0%, rgba(11,13,15,0.15) 32%, transparent 62%)",
        }}
      />

      {/* ── Matn ── */}
      <div className="relative z-20 w-full max-w-[1280px] mx-auto px-6 lg:px-24 pb-16 lg:pb-24 pt-28">
        <div className="max-w-[640px] space-y-6">

          {/* Badge */}
          <motion.div
            className="flex items-center gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ hidden: { opacity: 0, x: -30 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } } }}
          >
            <span className="h-px w-8 bg-[#C5A46D]" />
            <span className="text-[12px] md:text-[13px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">
              {t.experience.kicker}
            </span>
          </motion.div>

          {/* Sarlavha — kirish animatsiyasi + doimiy float */}
          <motion.h2
            className="font-heading text-[42px] md:text-[60px] lg:text-[76px] font-medium text-[#F5F2EB] leading-[1.02] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.span
              className="block"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              {t.experience.title}
            </motion.span>
          </motion.h2>

          {/* Tavsif matni */}
          <motion.p
            className="text-[16px] md:text-[19px] text-[#E4DFD4] leading-[1.65] max-w-[560px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { duration: 0.9, delay: 0.2, ease: "easeOut" as const } } }}
          >
            {t.experience.body}
          </motion.p>

          {/* CTA tugma */}
          <motion.div
            className="pt-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { duration: 0.9, delay: 0.35, ease: "easeOut" as const } } }}
          >
            <a href="#catalog">
              <Button className={`${btnPrimary} ${btnLg}`}>{t.experience.cta}</Button>
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
