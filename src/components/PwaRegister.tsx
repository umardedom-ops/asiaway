"use client";

import { useEffect } from "react";

/**
 * Service worker ro'yxatdan o'tkazish (PWA o'rnatiluvchanlik) + AVTO-YANGILANISH.
 * Yangi versiya (deploy) chiqsa — eski SW o'rniga yangisini oladi va sahifani
 * bir marta yangilaydi (foydalanuvchi bayat kontentda qolmaydi). UI chiqarmaydi.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    let refreshing = false;
    // Yangi SW nazoratni olganда — sahifani bir marta yangilaymiz
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Yangi versiya topilsa — darrov faollashtiramiz
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              nw.postMessage?.({ type: "SKIP_WAITING" });
            }
          });
        });
        // Sahifa fokusga qaytganда yangilanish borligini tekshiramiz
        window.addEventListener("focus", () => reg.update().catch(() => {}));
      })
      .catch(() => {
        /* SW ishlamasa ham sayt normal ishlayveradi */
      });
  }, []);

  return null;
}
