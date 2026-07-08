"use client";

import { LANGS } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-full border border-[rgba(197,164,109,0.28)] bg-[#111417]/60 backdrop-blur-sm p-0.5">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-colors ${
            lang === l.code
              ? "bg-[#C5A46D] text-[#0B0D0F]"
              : "text-[#A8A49B] hover:text-[#F5F2EB]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
