"use client";

import { useEffect } from "react";

/** Service worker ro'yxatdan o'tkazish (PWA o'rnatiluvchanlik). UI chiqarmaydi. */
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* SW ishlamasa ham sayt normal ishlayveradi */
      });
    }
  }, []);
  return null;
}
