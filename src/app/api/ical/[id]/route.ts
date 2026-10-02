import { NextResponse } from "next/server";
import { buildIcs, addDays, tashkentToday } from "@/lib/ical";
import { icalServiceClient } from "@/lib/ical-sync";
import { CHANNEL_LABELS } from "@/app/dashboard/(admin)/bookings/channels";
import { getCleanApartmentLabel } from "@/lib/apartment-label";

/**
 * iCal EKSPORT — kvartiraning band sanalari (Airbnb, Booking.com shu havolani import qiladi).
 *
 *   /api/ical/<apartment_id>.ics                 — barcha bronlar
 *   /api/ical/<apartment_id>.ics?exclude=airbnb  — Airbnb'ga beriladigan havola: Airbnb'ning
 *                                                  o'z bronlari unga qaytarib yuborilmaydi
 *
 * Mehmon ismi/telefoni BERILMAYDI — faqat "band" sanalar.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = raw.replace(/\.ics$/i, "");
  if (!UUID_RE.test(id)) return new NextResponse("Not found", { status: 404 });

  const exclude = new URL(req.url).searchParams.get("exclude");
  if (exclude && !Object.hasOwn(CHANNEL_LABELS, exclude)) {
    return new NextResponse("Unknown channel", { status: 400 });
  }

  const sb = icalServiceClient();
  if (!sb) return new NextResponse("Calendar unavailable", { status: 503 });

  const { data: apt } = await sb.from("apartments").select("id, title, floor").eq("id", id).maybeSingle();
  if (!apt) return new NextResponse("Not found", { status: 404 });

  let q = sb
    .from("bookings")
    .select("id, check_in, check_out, channel")
    .eq("apartment_id", id)
    .neq("booking_status", "cancelled")
    .gte("check_out", addDays(tashkentToday(), -1))
    .order("check_in");
  if (exclude) q = q.or(`channel.is.null,channel.neq.${exclude}`);

  const { data: bookings, error } = await q;
  if (error) return new NextResponse("Calendar unavailable", { status: 503 });

  const body = buildIcs(
    `ASIA WAY — ${getCleanApartmentLabel(apt)}`,
    (bookings || []).map((b) => ({
      uid: `${b.id}@asiaway.uz`,
      start: b.check_in,
      end: b.check_out,
      summary: "ASIA WAY — band",
    }))
  );

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="asiaway-${id}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
