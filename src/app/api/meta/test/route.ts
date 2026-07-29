import { NextResponse } from "next/server";
import { metaCapiConfigured, sendMetaEvent } from "@/lib/meta-capi";

/**
 * Meta CAPI & Pixel diagnostika — sozlamani tekshirish va sinov eventi yuborish.
 * GET /api/meta/test?secret=<CRON_SECRET>          — holat
 * GET /api/meta/test?secret=<CRON_SECRET>&send=1&event=Lead   — sinov Lead event yuboradi
 * GET /api/meta/test?secret=<CRON_SECRET>&send=1&event=Purchase — sinov Purchase yuboradi
 */
export async function GET(req: Request) {
  const url = new URL(req.url);

  const pixelId = process.env.META_PIXEL_ID || "120247308451950061";
  const publicPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "120247308451950061";

  const status = {
    configured: metaCapiConfigured(),
    pixel_id: `...${pixelId.slice(-4)}`,
    full_pixel_id: pixelId,
    next_public_pixel_id: `...${publicPixelId.slice(-4)}`,
    pixel_matched: Boolean(pixelId === publicPixelId),
    token: process.env.META_CAPI_ACCESS_TOKEN ? "bor" : "yo'q",
    test_event_code: process.env.META_TEST_EVENT_CODE || null,
  };

  if (url.searchParams.get("send") !== "1") {
    return NextResponse.json({ status });
  }

  const requestedEvent = url.searchParams.get("event") || "Purchase";
  const validEvents = ["Purchase", "Lead", "InitiateCheckout", "Contact", "ViewContent", "PageView"] as const;
  const eventName = validEvents.includes(requestedEvent as unknown as typeof validEvents[number])
    ? (requestedEvent as typeof validEvents[number])
    : "Purchase";

  const result = await sendMetaEvent({
    eventName,
    eventId: `test.${eventName.toLowerCase()}.${Date.now()}`,
    phone: "+998901234567",
    email: "test@asiaway.uz",
    firstName: "TestUser",
    clientIp: "127.0.0.1",
    userAgent: req.headers.get("user-agent") || "MetaCapiTest/1.0",
    value: eventName === "Purchase" ? 100 : eventName === "InitiateCheckout" ? 50 : undefined,
    currency: "USD",
    contentName: `CAPI ${eventName} Sinov Eventi`,
    actionSource: "website",
  });

  return NextResponse.json({ status, eventName, result });
}
