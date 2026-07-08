// Champagne tugma stillari — butun sayt bo'ylab izchil (radius, hover, fokus).
// Asosiy (primary) = to'ldirilgan #C5A46D / qora matn; hover #D4B77F.
// Ikkilamchi (secondary) = champagne chegara, shaffof fon; hover'da champagne'ga to'ladi.
// Har ikkisida klaviatura fokusi ko'rinadigan champagne halqa (a11y).

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D0F]";

export const btnBase =
  `inline-flex items-center justify-center font-semibold tracking-wide rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none ${focusRing}`;

export const btnPrimary =
  `${btnBase} bg-[#C5A46D] text-[#0B0D0F] hover:bg-[#D4B77F]`;

export const btnSecondary =
  `${btnBase} border border-[rgba(197,164,109,0.4)] bg-transparent text-[#F5F2EB] hover:bg-[#C5A46D] hover:text-[#0B0D0F] hover:border-[#C5A46D]`;

// Shaffof foto ustidagi ikkilamchi (hero) — shishasimon, lekin bir xil radius/fokus.
export const btnGlass =
  `${btnBase} border border-[rgba(197,164,109,0.35)] bg-white/5 backdrop-blur-sm text-[#F5F2EB] hover:bg-[#C5A46D] hover:text-[#0B0D0F] hover:border-[#C5A46D]`;

// O'lchamlar — balandlik + gorizontal padding + matn o'lchami izchil.
export const btnLg = "h-14 px-10 text-[15px]";
export const btnMd = "h-11 px-6 text-[14px]";
