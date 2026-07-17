"use client";

import { useEffect } from "react";

/**
 * Ko'rinmas marketing-attribution komponenti (UI chiqarmaydi).
 * URL'dagi utm_* va fbclid parametrlarini 90 kunlik `aw_utm` cookie'ga yozadi —
 * keyin lead/bron yaratilganda server tomonda o'qiladi (source + utm_data)
 * va Meta CAPI'ga fbc/fbp sifatida yuboriladi.
 */
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
const MAX_AGE = 60 * 60 * 24 * 90; // 90 kun

export default function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const found: Record<string, string> = {};
      for (const k of KEYS) {
        const v = params.get(k);
        if (v) found[k] = v.slice(0, 256);
      }
      if (Object.keys(found).length === 0) return;

      let prev: Record<string, string> = {};
      const m = document.cookie.match(/(?:^|; )aw_utm=([^;]*)/);
      if (m) {
        try { prev = JSON.parse(decodeURIComponent(m[1])); } catch { /* buzuq cookie — e'tiborsiz */ }
      }
      const merged = { ...prev, ...found, landed_at: prev.landed_at || new Date().toISOString() };
      document.cookie = `aw_utm=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;

      // Meta _fbc: fbclid bor-u _fbc yo'q bo'lsa — standart formatda o'zimiz yozamiz
      if (found.fbclid && !/(?:^|; )_fbc=/.test(document.cookie)) {
        document.cookie = `_fbc=fb.1.${Date.now()}.${found.fbclid}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
      }
    } catch { /* attribution hech qachon sahifani buzmasin */ }
  }, []);

  return null;
}
