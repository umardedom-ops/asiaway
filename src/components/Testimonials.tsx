"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLang } from "./LanguageProvider";

export default function Testimonials() {
  const { t } = useLang();
  const r = t.reviews;

  return (
    <section className="py-[80px] lg:py-[130px] px-6 lg:px-24 bg-[#0B0D0F]" id="reviews">
      <div className="max-w-[1280px] mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[12px] md:text-[14px] font-semibold text-[#C5A46D] tracking-[0.12em] uppercase block">
            {r.kicker}
          </span>
          <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[56px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight">
            {r.title}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {r.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-[rgba(197,164,109,0.14)] bg-[#111417] p-8 flex flex-col gap-5"
            >
              <div className="flex gap-1 text-[#C5A46D]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-[#C5A46D]" />
                ))}
              </div>
              <p className="text-[15px] md:text-[16px] text-[#F5F2EB]/85 leading-relaxed flex-1">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[rgba(197,164,109,0.1)]">
                <div className="h-10 w-10 rounded-full bg-[#C5A46D]/15 text-[#C5A46D] flex items-center justify-center font-heading font-semibold">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#F5F2EB]">{item.name}</div>
                  <div className="text-[13px] text-[#A8A49B]">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
