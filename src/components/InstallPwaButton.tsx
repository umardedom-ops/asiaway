"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

/**
 * "Ilovani o'rnatish" tugmasi (login sahifasida).
 * Chrome/Edge beforeinstallprompt eventini ushlab, bosilganda Windows/Android
 * o'zining o'rnatish oynasini chiqaradi. O'rnatib bo'lingan yoki brauzer
 * qo'llamasa (iOS Safari) — tugma ko'rinmaydi, iOS'da hint chiqadi.
 */

// Eventni imkon qadar ERTA ushlaymiz (React hydration'dan oldin ham otilishi mumkin)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedPrompt: any = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    capturedPrompt = e;
    window.dispatchEvent(new Event("aw-install-ready"));
  });
}

export default function InstallPwaButton() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (capturedPrompt) setReady(true);
    const onReady = () => setReady(true);
    const onInstalled = () => { setInstalled(true); setReady(false); };
    window.addEventListener("aw-install-ready", onReady);
    window.addEventListener("appinstalled", onInstalled);

    // Allaqachon ilova sifatida ochilgan bo'lsa — ko'rsatmaymiz
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    // iOS Safari — beforeinstallprompt yo'q, qo'lda qo'shiladi
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setIsIos(true);

    return () => {
      window.removeEventListener("aw-install-ready", onReady);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  if (ready) {
    return (
      <button
        type="button"
        onClick={async () => {
          if (!capturedPrompt) return;
          capturedPrompt.prompt();
          try { await capturedPrompt.userChoice; } catch { /* bekor qilindi */ }
          capturedPrompt = null;
          setReady(false);
        }}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-[8px] border border-[rgba(197,164,109,0.35)] bg-[#C5A46D]/10 text-[#C5A46D] hover:bg-[#C5A46D] hover:text-[#0B0D0F] text-[13.5px] font-semibold tracking-wide transition-all duration-200 active:scale-[0.98]"
      >
        <Download className="h-4 w-4" />
        Ilovani o&apos;rnatish (kompyuter/telefon)
      </button>
    );
  }

  if (isIos) {
    return (
      <p className="text-center text-[12px] text-[#A8A49B] font-light">
        iPhone: Safari&apos;da <span className="text-[#C5A46D]">Ulashish → &quot;Bosh ekranga qo&apos;shish&quot;</span> — ilova o&apos;rnatiladi
      </p>
    );
  }

  return null;
}
