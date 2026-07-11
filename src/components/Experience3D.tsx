"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/LanguageProvider";
import { ASSETS } from "@/lib/assets";
import { btnPrimary, btnLg } from "@/lib/ui";

/* Rasmlar roʻyxati — Supabase Storage dan */
const IMGS = [
  { src: `${ASSETS}/nestone/balcony-34floor.jpg`,   delay: 0,    rotate: -4,  y: 0   },
  { src: `${ASSETS}/nestone/interior-corridor.webp`, delay: 0.15, rotate:  3,  y: 40  },
  { src: `${ASSETS}/nestone/interior-gym.webp`,      delay: 0.30, rotate: -2,  y: 80  },
];

/* ──────── FloatingCard ──────── */
function FloatingCard({
  src,
  delay,
  rotate,
  yOffset,
}: {
  src: string;
  delay: number;
  rotate: number;
  yOffset: number;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ top: yOffset, rotate }}
      initial={{ opacity: 0, y: 60, scale: 0.88 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      /* floating idle animation */
      animate={{
        y: [yOffset, yOffset - 14, yOffset],
        transition: { repeat: Infinity, duration: 4 + delay * 2, ease: "easeInOut" },
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
        className="rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.55)] border border-[rgba(197,164,109,0.18)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="AsiaWay interior"
          className="w-[220px] md:w-[260px] lg:w-[300px] aspect-[3/4] object-cover"
        />
        {/* Orqa tomondan glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(197,164,109,0.12)] to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}

/* ──────── Main Section ──────── */
export default function Experience3D() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18 } },
  };
  const item = {
    hidden: { opacity: 0, y: 40, rotateX: 14 },
    show:  { opacity: 1, y: 0,  rotateX: 0, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      ref={ref}
      id="experience"
      className="relative overflow-hidden bg-[#0B0D0F] py-[100px] lg:py-[140px] px-6 lg:px-12 border-y border-[rgba(197,164,109,0.14)]"
    >
      {/* ── Orqa fon rasmi — xira parallax ── */}
      <motion.div
        className="absolute inset-0 z-0 opacity-18 mix-blend-luminosity"
        style={{ y: yBg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSETS}/nestone/balcony-34floor.jpg`}
          alt=""
          aria-hidden
          className="w-full h-[120%] object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0B0D0F] via-[#0B0D0F]/85 to-[#0B0D0F]/30" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B0D0F] via-transparent to-[#0B0D0F]/60" />

      {/* ── Gold orb glow ── */}
      <div className="absolute right-[32%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#C5A46D]/5 blur-[120px] pointer-events-none z-0" />

      {/* ── Tarkib ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* CHAP: Matn */}
        <motion.div
          className="space-y-8"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          style={{ perspective: "1200px" }}
        >
          {/* Badge */}
          <motion.div variants={item} className="flex items-center gap-4">
            <span className="h-px w-10 bg-[#C5A46D] shadow-[0_0_10px_rgba(197,164,109,0.6)]" />
            <span className="text-[12px] md:text-[14px] font-semibold text-[#C5A46D] tracking-[0.22em] uppercase">
              {t.experience.kicker}
            </span>
          </motion.div>

          {/* Sarlavha */}
          <motion.h2
            variants={item}
            className="font-heading text-[48px] md:text-[68px] lg:text-[82px] font-medium text-[#F5F2EB] leading-[1.02] tracking-tight"
          >
            {t.experience.title}
          </motion.h2>

          {/* Tavsif */}
          <motion.p
            variants={item}
            className="text-[17px] md:text-[20px] text-[#C8C3B8] leading-[1.7] max-w-[520px] font-light"
          >
            {t.experience.body}
          </motion.p>

          {/* Statistika */}
          <motion.div variants={item} className="grid grid-cols-3 gap-6 pt-2">
            {[
              { val: "34", label: "Qavat" },
              { val: "9+", label: "Apartament" },
              { val: "24/7", label: "Xizmat" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <span className="block font-heading text-[36px] md:text-[44px] font-semibold text-[#C5A46D] leading-none">
                  {s.val}
                </span>
                <span className="block text-[13px] text-[#A8A49B] tracking-wide uppercase">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={item} className="pt-2">
            <a href="#catalog">
              <Button className={`${btnPrimary} ${btnLg} text-[15px] px-10 h-14 hover:scale-[1.04] transition-transform duration-300`}>
                {t.experience.cta}
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* O'NG: Floating rasmlar */}
        <div className="relative hidden lg:block h-[600px]">
          {IMGS.map((img, i) => (
            <FloatingCard
              key={i}
              src={img.src}
              delay={img.delay}
              rotate={img.rotate}
              yOffset={img.y}
            />
          ))}

          {/* Rasmlar orasidagi oltin chiziq */}
          <motion.div
            className="absolute left-[200px] top-[60px] w-px h-[400px] bg-gradient-to-b from-transparent via-[#C5A46D]/40 to-transparent"
            initial={{ scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
          />
        </div>
      </div>
    </section>
  );
}
