"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

/**
 * Yengil toast tizimi (tashqi dep yo'q) — native alert() o'rniga.
 * Istalgan client komponentda: `toast("Xabar", "error")`.
 * <Toaster /> dashboard layoutida bir marta mount qilinadi.
 */
type ToastType = "success" | "error";
interface ToastItem { id: number; message: string; type: ToastType }

export function toast(message: string, type: ToastType = "error") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("aw-toast", { detail: { message, type } }));
}

let nextId = 1;

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const item: ToastItem = {
        id: nextId++,
        message: String(detail.message || ""),
        type: detail.type === "success" ? "success" : "error",
      };
      setItems((prev) => [...prev.slice(-3), item]); // maksimum 4 ta
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, 5000);
    };
    window.addEventListener("aw-toast", onToast);
    return () => window.removeEventListener("aw-toast", onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-[360px]" role="status" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2.5 rounded-[10px] border p-3.5 pr-9 text-[13px] shadow-xl shadow-black/50 backdrop-blur-sm animate-in relative transition-all duration-300 ${
            t.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100"
              : "bg-red-950/90 border-red-500/30 text-red-100"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-snug">{t.message}</span>
          <button
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            className="absolute top-2.5 right-2.5 text-white/40 hover:text-white/90 transition-colors"
            aria-label="close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
