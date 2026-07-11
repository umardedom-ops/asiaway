"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/LanguageProvider";
import { ASSETS } from "@/lib/assets";
import { btnPrimary, btnLg } from "@/lib/ui";

export default function Experience3D() {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax effect for the background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  
  // 3D Motion effect for text (fade up + tilt)
  const textVariants = {
    hidden: { opacity: 0, y: 50, rotateX: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section 
      ref={containerRef}
      id="experience" 
      className="relative min-h-[85vh] lg:min-h-[95vh] flex items-center overflow-hidden border-y border-[rgba(197,164,109,0.14)]"
      style={{ perspective: "1000px" }}
    >
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 h-[120%] w-full"
        style={{ y: yBg }}
      >
        <img
          src={`${ASSETS}/nestone/balcony-34floor.jpg`}
          alt="34-qavat balkonidan Toshkent manzarasi"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Overlays for readability and premium look */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0B0D0F]/95 via-[#0B0D0F]/70 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0D0F] via-transparent to-[#0B0D0F]/40" />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center">
        <motion.div 
          className="max-w-[720px] space-y-7"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <span className="h-px w-10 bg-[#C5A46D] shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
            <span className="text-[12px] md:text-[14px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">
              {t.experience.kicker}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2 
            variants={itemVariants}
            className="font-heading text-[48px] md:text-[72px] lg:text-[88px] font-medium text-[#F5F2EB] leading-[1.02] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            style={{ translateZ: "40px" }}
          >
            {t.experience.title}
          </motion.h2>

          {/* Body */}
          <motion.p 
            variants={itemVariants}
            className="text-[17px] md:text-[21px] text-[#E4DFD4] leading-[1.65] max-w-[600px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] font-light"
            style={{ translateZ: "20px" }}
          >
            {t.experience.body}
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants} className="pt-6" style={{ translateZ: "30px" }}>
            <a href="#catalog">
              <Button className={`${btnPrimary} ${btnLg} text-[15px] px-10 h-14 hover:scale-105 transition-transform duration-300`}>
                {t.experience.cta}
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
