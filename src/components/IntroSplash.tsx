"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import BrandWordmark from "@/components/BrandWordmark";

/**
 * Saytga kirishda ko'rsatiladigan intro/splash ekran — Nest One binoning
 * haqiqiy surati fonda, markazda ASIA WAY logotipi paydo bo'ladi, so'ng
 * butun ekran silliq fade bilan asosiy saytga o'tadi.
 */
export default function IntroSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Sahifa scroll qilinmasin intro davomida
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0B0D0F]"
        >
          {/* Nest One fon surati */}
          <motion.div
            initial={{ scale: 1.15 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${ASSETS}/nestone/exterior-entrance.webp`}
              alt="Nest One — Tashkent City"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[#0B0D0F]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-transparent to-[#0B0D0F]/60" />

          {/* ASIA WAY logotipi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center gap-6"
          >
            <BrandWordmark variant="intro" className="items-center text-center" />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-[11px] tracking-[0.35em] text-[#A8A49B] uppercase"
            >
              Nest One · Tashkent City
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
