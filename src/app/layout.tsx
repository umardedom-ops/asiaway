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

export const metadata: Metadata = {
  title: "ASIA WAY Apartment — Nest One'da premium ijara | Tashkent City",
  description:
    "Nest One osmono'par binosida kunlik va oylik premium apartament ijarasi. 10 yillik tajriba, bepul aeroport transferi, 24/7 xizmat. Online bron qiling.",
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
        <LanguageProvider>
          <LenisProvider>{children}</LenisProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
