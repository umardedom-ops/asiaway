"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, MessageCircle, Send, X, Headphones } from "lucide-react";
import { CONTACTS } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

// lucide-react (bu versiyada) Instagram ikonkasi yo'q — inline SVG
function Instagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const f = t.floating;

  const items = [
    { label: f.call, href: `tel:${CONTACTS.phoneRaw}`, Icon: Phone, color: "#C5A46D" },
    { label: f.whatsapp, href: CONTACTS.whatsapp, Icon: MessageCircle, color: "#25D366" },
    { label: f.telegram, href: CONTACTS.telegram, Icon: Send, color: "#2AABEE" },
    { label: f.instagram, href: CONTACTS.instagram, Icon: Instagram, color: "#E1306C" },
  ];

  return (
    <div className="fixed right-4 md:right-6 bottom-4 md:bottom-6 z-[90] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end gap-2.5"
          >
            {items.map((it) => (
              <a
                key={it.label}
                href={it.href}
                target={it.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex items-center gap-3"
              >
                <span className="rounded-full bg-[#111417] border border-[rgba(197,164,109,0.22)] px-3 py-1.5 text-[13px] font-medium text-[#F5F2EB] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {it.label}
                </span>
                <span
                  className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  style={{ backgroundColor: it.color }}
                >
                  <it.Icon className="h-5 w-5 text-white" />
                </span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={f.label}
        className="h-14 w-14 rounded-full bg-[#C5A46D] text-[#0B0D0F] flex items-center justify-center shadow-xl shadow-[#C5A46D]/20 hover:bg-[#D4B77F] transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="h" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Headphones className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
