"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  KeyRound,
  Clock,
  Sparkles,
  Car,
  Dumbbell,
  HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ApartmentCatalog from "@/components/ApartmentCatalog";
import IntroSplash from "@/components/IntroSplash";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import FloatingContact from "@/components/FloatingContact";
import AirportService from "@/components/AirportService";
import Experience3D from "@/components/Experience3D";
import LocationSection from "@/components/LocationSection";
import BrandWordmark from "@/components/BrandWordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";
import { CONTACTS } from "@/lib/i18n";
import { ASSETS } from "@/lib/assets";
import { btnPrimary, btnGlass, btnLg, btnMd } from "@/lib/ui";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.331a9.927 9.927 0 004.93 1.302h.004c5.507 0 9.99-4.478 9.99-9.985A9.998 9.998 0 0012.012 2zm5.836 14.199c-.24.675-1.199 1.282-1.65 1.332-.45.05-1.02.074-2.884-.66-2.38-.94-3.92-3.36-4.04-3.52-.12-.16-.97-1.29-.97-2.459 0-1.17.61-1.743.83-1.983.22-.24.47-.3.63-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.2.49.69 1.68.75 1.8.06.12.1.26.02.42-.08.17-.12.27-.24.41-.12.14-.26.31-.37.42-.12.12-.25.26-.11.5.14.24.63 1.04 1.35 1.68.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.61-.71.77-.96.16-.25.32-.21.54-.13.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.25z"/>
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.94-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const SERVICE_ICONS = [
  KeyRound,
  Clock,
  Sparkles,
  Car,
  Dumbbell,
  HeartHandshake,
];

const SERVICE_DETAILS: Record<
  "uz" | "ru" | "en",
  { desc: string; num: string }[]
> = {
  uz: [
    { desc: "Premium darajadagi apartamentlar va lyuks xonadonlar ijarasi", num: "01" },
    { desc: "Sizning har qanday savolingiz va muammongiz uchun doimiy ko'mak", num: "02" },
    { desc: "Mehmonxona darajasidagi mukammal va toza xizmat", num: "03" },
    { desc: "Aeroport va shahar bo'ylab qulay transport xizmati", num: "04" },
    { desc: "Nest One zamonaviy fitnes markaziga bepul kirish imkoniyati", num: "05" },
    { desc: "Tadbirlar, bron qilishlar va individual xizmatlar", num: "06" },
  ],
  ru: [
    { desc: "Аренда премиальных апартаментов и люкс квартир", num: "01" },
    { desc: "Круглосуточная поддержка по любым вопросам и поручениям", num: "02" },
    { desc: "Безупречная уборка гостиничного уровня", num: "03" },
    { desc: "Комфортабельные трансферы по городу и в аэропорт", num: "04" },
    { desc: "Доступ в современный фитнес-центр Nest One", num: "05" },
    { desc: "Организация мероприятий, броней и личных поручений", num: "06" },
  ],
  en: [
    { desc: "Rent of premium and luxury apartments", num: "01" },
    { desc: "Round-the-clock assistance for any requests and tasks", num: "02" },
    { desc: "Flawless hotel-level housekeeping and cleaning", num: "03" },
    { desc: "Comfortable airport and city transfer services", num: "04" },
    { desc: "Access to the modern Nest One fitness center", num: "05" },
    { desc: "Event organization, reservations, and personal tasks", num: "06" },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HomeContent({ apartments, phones, address }: { apartments: any[]; phones: readonly string[]; address: string }) {
  const { lang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F2EB] flex flex-col font-sans selection:bg-[#C5A46D]/30 selection:text-white">
      <IntroSplash />
      <FloatingContact />

      {/* HEADER — yupqa, shaffof; scroll'da yumshoq qorayadi (qattiq qora satr emas).
          Brend nomi faqat scroll'da chiqadi (hero'da logo emblemi bor). */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0B0D0F]/80 backdrop-blur-xl border-b border-[rgba(197,164,109,0.14)]"
            : "bg-gradient-to-b from-[#0B0D0F]/70 via-[#0B0D0F]/25 to-transparent border-b border-transparent"
        }`}
      >
        <div
          className={`max-w-[1440px] mx-auto flex items-center justify-between gap-4 px-6 lg:px-12 transition-all duration-500 ${
            scrolled ? "py-2.5" : "py-3.5"
          }`}
        >
          <a href="#" aria-label="AsiaWay" className="shrink-0">
            <BrandWordmark variant="header" />
          </a>

          <nav className="hidden lg:flex items-center justify-center flex-1 gap-6 xl:gap-9 text-[14px] font-medium tracking-wide mx-4">
            <a href="#about" className="text-[#F5F2EB]/85 hover:text-[#C5A46D] transition-colors">{t.nav.about}</a>
            <a href="#services" className="text-[#F5F2EB]/85 hover:text-[#C5A46D] transition-colors">{t.nav.services}</a>
            <a href="#catalog" className="text-[#F5F2EB]/85 hover:text-[#C5A46D] transition-colors">{t.nav.apartments}</a>
            <a href="#reviews" className="text-[#F5F2EB]/85 hover:text-[#C5A46D] transition-colors">{t.nav.reviews}</a>
            <a href="#faq" className="text-[#F5F2EB]/85 hover:text-[#C5A46D] transition-colors">{t.nav.faq}</a>
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <LanguageSwitcher />
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              className="h-10 w-10 rounded-full border border-[rgba(197,164,109,0.22)] flex items-center justify-center text-[#F5F2EB]/80 hover:text-[#C5A46D] hover:border-[#C5A46D] transition-colors"
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
            </Link>
            <a href="#catalog" className="hidden sm:block">
              <Button className={`${btnPrimary} ${btnMd}`}>
                {t.nav.book}
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO — kinematik, to'liq balandlik. Logo emblemi CHAPDA (o'rtacha), matn editorial chapga tekis. */}
      <section className="relative w-full overflow-hidden min-h-[100svh]">
        <div className="absolute inset-0 z-0 bg-center bg-cover" style={{ backgroundImage: `url("${ASSETS}/nestone/exterior-day-street.webp")` }} />
        {/* Chapdan qoraytirish — matn kontrasti; o'ngda bino ochiq qoladi */}
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(90deg, rgba(11,13,15,0.94) 0%, rgba(11,13,15,0.7) 34%, rgba(11,13,15,0.28) 68%, rgba(11,13,15,0.1) 100%)" }} />
        {/* Pastki grounding + keyingi seksiya bilan qo'shilish */}
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(0deg, #0B0D0F 0%, rgba(11,13,15,0.12) 40%, rgba(11,13,15,0.3) 100%)" }} />

        <div className="relative z-20 max-w-[1440px] mx-auto px-6 lg:px-12 min-h-[100svh] flex flex-col justify-center pt-20 pb-8 md:pb-12">
          <div className="max-w-[680px]">
            <BrandWordmark variant="hero" className="mb-4 md:mb-6" />

            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#C5A46D]" />
              <span className="text-[12px] md:text-[13px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">
                {t.hero.badge}
              </span>
            </div>

            <h1 className="font-heading text-[clamp(44px,6.4vw,88px)] font-medium text-[#F5F2EB] leading-[0.98] tracking-[-0.02em]">
              {t.hero.titleTop} {t.hero.titleMid} <span className="text-[#C5A46D]">{t.hero.titleAccent}</span>
            </h1>

            <p className="text-[16px] md:text-[19px] text-[#D8D3C8] leading-[1.65] max-w-[540px] mt-4 md:mt-5">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-8">
              <a href="#catalog" className="w-full sm:w-auto">
                <Button className={`w-full sm:w-auto ${btnPrimary} ${btnLg}`}>
                  {t.hero.ctaPrimary}
                </Button>
              </a>
              <a href="#contact" className="w-full sm:w-auto">
                <Button className={`w-full sm:w-auto ${btnGlass} ${btnLg}`}>
                  {t.hero.ctaContact}
                </Button>
              </a>
            </div>
          </div>
        </div>


      </section>

      {/* EXPERIENCE 3D — 2-bo'lim (hero'dan keyin) */}
      <Experience3D />

      {/* AEROPORT XIZMATI — 3-bo'lim */}
      <AirportService />

      {/* ABOUT */}
      <section className="py-[80px] lg:py-[140px] px-6 lg:px-24 bg-[#0B0D0F]" id="about">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-6">
            <span className="text-[12px] md:text-[14px] font-semibold text-[#A8A49B] tracking-[0.12em] uppercase block">{t.about.kicker}</span>
            <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[64px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight">{t.about.title}</h2>
            <p className="text-[16px] md:text-[18px] text-[#A8A49B] leading-[1.65] max-w-[500px]">{t.about.body}</p>
          </div>
          <div className="relative aspect-[4/5] md:aspect-square w-full rounded-xl overflow-hidden border border-[rgba(197,164,109,0.14)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSETS}/nestone/interior-corridor.webp`} alt="Interior" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="relative py-[85px] lg:py-[110px] px-6 lg:px-24 overflow-hidden bg-black" id="services">
        {/* Gym Background Image */}
        <div className="absolute inset-0 z-0 opacity-75">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nestone/interior-gym.jpg" alt="Nest One Gym" className="w-full h-full object-cover object-center" />
        </div>
        {/* Clean semi-transparent dark overlay for high visibility and contrast */}
        <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[0.5px]" />
        
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C5A46D]/5 blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C5A46D]/5 blur-[120px] pointer-events-none z-10" />

        <div className="relative z-20 max-w-[1340px] mx-auto space-y-12">
          <div className="space-y-4 max-w-3xl text-left">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#C5A46D]" />
              <span className="text-[11px] md:text-[12px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">{t.services.kicker}</span>
            </div>
            <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[60px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]" style={{ perspective: 1200 }}>
              <motion.span
                className="block origin-left"
                animate={{ 
                  y: [0, -8, 0],
                  rotateX: [0, 4, -4, 0],
                  rotateY: [0, -8, 8, 0],
                  z: [0, 15, 0]
                }}
                style={{ transformStyle: "preserve-3d" }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 6, 
                  ease: "easeInOut" 
                }}
              >
                {t.services.title}
              </motion.span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4" style={{ perspective: 1200 }}>
            {t.services.items.map((service, idx) => {
              const Icon = SERVICE_ICONS[idx] || Sparkles;
              const detail = (SERVICE_DETAILS[lang] || SERVICE_DETAILS["uz"])[idx];
              return (
                <motion.div
                  key={idx}
                  className="group relative bg-[#111417]/75 backdrop-blur-md p-5 lg:p-6 rounded-xl border border-[rgba(197,164,109,0.12)] hover:border-[#C5A46D]/60 transition-all duration-500 flex flex-col justify-between min-h-[160px] lg:min-h-[200px] hover:shadow-[0_15px_30px_rgba(197,164,109,0.06)] cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{ 
                    y: -5,
                    rotateX: 3,
                    rotateY: -3,
                    scale: 1.01,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                >
                  {/* Subtle Background Card Glow */}
                  <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-[#C5A46D]/5 blur-xl group-hover:bg-[#C5A46D]/8 transition-all duration-500" />
                  
                  <div className="flex items-start justify-between" style={{ transform: "translateZ(15px)" }}>
                    <div className="p-2.5 rounded-lg bg-[#1A1D20] border border-[rgba(197,164,109,0.15)] group-hover:border-[#C5A46D]/50 group-hover:text-[#0B0D0F] group-hover:bg-[#C5A46D] text-[#C5A46D] transition-all duration-500">
                      <Icon className="h-4.5 w-4.5 stroke-[1.5]" />
                    </div>
                    <span className="text-[11px] font-heading font-medium text-[#A8A49B]/30 tracking-widest group-hover:text-[#C5A46D] transition-colors duration-500">
                      {detail?.num || `0${idx + 1}`}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-3" style={{ transform: "translateZ(25px)" }}>
                    <h3 className="text-[13px] lg:text-[14px] font-medium text-[#F5F2EB] group-hover:text-[#C5A46D] transition-colors duration-500 leading-snug">
                      {service}
                    </h3>
                    <p className="text-[10px] lg:text-[11px] text-[#A8A49B]/95 leading-relaxed font-light line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                      {detail?.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* JOYLASHUV VA INFRATUZILMA — xarita + yaqin joylar (katalogdan oldin) */}
      <LocationSection />

      {/* CATALOG */}
      <section className="pt-8 pb-[80px] lg:pb-[140px] px-6 lg:px-24 bg-[#0B0D0F]" id="catalog">
        <div className="max-w-[1280px] mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-6">
              <span className="text-[12px] md:text-[14px] font-semibold text-[#C5A46D] tracking-[0.12em] uppercase block">{t.catalog.kicker}</span>
              <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[64px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight">{t.catalog.title}</h2>
            </div>
            <div className="text-[13px] text-[#A8A49B]">{t.catalog.total(apartments.length)}</div>
          </div>
          <ApartmentCatalog initialApartments={apartments} />
        </div>
      </section>

      {/* MIJOZLAR FIKRI */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* ALOQAGA CHIQISH — forma */}
      <section className="py-[80px] lg:py-[140px] px-6 lg:px-24 bg-[#0B0D0F]" id="contact">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <div className="space-y-6">
            <span className="text-[12px] md:text-[14px] font-semibold text-[#C5A46D] tracking-[0.12em] uppercase block">{t.contact.kicker}</span>
            <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[56px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight">{t.contact.title}</h2>
            <p className="text-[16px] md:text-[18px] text-[#A8A49B] leading-[1.65] max-w-[440px]">{t.contact.body}</p>
            <div className="space-y-3 pt-4">
              {phones.map((p) => (
                <a key={p} href={`tel:${p}`} className="block text-[18px] text-[#F5F2EB] hover:text-[#C5A46D] transition-colors font-medium">{p}</a>
              ))}
              <div className="flex flex-wrap gap-2.5 pt-4">
                <a 
                  href={CONTACTS.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[rgba(197,164,109,0.12)] bg-[#111417] text-[#A8A49B] hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-all duration-300 text-[13px] font-medium"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
                <a 
                  href={CONTACTS.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[rgba(197,164,109,0.12)] bg-[#111417] text-[#A8A49B] hover:text-[#2AABEE] hover:border-[#2AABEE]/40 hover:bg-[#2AABEE]/5 transition-all duration-300 text-[13px] font-medium"
                >
                  <TelegramIcon className="h-4 w-4" />
                  <span>{lang === "uz" ? "Telegram (Lichka)" : lang === "ru" ? "Telegram (Личка)" : "Telegram (Chat)"}</span>
                </a>
                <a 
                  href={CONTACTS.telegramChannel} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[rgba(197,164,109,0.12)] bg-[#111417] text-[#A8A49B] hover:text-[#2AABEE] hover:border-[#2AABEE]/40 hover:bg-[#2AABEE]/5 transition-all duration-300 text-[13px] font-medium"
                >
                  <TelegramIcon className="h-4 w-4" />
                  <span>{lang === "uz" ? "Telegram (Kanal)" : lang === "ru" ? "Telegram (Канал)" : "Telegram (Channel)"}</span>
                </a>
                <a 
                  href={CONTACTS.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[rgba(197,164,109,0.12)] bg-[#111417] text-[#A8A49B] hover:text-[#E1306C] hover:border-[#E1306C]/40 hover:bg-[#E1306C]/5 transition-all duration-300 text-[13px] font-medium"
                >
                  <InstagramIcon className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[rgba(197,164,109,0.14)] bg-[#111417] p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B0D0F] pt-[70px] lg:pt-[100px] pb-10 px-6 lg:px-24 border-t border-[rgba(197,164,109,0.14)]">
        <div className="max-w-[1280px] mx-auto grid gap-14 lg:gap-8 md:grid-cols-2 lg:grid-cols-4 pb-[60px] border-b border-[rgba(197,164,109,0.14)]">
          <div className="space-y-6 lg:col-span-2">
            <BrandWordmark variant="footer" />
            <p className="text-[16px] text-[#A8A49B] leading-[1.65] max-w-[400px]">{t.footer.body}</p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[12px] font-semibold text-[#A8A49B] tracking-[0.12em] uppercase">{t.footer.links}</h4>
            <ul className="space-y-4 text-[15px] text-[#F5F2EB]">
              <li><a href="#about" className="hover:text-[#C5A46D] transition-colors">{t.nav.about}</a></li>
              <li><a href="#catalog" className="hover:text-[#C5A46D] transition-colors">{t.nav.apartments}</a></li>
              <li><a href="#faq" className="hover:text-[#C5A46D] transition-colors">{t.nav.faq}</a></li>
              <li><Link href="/dashboard" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">Admin</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[12px] font-semibold text-[#A8A49B] tracking-[0.12em] uppercase">{t.footer.addressLabel}</h4>
            <p className="text-[15px] text-[#A8A49B] leading-relaxed">{address}</p>
            <div className="flex flex-col gap-3.5 pt-2">
              <a 
                href={CONTACTS.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-[14px] text-[#A8A49B] hover:text-[#E1306C] transition-colors group font-medium"
              >
                <InstagramIcon className="h-4.5 w-4.5 text-[#A8A49B] group-hover:text-[#E1306C] transition-colors" />
                <span>Instagram</span>
              </a>
              <a 
                href={CONTACTS.telegram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-[14px] text-[#A8A49B] hover:text-[#2AABEE] transition-colors group font-medium"
              >
                <TelegramIcon className="h-4.5 w-4.5 text-[#A8A49B] group-hover:text-[#2AABEE] transition-colors" />
                <span>{lang === "uz" ? "Telegram (Lichka)" : lang === "ru" ? "Telegram (Личка)" : "Telegram (Chat)"}</span>
              </a>
              <a 
                href={CONTACTS.telegramChannel} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-[14px] text-[#A8A49B] hover:text-[#2AABEE] transition-colors group font-medium"
              >
                <TelegramIcon className="h-4.5 w-4.5 text-[#A8A49B] group-hover:text-[#2AABEE] transition-colors" />
                <span>{lang === "uz" ? "Telegram (Kanal)" : lang === "ru" ? "Telegram (Канал)" : "Telegram (Channel)"}</span>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center text-[12px] text-[#A8A49B] pt-8 gap-3">
          <span>© {new Date().getFullYear()} AsiaWay. {t.footer.rights}</span>
          <span>{t.footer.city}</span>
        </div>
      </footer>
    </div>
  );
}
