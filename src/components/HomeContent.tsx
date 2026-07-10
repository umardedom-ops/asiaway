"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApartmentCatalog from "@/components/ApartmentCatalog";
import SkylineBackdrop from "@/components/SkylineBackdrop";
import IntroSplash from "@/components/IntroSplash";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import FloatingContact from "@/components/FloatingContact";
import AirportService from "@/components/AirportService";
import BrandWordmark from "@/components/BrandWordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";
import { CONTACTS } from "@/lib/i18n";
import { ASSETS } from "@/lib/assets";
import { btnPrimary, btnGlass, btnLg, btnMd } from "@/lib/ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HomeContent({ apartments, phones, address }: { apartments: any[]; phones: readonly string[]; address: string }) {
  const { t } = useLang();
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
          <a href="#" aria-label="ASIA WAY" className="shrink-0">
            <BrandWordmark variant="header" />
          </a>

          <nav className="hidden lg:flex items-center gap-9 text-[14px] font-medium tracking-wide absolute left-1/2 -translate-x-1/2">
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

        <div className="relative z-20 max-w-[1440px] mx-auto px-6 lg:px-12 min-h-[100svh] flex flex-col justify-center pt-28 pb-24">
          <div className="max-w-[680px]">
            <BrandWordmark variant="hero" className="mb-9" />

            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-[#C5A46D]" />
              <span className="text-[12px] md:text-[13px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">
                {t.hero.badge}
              </span>
            </div>

            <h1 className="font-heading text-[clamp(44px,6.4vw,88px)] font-medium text-[#F5F2EB] leading-[0.98] tracking-[-0.02em]">
              {t.hero.titleTop} {t.hero.titleMid} <span className="text-[#C5A46D]">{t.hero.titleAccent}</span>
            </h1>

            <p className="text-[16px] md:text-[19px] text-[#D8D3C8] leading-[1.65] max-w-[540px] mt-7">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-10">
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

        {/* Scroll ishorasi — pastda markazda, nozik */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-[#A8A49B]">
          <span className="h-9 w-[22px] rounded-full border border-[rgba(197,164,109,0.4)] flex justify-center pt-1.5">
            <span className="h-1.5 w-1 rounded-full bg-[#C5A46D] animate-bounce" />
          </span>
        </div>
      </section>

      {/* AEROPORT XIZMATI — 2-bo'lim (hero'dan keyin) */}
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
      <section className="relative py-[80px] lg:py-[140px] px-6 lg:px-24 overflow-hidden" id="services">
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSETS}/nestone/interior-gym.webp`} alt="Services" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0B0D0F] via-[#111417]/90 to-[#0B0D0F]" />
        <div className="relative z-20 max-w-[1280px] mx-auto text-center space-y-16">
          <div className="space-y-6 max-w-3xl mx-auto">
            <span className="text-[12px] md:text-[14px] font-semibold text-[#A8A49B] tracking-[0.12em] uppercase block">{t.services.kicker}</span>
            <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[64px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight">{t.services.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[rgba(197,164,109,0.14)]">
            {t.services.items.map((service, idx) => (
              <div key={idx} className="bg-[#111417] p-8 lg:p-12 flex items-center justify-center text-center backdrop-blur-sm">
                <span className="text-[16px] lg:text-[18px] font-medium text-[#F5F2EB] leading-[1.4]">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="py-[80px] lg:py-[140px] px-6 lg:px-24 bg-[#0B0D0F]" id="catalog">
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

      {/* EXPERIENCE — kreativ vektor skyline fon */}
      <SkylineBackdrop>
        <section className="py-[90px] lg:py-[130px] px-6 lg:px-24 relative overflow-hidden flex items-center justify-center text-center border-y border-[rgba(197,164,109,0.14)]">
          <div className="relative z-20 max-w-[800px] mx-auto space-y-8">
            <h2 className="font-heading text-[40px] md:text-[56px] lg:text-[72px] font-medium text-[#F5F2EB] leading-[1.05] tracking-tight">{t.experience.title}</h2>
            <p className="text-[16px] md:text-[20px] text-[#A8A49B] leading-[1.6] font-light max-w-[600px] mx-auto">{t.experience.body}</p>
          </div>
        </section>
      </SkylineBackdrop>

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
              <div className="flex gap-4 pt-3 text-[14px] font-medium">
                <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">WhatsApp</a>
                <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">Telegram</a>
                <a href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">Instagram</a>
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
            <div className="flex gap-4 text-[14px] font-medium">
              <a href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer" className="text-[#F5F2EB] hover:text-[#C5A46D] transition-colors">Instagram</a>
              <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer" className="text-[#F5F2EB] hover:text-[#C5A46D] transition-colors">Telegram</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center text-[12px] text-[#A8A49B] pt-8 gap-3">
          <span>© {new Date().getFullYear()} ASIA WAY. {t.footer.rights}</span>
          <span>{t.footer.city}</span>
        </div>
      </footer>
    </div>
  );
}
