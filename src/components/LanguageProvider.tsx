"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { T, type Lang } from "@/lib/i18n";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof T)["uz"];
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children, initialLang = "uz" }: { children: React.ReactNode, initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // localStorage'dan tiklash (client) - lekin cookie dan kelgan initialLang ustunroq
  useEffect(() => {
    // Agar initialLang cookie orqali kelgan bo'lsa, o'shani o'rnatamiz
    // yoki localstorage ni o'qiymiz
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("asiaway-lang", l);
      document.cookie = `asiaway-lang=${l}; path=/; max-age=31536000`; // 1 yil
      document.documentElement.lang = l;
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
