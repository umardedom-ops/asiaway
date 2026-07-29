"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1610789177047933";

declare global {
  interface Window {
    fbq?: (
      action: string,
      eventName: string,
      options?: Record<string, unknown>,
      extra?: { eventID?: string }
    ) => void;
    _fbq?: unknown;
    trackClientMetaEvent?: (
      eventName: "PageView" | "ViewContent" | "InitiateCheckout" | "Lead" | "Purchase" | "Contact",
      options?: Record<string, unknown>,
      eventId?: string
    ) => void;
  }
}

/**
 * Meta Pixel (Browser side) component.
 * Layout'ga qo'shiladi. Facebook Pixel ssenariylarini yuklaydi,
 * PageView'ni avtomatik kuzatadi va frontend'dan `trackClientMetaEvent` chaqirishni ta'minlaydi.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sahifa o'zgarganda PageView yuborish
  useEffect(() => {
    if (!PIXEL_ID || typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Window ob'ektiga helper biriktiramiz
    window.trackClientMetaEvent = (eventName, options = {}, eventId) => {
      if (typeof window.fbq === "function") {
        const extra = eventId ? { eventID: eventId } : undefined;
        window.fbq("track", eventName, options, extra);
        console.log(`[Meta Pixel] Tracked ${eventName}`, options, extra);
      }
    };
  }, []);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
