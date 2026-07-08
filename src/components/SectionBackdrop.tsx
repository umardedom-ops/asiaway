"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Har qanday seksiya uchun parallax fon — Nest One binoning haqiqiy suratlari.
 * Scroll qilganda fon sekinroq harakatlanadi (parallax "depth" hissi),
 * premium/luxury tuyg'u uchun. Har seksiyada boshqa surat berish mumkin —
 * bir xillikdan qochish uchun.
 */
export default function SectionBackdrop({
  image,
  overlay = 0.55,
  children,
}: {
  image: string;
  overlay?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [overlay * 0.75, overlay, overlay * 0.75]
  );

  return (
    <div ref={ref} className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div style={{ y }} className="absolute inset-0 scale-[1.15]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Nest One — Tashkent City" className="h-full w-full object-cover" />
        </motion.div>
        <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-[#04060d]" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#04060d] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#04060d] to-transparent" />
      </div>
      {children}
    </div>
  );
}
