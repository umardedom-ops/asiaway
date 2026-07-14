"use client";

import { useLang } from "@/components/LanguageProvider";
import { useEffect, useState } from "react";

/** Dashboard uchun ixcham til almashtirgich — UZ / RU bayroqlari bilan */
export default function DashboardLangSwitcher() {
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    { code: "uz" as const, flag: "🇺🇿", label: "UZ" },
    { code: "ru" as const, flag: "🇷🇺", label: "RU" },
  ];

  if (!mounted) {
    return (
      <div className="inline-flex items-center rounded-full border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F]/60 p-0.5 h-8 w-[110px] animate-pulse">
        {/* Placeholder before hydration */}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F]/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          aria-pressed={lang === o.code}
          className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wider transition-colors ${
            lang === o.code
              ? "bg-[#C5A46D] text-[#0B0D0F]"
              : "text-[#A8A49B] hover:text-[#F5F2EB]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
