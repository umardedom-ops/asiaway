import { NextResponse } from "next/server";
import { syncAllFeeds } from "@/lib/ical-sync";

export const maxDuration = 300;

/**
 * Barcha iCal lentalarini (Airbnb, Booking.com, ...) sinxronlash.
 * Vercel Cron (kuniga 1 marta, zaxira) + tashqi cron (cron-job.org, har 15 daqiqada)
 * chaqiradi: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const results = await syncAllFeeds();
    const failed = results.filter((r) => !r.ok);
    return NextResponse.json({
      feeds: results.length,
      failed: failed.length,
      inserted: results.reduce((s, r) => s + r.inserted, 0),
      updated: results.reduce((s, r) => s + r.updated, 0),
      cancelled: results.reduce((s, r) => s + r.cancelled, 0),
      conflicts: results.reduce((s, r) => s + r.conflicts, 0),
      errors: failed.map((r) => ({ feed: r.feedId, error: r.error })),
    });
  } catch (e) {
    console.error("ical-sync cron:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
