"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApartmentCatalog from "@/components/ApartmentCatalog";
import NestOneShowcase from "@/components/NestOneShowcase";
import SkylineBackdrop from "@/components/SkylineBackdrop";
import IntroSplash from "@/components/IntroSplash";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import FloatingContact from "@/components/FloatingContact";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";
import { CONTACTS } from "@/lib/i18n";
import { ASSETS } from "@/lib/assets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HomeContent({ apartments, phones, address }: { apartments: any[]; phones: readonly string[]; address: string }) {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F2EB] flex flex-col font-sans selection:bg-[#C5A46D]/30 selection:text-white">
      <IntroSplash />
      <FloatingContact />

      {/* HEADER NAVBAR — logo hero'ga ko'chdi; bu yerda nav + dashboard ikonka + til */}
      <header className="sticky top-0 z-50 bg-[#0B0D0F]/92 backdrop-blur-md border-b border-[rgba(197,164,109,0.1)] px-6 lg:px-12 py-4 lg:py-5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <nav className="hidden lg:flex items-center space-x-10 text-[15px] font-medium tracking-wide">
            <a href="#about" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">{t.nav.about}</a>
            <a href="#services" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">{t.nav.services}</a>
            <a href="#catalog" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">{t.nav.apartments}</a>
            <a href="#reviews" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">{t.nav.reviews}</a>
            <a href="#faq" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors">{t.nav.faq}</a>
          </nav>

          <span className="lg:hidden text-[15px] font-heading font-semibold tracking-wide text-[#F5F2EB]">ASIA WAY</span>

          <div className="flex items-center gap-3 md:gap-4">
            <LanguageSwitcher />
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              className="h-10 w-10 rounded-full border border-[rgba(197,164,109,0.22)] flex items-center justify-center text-[#A8A49B] hover:text-[#C5A46D] hover:border-[#C5A46D] transition-colors"
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
            </Link>
            <a href="#catalog" className="hidden sm:block">
              <Button className="bg-[#C5A46D] text-[#0B0D0F] font-semibold hover:bg-[#D4B77F] transition-colors text-[14px] h-11 px-6 rounded-lg">
                {t.nav.book}
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO — logo markazda, katta */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "calc(100vh - 88px)" }}>
        <div className="absolute inset-0 z-0 bg-center bg-cover" style={{ backgroundImage: `url("${ASSETS}/nestone/exterior-day-street.webp")` }} />
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(180deg, rgba(5,7,9,0.72) 0%, rgba(5,7,9,0.55) 45%, rgba(5,7,9,0.82) 100%)" }} />

        <div className="relative z-20 w-full min-h-[inherit] flex flex-col items-center justify-center text-center px-6 py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${ASSETS}/brand/asia-way-mark.webp`}
            alt="ASIA WAY"
            className="h-28 md:h-40 lg:h-48 w-auto mb-8 drop-shadow-[0_8px_40px_rgba(197,164,109,0.25)]"
          />

          <div className="text-[12px] md:text-[14px] font-semibold text-[#C5A46D] tracking-[0.14em] uppercase mb-5">
            {t.hero.badge}
          </div>

          <h1 className="font-heading text-[clamp(48px,6vw,96px)] font-medium text-[#F5F2EB] leading-[0.98] tracking-[-0.02em] max-w-[900px]">
            {t.hero.titleTop} {t.hero.titleMid} <span className="text-[#C5A46D]">{t.hero.titleAccent}</span>
          </h1>

          <p className="text-[16px] md:text-[18px] text-[#D8D3C8] leading-[1.65] max-w-[620px] mt-6">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-9">
            <a href="#catalog">
              <Button className="w-full sm:w-auto bg-[#C5A46D] text-[#0B0D0F] font-semibold hover:bg-[#D4B77F] transition-colors text-[15px] h-14 px-10 rounded-lg">
                {t.hero.ctaPrimary}
              </Button>
            </a>
            <a href="#contact">
              <Button variant="outline" className="w-full sm:w-auto border-[rgba(197,164,109,0.35)] bg-white/5 backdrop-blur-sm text-[#F5F2EB] hover:bg-white/10 transition-colors text-[15px] h-14 px-10 rounded-lg">
                {t.hero.ctaContact}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 3D SHOWCASE */}
      <NestOneShowcase />

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSETS}/brand/asia-way-mark.webp`} alt="ASIA WAY" className="h-16 w-auto" />
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
