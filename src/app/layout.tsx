import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://asiaway.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AsiaWay Apartment — Nest One'da premium ijara | Tashkent City",
    template: "%s | AsiaWay Apartment",
  },
  description:
    "Nest One osmono'par binosida kunlik va oylik premium apartament ijarasi. 10 yillik tajriba, shaxsiy aeroport transferi, 24/7 xizmat. Online bron qiling.",
  keywords: [
    "apartament ijara Toshkent",
    "Nest One apartament",
    "Tashkent City ijara",
    "kunlik ijara Toshkent",
    "premium apartment rent Tashkent",
    "аренда апартаментов Ташкент",
    "посуточная аренда Ташкент Сити",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "AsiaWay Apartment",
    title: "AsiaWay Apartment — Nest One'da premium ijara | Tashkent City",
    description:
      "Nest One osmono'par binosida kunlik va oylik premium apartament ijarasi. Aeroport transferi, 24/7 konsyerj, online bron.",
    locale: "uz_UZ",
    alternateLocale: ["ru_RU", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AsiaWay Apartment — Nest One premium ijara",
    description:
      "Tashkent City, Nest One'da kunlik va oylik premium apartamentlar. Online bron qiling.",
  },
  robots: { index: true, follow: true },
};

// schema.org LodgingBusiness — qidiruv tizimlari uchun tashkilot ma'lumoti
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "AsiaWay Apartment",
  description:
    "Nest One osmono'par binosida premium apartamentlar kunlik va oylik ijarasi. Aeroport transferi va 24/7 konsyerj xizmati.",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Nest One, Tashkent City",
    addressLocality: "Tashkent",
    addressCountry: "UZ",
  },
  priceRange: "$$",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Airport transfer" },
    { "@type": "LocationFeatureSpecification", name: "24/7 concierge" },
    { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <LanguageProvider>
          <LenisProvider>{children}</LenisProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
