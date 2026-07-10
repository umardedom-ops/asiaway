/**
 * ASIA WAY — tipografik wordmark (og'ir 3D rasm-logo o'rniga).
 * Cormorant Garamond "ASIA WAY" + tracked "APARTMENTS" (champagne) — nafis,
 * mavzuga mos, baked soyasiz. Har joyda izchil ishlatiladi.
 */

type Variant = "header" | "hero" | "footer" | "intro";

// tracking past — "ASIA WAY" yagona uyg'un logotype bo'lib o'qiladi (harflar juda cho'zilmaydi).
// Sub "APARTMENTS" kengligi main bilan mos kelishi uchun tracking o'lchamга moslangan.
const STYLES: Record<Variant, { main: string; sub: string }> = {
  header: { main: "text-[19px] md:text-[22px] tracking-[0.06em]", sub: "" },
  hero: { main: "text-[30px] md:text-[40px] tracking-[0.04em]", sub: "text-[10px] md:text-[11px] tracking-[0.36em] mt-2" },
  footer: { main: "text-[26px] tracking-[0.05em]", sub: "text-[10px] tracking-[0.34em] mt-1.5" },
  intro: { main: "text-[42px] md:text-[58px] tracking-[0.05em]", sub: "text-[11px] md:text-[13px] tracking-[0.42em] mt-3" },
};

export default function BrandWordmark({
  variant = "hero",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const s = STYLES[variant];
  return (
    <span className={`inline-flex flex-col ${className}`} aria-label="ASIA WAY Apartments">
      <span className={`font-heading font-semibold leading-none text-[#F5F2EB] ${s.main}`}>
        ASIA WAY
      </span>
      {s.sub && (
        <span className={`font-sans font-medium uppercase leading-none text-[#C5A46D] ${s.sub}`}>
          Apartments
        </span>
      )}
    </span>
  );
}
