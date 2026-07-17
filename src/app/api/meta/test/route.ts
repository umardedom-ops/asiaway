import { NextResponse } from "next/server";
import { metaCapiConfigured, sendMetaEvent } from "@/lib/meta-capi";

/**
 * Meta CAPI diagnostika — sozlamani tekshirish va sinov eventi yuborish.
 * GET /api/meta/test?secret=<CRON_SECRET>          — holat
 * GET /api/meta/test?secret=<CRON_SECRET>&send=1   — sinov Purchase yuboradi
 * (META_TEST_EVENT_CODE env qo'yilgan bo'lsa, event Events Manager'ning
 *  "Test events" bo'limida ko'rinadi, statistikaga qo'shilmaydi.)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const status = {
    configured: metaCapiConfigured(),
    pixel_id: process.env.META_PIXEL_ID ? `...${process.env.META_PIXEL_ID.slice(-4)}` : null,
    token: process.env.META_CAPI_ACCESS_TOKEN ? "bor" : "yo'q",
    test_event_code: process.env.META_TEST_EVENT_CODE || null,
  };

  if (url.searchParams.get("send") !== "1") {
    return NextResponse.json({ status });
  }

  const result = await sendMetaEvent({
    eventName: "Purchase",
    eventId: `test.${Date.now()}`,
    phone: "+998901234567",
    email: "test@asiaway.uz",
    firstName: "Test",
    value: 1,
    currency: "USD",
    contentName: "CAPI sinov eventi",
    actionSource: "system_generated",
  });

  return NextResponse.json({ status, result });
}
