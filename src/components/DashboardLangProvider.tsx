"use client";

import { D, type DashboardDict } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";
import { createContext, useContext } from "react";

const Ctx = createContext<DashboardDict>(D.uz);

/** Wraps children and provides `useDashLang()` hook */
export function DashboardLangProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  return <Ctx.Provider value={D[lang]}>{children}</Ctx.Provider>;
}

/** Hook to get the current dashboard translation dictionary */
export function useDashLang() {
  return useContext(Ctx);
}
