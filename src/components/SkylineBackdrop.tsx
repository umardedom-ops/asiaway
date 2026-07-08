"use client";

import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ============================================================
   SKYLINE BACKDROP — brend "signature": tunda yorug' oynali
   Nest One skyline. Foto emas — to'liq vektor (SVG), shuning
   uchun har qanday o'lchamda mutlaqo aniq. Scroll parallax bilan.

   MUHIM: barcha "tasodifiy" qiymatlar seeded PRNG'dan olinadi —
   server va client bir xil natija chiqaradi (hydration xatosisiz).
   ============================================================ */

// Deterministik pseudo-random (server/client bir xil)
function rng(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// rng natijasi Node (SSR) va V8 (brauzer) da oxirgi bitda farq qiladi;
// to'g'ridan-to'g'ri atributga bersak hydration mismatch beradi. Yaxlitlaymiz.
function r3(n: number) {
  return Math.round(n * 1000) / 1000;
}

// Champagne palette (yorug' oynalar uchun — porloq variantlar)
const WARM = ["#E5CE9E", "#F0DDB4", "#D4B77F", "#FFE9C2"];

interface TowerSpec {
  x: number; // chap chekka
  w: number; // kenglik
  h: number; // balandlik (pastdan)
  seed: number;
  spire?: boolean; // Nest One markaziy minora
  litRatio?: number; // yoqilgan oynalar ulushi
}

function Tower({ spec, baseY }: { spec: TowerSpec; baseY: number }) {
  const { x, w, h, seed, spire, litRatio = 0.35 } = spec;
  const top = baseY - h;

  // Oynalar to'ri
  const cols = Math.max(3, Math.floor(w / 14));
  const rows = Math.max(6, Math.floor(h / 16));
  const cellW = w / cols;
  const cellH = h / rows;

  const windows = useMemo(() => {
    const out: { wx: number; wy: number; color: string; on: boolean; opacity: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = seed * 1000 + r * cols + c;
        const on = rng(s) < litRatio;
        out.push({
          wx: r3(x + c * cellW + cellW * 0.22),
          wy: r3(top + r * cellH + cellH * 0.22),
          color: WARM[Math.floor(rng(s + 7) * WARM.length)],
          on,
          opacity: on ? r3(0.85 + rng(s + 13) * 0.15) : 0.04,
        });
      }
    }
    return out;
  }, [x, top, cols, rows, cellW, cellH, seed, litRatio]);

  return (
    <g>
      {/* Korpus */}
      <rect x={x} y={top} width={w} height={h} fill="url(#towerGrad)" stroke="rgba(197,164,109,0.4)" strokeWidth="1" />
      {/* Oynalar */}
      {windows.map((win, i) => (
        <rect
          key={i}
          x={win.wx}
          y={win.wy}
          width={r3(cellW * 0.62)}
          height={r3(cellH * 0.62)}
          fill={win.on ? win.color : "#2a313c"}
          opacity={win.opacity}
        />
      ))}
      {/* Nest One toj + mayoq */}
      {spire && (
        <>
          <polygon
            points={`${x + w / 2 - 10},${top} ${x + w / 2 + 10},${top} ${x + w / 2},${top - 46}`}
            fill="#191e26"
            stroke="rgba(197,164,109,0.28)"
            strokeWidth="1"
          />
          <line
            x1={x + w / 2} y1={top - 46}
            x2={x + w / 2} y2={top - 78}
            stroke="rgba(197,164,109,0.35)" strokeWidth="2"
          />
          <circle cx={x + w / 2} cy={top - 80} r="3.5" fill="#C5A46D">
            <animate attributeName="opacity" values="1;0.25;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          {/* Mayoq atrofidagi porlash */}
          <circle cx={x + w / 2} cy={top - 80} r="12" fill="url(#beaconGlow)" opacity="0.8" />
        </>
      )}
    </g>
  );
}

export default function SkylineBackdrop({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax: orqa qator sekin, old qator tezroq siljiydi (chuqurlik hissi)
  const backY = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const frontY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  // Yulduzlar — deterministik joylashuv
  // Yulduzlar faqat ko'rinadigan zona ustki qismida (viewBox y 260..520 orasi)
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        x: r3(rng(i * 3.1) * 1440),
        y: r3(270 + rng(i * 5.7) * 250),
        r: r3(0.6 + rng(i * 9.3) * 1.1),
        o: r3(0.25 + rng(i * 11.9) * 0.6),
      })),
    []
  );

  // Skyline kompozitsiyasi: markazda Nest One (spire), atrofida past minoralar
  const BASE = 900; // zamin chizig'i (viewBox koordinatasida)
  const backTowers: TowerSpec[] = [
    { x: -40, w: 150, h: 300, seed: 11, litRatio: 0.16 },
    { x: 130, w: 120, h: 380, seed: 12, litRatio: 0.14 },
    { x: 300, w: 140, h: 260, seed: 13, litRatio: 0.15 },
    { x: 520, w: 130, h: 350, seed: 14, litRatio: 0.13 },
    { x: 780, w: 150, h: 300, seed: 15, litRatio: 0.15 },
    { x: 980, w: 120, h: 400, seed: 16, litRatio: 0.14 },
    { x: 1160, w: 150, h: 280, seed: 17, litRatio: 0.16 },
    { x: 1340, w: 140, h: 340, seed: 18, litRatio: 0.14 },
  ];
  const frontTowers: TowerSpec[] = [
    { x: 60, w: 170, h: 460, seed: 21, litRatio: 0.3 },
    { x: 330, w: 150, h: 540, seed: 22, litRatio: 0.32 },
    // NEST ONE — markaziy qahramon
    { x: 620, w: 190, h: 720, seed: 23, spire: true, litRatio: 0.42 },
    { x: 900, w: 160, h: 500, seed: 24, litRatio: 0.3 },
    { x: 1150, w: 170, h: 580, seed: 25, litRatio: 0.32 },
  ];

  return (
    <div ref={ref} className="relative overflow-hidden bg-[#0B0D0F]">
      {/* MUHIM: backdrop z-0 bo'lishi kerak — "-z-10" opaque root foni ortida
          qolib skyline'ni butunlay yashiradi (manfiy z-index + opaque parent bg). */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 260 1440 640"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            {/* Tungi osmon gradienti — champagne redizayn: #0B0D0F → #14171B */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B0D0F" />
              <stop offset="55%" stopColor="#101317" />
              <stop offset="100%" stopColor="#14171B" />
            </linearGradient>
            {/* Minora korpusi — tepasi yorug'roq (osmondan aniq ajralib turadi) */}
            <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c333f" />
              <stop offset="100%" stopColor="#171c24" />
            </linearGradient>
            {/* Ufqdagi iliq shahar nuri (champagne) */}
            <radialGradient id="cityGlow" cx="50%" cy="98%" r="70%">
              <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.32" />
              <stop offset="40%" stopColor="#C5A46D" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#C5A46D" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C5A46D" stopOpacity="0" />
            </radialGradient>
            {/* Bloom — yorug' oynalar porlashi (premium tungi effekt) */}
            <filter id="bloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1440" height="900" fill="url(#skyGrad)" />

          {/* Yulduzlar */}
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e8eefc" opacity={s.o} />
          ))}

          {/* Ufq nuri */}
          <rect width="1440" height="900" fill="url(#cityGlow)" />

          {/* Orqa qator — xira, uzoqdagi binolar */}
          <motion.g style={{ y: backY }} opacity="0.45">
            {backTowers.map((t, i) => (
              <Tower key={i} spec={t} baseY={BASE + 40} />
            ))}
          </motion.g>

          {/* Old qator — Nest One markazda, bloom bilan */}
          <motion.g style={{ y: frontY }} filter="url(#bloom)">
            {frontTowers.map((t, i) => (
              <Tower key={i} spec={t} baseY={BASE + 80} />
            ))}
          </motion.g>
        </svg>

        {/* Kontent o'qilishi uchun yumshoq qoraytirish + ingichka chegara gradientlari */}
        <div className="absolute inset-0 bg-[#0B0D0F]/15" />
        {/* Markazda radial qoraytirish — matn kontrasti (skyline chekkalari ochiq qoladi) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(11,13,15,0.78) 0%, rgba(11,13,15,0.4) 45%, transparent 78%)",
          }}
        />
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#0B0D0F] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#0B0D0F] to-transparent" />
      </div>
      {/* Kontent skyline ustida (z-10) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
