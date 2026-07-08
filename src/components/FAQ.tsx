"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useLang } from "./LanguageProvider";

export default function FAQ() {
  const { t } = useLang();
  const f = t.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-[80px] lg:py-[130px] px-6 lg:px-24 bg-[#0B0D0F]" id="faq">
      <div className="max-w-[900px] mx-auto space-y-14">
        <div className="text-center space-y-4">
          <span className="text-[12px] md:text-[14px] font-semibold text-[#C5A46D] tracking-[0.12em] uppercase block">
            {f.kicker}
          </span>
          <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[56px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight">
            {f.title}
          </h2>
        </div>

        <div className="divide-y divide-[rgba(197,164,109,0.14)] border-y border-[rgba(197,164,109,0.14)]">
          {f.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className={`text-[17px] md:text-[20px] font-medium transition-colors ${isOpen ? "text-[#C5A46D]" : "text-[#F5F2EB] group-hover:text-[#C5A46D]"}`}>
                    {item.q}
                  </span>
                  <span className={`shrink-0 text-[#C5A46D] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                    <Plus className="h-5 w-5" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-[15px] md:text-[16px] text-[#A8A49B] leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
