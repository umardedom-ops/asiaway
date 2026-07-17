// Bron kanallari — sayt, Airbnb, Booking.com, Instagram, WhatsApp, Telegram, qo'lда
export const CHANNEL_LABELS: Record<string, string> = {
  direct: "To'g'ridan-to'g'ri",
  airbnb: "Airbnb",
  booking: "Booking.com",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  other: "Boshqa",
};

/**
 * Lead manbasi (CRM source) → bron kanali.
 * Lead'dan bron yaratilganda kanal avtomatik shu jadval bo'yicha tanlanadi —
 * avval hamma lead'lar "airbnb" bo'lib ketayotgan edi (ma'lumot yo'qolishi).
 */
export function sourceToChannel(source?: string | null): string {
  const s = (source || "").toLowerCase();
  if (["instagram", "telegram", "whatsapp", "airbnb", "booking"].includes(s)) return s;
  if (["sayt", "telefon", "kelib", "direct"].includes(s)) return "direct";
  if (!s) return "direct";
  return "other";
}

export const CHANNEL_STYLE: Record<string, string> = {
  direct: "bg-[#C5A46D]/10 text-[#C5A46D] border-[#C5A46D]/25",
  airbnb: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  booking: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  instagram: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  whatsapp: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  telegram: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  other: "bg-[#A8A49B]/10 text-[#A8A49B] border-[#A8A49B]/20",
};
