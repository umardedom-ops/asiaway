/**
 * Sana formatlash — `uz-UZ` locale'ni Intl.DateTimeFormat bilan ISHLATMAYMIZ.
 *
 * BUG: brauzer/Node ICU ma'lumotlarida "uz-UZ" uchun oy nomlari to'liq emas —
 * `new Date().toLocaleDateString("uz-UZ", { month: "short" })` "Iyul" o'rniga
 * "M07" kabi xom skelet qaytaradi (tekshirilgan: Chrome/V8). Shuning uchun
 * o'zbekcha oy nomlarini qo'lda saqlaymiz; rus/ingliz uchun Intl ishonchli ishlaydi.
 */

const UZ_MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const UZ_MONTHS_LONG = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const UZ_WEEKDAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

export type DashLang = "uz" | "ru" | "en";

interface FmtOpts {
  day?: "numeric" | "2-digit";
  month?: "short" | "long" | "numeric" | "2-digit";
  year?: "numeric";
  weekday?: "short";
  hour?: "2-digit";
  minute?: "2-digit";
}

/** `date.toLocaleDateString(lang, opts)` o'rnini bosadi — uz uchun qo'lda, ru/en uchun Intl. */
export function fmtDate(date: Date | string | null | undefined, lang: DashLang, opts: FmtOpts): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  if (lang !== "uz") {
    const locale = lang === "ru" ? "ru-RU" : "en-US";
    return d.toLocaleDateString(locale, opts);
  }

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();
  const monthIsWord = opts.month === "short" || opts.month === "long";

  const dateBits: string[] = [];
  if (opts.day) dateBits.push(opts.day === "2-digit" ? String(day).padStart(2, "0") : String(day));
  if (opts.month === "short") dateBits.push(UZ_MONTHS_SHORT[monthIdx]);
  else if (opts.month === "long") dateBits.push(UZ_MONTHS_LONG[monthIdx]);
  else if (opts.month === "2-digit") dateBits.push(String(monthIdx + 1).padStart(2, "0"));
  else if (opts.month === "numeric") dateBits.push(String(monthIdx + 1));
  if (opts.year) dateBits.push(String(year));

  // Oy so'z bo'lsa bo'shliq bilan ("25 Iyul 2026"), raqam bo'lsa nuqta bilan ("25.07.2026")
  let out = monthIsWord ? dateBits.join(" ") : dateBits.join(".");
  if (opts.weekday === "short") out = `${UZ_WEEKDAYS_SHORT[d.getDay()]}, ${out}`;
  if (opts.hour === "2-digit" && opts.minute === "2-digit") {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    out = `${out} ${hh}:${mm}`;
  }
  return out;
}
