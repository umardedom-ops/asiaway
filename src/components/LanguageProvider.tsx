"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { T, type Lang } from "@/lib/i18n";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof T)["uz"];
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");

  // localStorage'dan tiklash (client)
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("asiaway-lang")) as Lang | null;
    if (saved && (saved === "uz" || saved === "ru" || saved === "en")) {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("asiaway-lang", l);
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
