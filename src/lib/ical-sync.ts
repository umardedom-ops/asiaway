import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseIcs, tashkentToday, nightsBetween, type IcsEvent } from "@/lib/ical";
import { notifyRole, esc, fmtDate } from "@/lib/telegram";
import { isMissingAttributionColumn } from "@/lib/attribution";
import { CHANNEL_LABELS } from "@/app/dashboard/(admin)/bookings/channels";
import { getCleanApartmentLabel } from "@/lib/apartment-label";

/**
 * Platformalar (Airbnb, Booking.com, ...) iCal havolasidan band sanalarni o'qib,
 * bookings jadvaliga yozadi. Har bir hodisa bitta bron: external_uid = "<kanal>:<UID>".
 *
 *  - yangi hodisa            → bron yaratiladi (confirmed), menejerga xabar
 *  - sanasi o'zgargan        → bron sanalari yangilanadi
 *  - lentadan yo'qolgan      → kelajakdagi bron bekor qilinadi (mehmon bekor qilgan)
 *  - sayt broni bilan ustma-ust:
 *      sanalar aynan bir xil → o'sha bronning o'zi (qo'lda kiritilgan yoki bizning
 *                              eksportimiz qaytib kelgan) — jim o'tkazib yuboriladi
 *      sanalar farq qiladi   → HAQIQIY to'qnashuv (ikki marta sotilgan) — shef va
 *                              menejerga ogohlantirish
 */

export interface IcalFeed {
  id: string;
  apartment_id: string;
  channel: string;
  url: string;
  last_synced_at: string | null;
  notified_conflicts: string[] | null;
  apartments?: { title: string; floor: number | null } | { title: string; floor: number | null }[] | null;
}

export interface FeedSyncResult {
  feedId: string;
  apartmentId: string;
  channel: string;
  ok: boolean;
  error?: string;
  events: number;
  inserted: number;
  updated: number;
  cancelled: number;
  conflicts: number;
}

interface ExistingBooking {
  id: string;
  external_uid: string | null;
  ical_feed_id: string | null;
  check_in: string;
  check_out: string;
  booking_status: string;
  channel: string | null;
  guest_name: string | null;
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_FEED_BYTES = 2 * 1024 * 1024;

export function icalServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Faqat ommaviy https manzil — ichki tarmoqqa so'rov yuborilmasin */
export function validateFeedUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.startsWith("[")
  ) {
    return null;
  }
  return u.toString();
}

/** Ichki, loopback, link-local, CGNAT, multicast — ommaviy bo'lmagan IP */
export function isPrivateIp(addr: string): boolean {
  const a = addr.toLowerCase().replace(/^\[|\]$/g, "");
  const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIp(mapped[1]);
  if (isIP(a) === 4) {
    const [p, q] = a.split(".").map(Number);
    return (
      p === 0 || p === 10 || p === 127 || p >= 224 ||
      (p === 100 && q >= 64 && q <= 127) ||
      (p === 169 && q === 254) ||
      (p === 172 && q >= 16 && q <= 31) ||
      (p === 192 && q === 168)
    );
  }
  if (isIP(a) === 6) {
    return a === "::" || a === "::1" || /^f[cd]/.test(a) || /^fe[89ab]/.test(a) || /^ff/.test(a);
  }
  return true; // IP emas — xavfsiz deb hisoblamaymiz
}

/** Sintaksis + DNS: host ommaviy IP'larga yo'naltirilganiga ishonch hosil qilamiz */
async function assertPublicUrl(raw: string): Promise<string> {
  const safe = validateFeedUrl(raw);
  if (!safe) throw new Error("Havola noto'g'ri (faqat https)");
  const host = new URL(safe).hostname;
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (addrs.length === 0) throw new Error("Platforma manzili topilmadi (DNS)");
  if (addrs.some((x) => isPrivateIp(x.address))) throw new Error("Havola ichki tarmoqqa yo'naltirilgan — ruxsat yo'q");
  return safe;
}

const MAX_REDIRECTS = 3;

async function fetchFeed(url: string): Promise<string> {
  // Redirect'larni o'zimiz kuzatamiz: har bir yangi manzil ham tekshiriladi
  let current = await assertPublicUrl(url);
  let res: Response | null = null;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    res = await fetch(current, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "ASIA WAY Calendar Sync/1.0", Accept: "text/calendar, */*" },
      cache: "no-store",
      redirect: "manual",
    });
    if (res.status < 300 || res.status >= 400) break;
    const location = res.headers.get("location");
    if (!location) throw new Error(`Platforma javobi: HTTP ${res.status}`);
    if (hop === MAX_REDIRECTS) throw new Error("Juda ko'p yo'naltirish (redirect)");
    current = await assertPublicUrl(new URL(location, current).toString());
  }
  if (!res || !res.ok) throw new Error(`Platforma javobi: HTTP ${res?.status}`);
  const text = await res.text();
  if (text.length > MAX_FEED_BYTES) throw new Error("Kalendar fayli juda katta");
  // Xato sahifasini bo'sh kalendar deb qabul qilmaymiz — aks holda hamma bron bekor bo'lib ketadi
  if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Javob iCal formatida emas");
  return text;
}

function channelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] || channel;
}

function aptTitle(feed: IcalFeed): string {
  const a = Array.isArray(feed.apartments) ? feed.apartments[0] : feed.apartments;
  return a ? getCleanApartmentLabel(a) : "Kvartira";
}

function guestNameFor(feed: IcalFeed, ev: IcsEvent): string {
  const summary = ev.summary.slice(0, 60) || "band";
  return `${channelLabel(feed.channel)} · ${summary}`;
}

function notesFor(ev: IcsEvent): string {
  return ["iCal import", ev.summary, ev.description].filter(Boolean).join("\n").slice(0, 1000);
}

function isExclusionError(err: { code?: string; message?: string } | null): boolean {
  return !!err && (err.code === "23P01" || /no_double_booking|exclusion/i.test(err.message || ""));
}

async function insertImported(sb: SupabaseClient, row: Record<string, unknown>) {
  let { error } = await sb.from("bookings").insert([row]);
  // source/notes ustunlari hali yo'q bo'lsa (attribution migratsiyasi RUN qilinmagan)
  if (error && isMissingAttributionColumn(error.message)) {
    const { source: _s, notes: _n, ...rest } = row;
    void _s;
    void _n;
    ({ error } = await sb.from("bookings").insert([rest]));
  }
  return error;
}

export async function syncFeed(sb: SupabaseClient, feed: IcalFeed): Promise<FeedSyncResult> {
  const result: FeedSyncResult = {
    feedId: feed.id,
    apartmentId: feed.apartment_id,
    channel: feed.channel,
    ok: false,
    events: 0,
    inserted: 0,
    updated: 0,
    cancelled: 0,
    conflicts: 0,
  };
  const today = tashkentToday();
  const label = channelLabel(feed.channel);
  const title = aptTitle(feed);
  const firstSync = !feed.last_synced_at;

  try {
    const text = await fetchFeed(feed.url);
    // O'tib ketgan hodisalar kerak emas (platformalar ham ularni lentadan olib tashlaydi)
    const events = parseIcs(text).filter((e) => e.end > today && nightsBetween(e.start, e.end) > 0);
    result.events = events.length;

    const { data: existingRows, error: exErr } = await sb
      .from("bookings")
      .select("id, external_uid, ical_feed_id, check_in, check_out, booking_status, channel, guest_name")
      .eq("apartment_id", feed.apartment_id)
      .not("external_uid", "is", null);
    if (exErr) throw new Error(exErr.message);
    const byUid = new Map<string, ExistingBooking>();
    for (const b of (existingRows || []) as ExistingBooking[]) {
      if (b.external_uid) byUid.set(b.external_uid, b);
    }

    const seen = new Set<string>();
    const newOnes: IcsEvent[] = [];
    const conflicts: { key: string; ev: IcsEvent; other: ExistingBooking }[] = [];

    for (const ev of events) {
      const key = `${feed.channel}:${ev.uid}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const nights = nightsBetween(ev.start, ev.end);
      const existing = byUid.get(key);

      if (existing) {
        const changed =
          existing.check_in !== ev.start ||
          existing.check_out !== ev.end ||
          existing.booking_status === "cancelled" ||
          existing.ical_feed_id !== feed.id;
        if (!changed) continue;
        const { error } = await sb
          .from("bookings")
          .update({
            check_in: ev.start,
            check_out: ev.end,
            nights,
            booking_status: "confirmed",
            ical_feed_id: feed.id,
          })
          .eq("id", existing.id);
        if (!error) result.updated++;
        else if (isExclusionError(error)) {
          const other = await findOverlap(sb, feed.apartment_id, ev, existing.id);
          if (other) conflicts.push({ key, ev, other });
        } else throw new Error(error.message);
        continue;
      }

      const error = await insertImported(sb, {
        apartment_id: feed.apartment_id,
        guest_name: guestNameFor(feed, ev),
        guest_phone: "",
        channel: feed.channel,
        source: feed.channel,
        check_in: ev.start,
        check_out: ev.end,
        nights,
        total_price: 0,
        deposit_amount: 0,
        // Pulni platforma oladi — saytda zaklat kutilmaydi
        deposit_status: "paid",
        booking_status: "confirmed",
        external_uid: key,
        ical_feed_id: feed.id,
        notes: notesFor(ev),
      });

      if (!error) {
        result.inserted++;
        newOnes.push(ev);
        continue;
      }
      // Parallel sinxronizatsiya shu hodisani bir lahza oldin yozib ulgurgan
      if (error.code === "23505") continue;
      if (!isExclusionError(error)) throw new Error(error.message);

      // Sanalar boshqa bron bilan ustma-ust
      const other = await findOverlap(sb, feed.apartment_id, ev);
      if (!other) continue;
      const sameDates = other.check_in === ev.start && other.check_out === ev.end;
      if (sameDates) {
        // Shu platformaning qo'lda kiritilgan broni — UID'ni bog'lab qo'yamiz,
        // shunda platformada bekor qilinsa saytda ham bekor bo'ladi
        if (!other.external_uid && other.channel === feed.channel) {
          await sb.from("bookings").update({ external_uid: key, ical_feed_id: feed.id }).eq("id", other.id);
        }
        continue; // aks holda — bizning eksportimiz qaytib kelgan (echo)
      }
      conflicts.push({ key, ev, other });
    }

    // Lentadan yo'qolgan kelajakdagi bronlar — platformada bekor qilingan
    const removed = ((existingRows || []) as ExistingBooking[]).filter(
      (b) =>
        b.ical_feed_id === feed.id &&
        b.booking_status !== "cancelled" &&
        b.check_in > today &&
        b.external_uid &&
        !seen.has(b.external_uid)
    );
    if (removed.length > 0) {
      const { error } = await sb
        .from("bookings")
        .update({ booking_status: "cancelled" })
        .in(
          "id",
          removed.map((b) => b.id)
        );
      if (error) throw new Error(error.message);
      result.cancelled = removed.length;
    }

    result.conflicts = conflicts.length;
    result.ok = true;

    // ---- Telegram xabarlari
    if (firstSync && newOnes.length > 0) {
      await notifyRole(
        "menejer",
        `🔗 <b>${esc(label)} kalendari ulandi</b>\n🏠 ${esc(title)}\n${newOnes.length} ta band sana import qilindi.`
      );
    } else {
      for (const ev of newOnes) {
        await notifyRole(
          "menejer",
          `📥 <b>${esc(label)}: yangi bron</b>\n🏠 ${esc(title)}\n📅 ${fmtDate(ev.start)} → ${fmtDate(ev.end)} (${nightsBetween(ev.start, ev.end)} kecha)\n${esc(ev.summary)}\n\nMehmon ismi va summasini dashboardda to'ldiring.`
        );
      }
    }
    for (const b of removed) {
      await notifyRole(
        "menejer",
        `🚫 <b>${esc(label)}: bron bekor qilindi</b>\n🏠 ${esc(title)}\n📅 ${fmtDate(b.check_in)} → ${fmtDate(b.check_out)}\nSana yana bo'sh.`
      );
    }

    const prevNotified = new Set(feed.notified_conflicts || []);
    const freshConflicts = conflicts.filter((c) => !prevNotified.has(c.key));
    for (const c of freshConflicts) {
      const text =
        `⚠️ <b>OVERBOOKING XAVFI — ${esc(label)}</b>\n🏠 ${esc(title)}\n` +
        `${esc(label)}: ${fmtDate(c.ev.start)} → ${fmtDate(c.ev.end)}\n` +
        `Saytdagi bron: ${esc(c.other.guest_name || "—")} (${esc(channelLabel(c.other.channel || "direct"))}) ` +
        `${fmtDate(c.other.check_in)} → ${fmtDate(c.other.check_out)}\n\n` +
        `Bitta xona ikki mehmonga sotilgan bo'lishi mumkin — darhol tekshiring!`;
      await notifyRole("shef", text);
      await notifyRole("menejer", text);
    }

    await sb
      .from("ical_feeds")
      .update({
        last_synced_at: new Date().toISOString(),
        last_status: "ok",
        last_error: conflicts.length > 0 ? `${conflicts.length} ta to'qnashuv (sanalar ustma-ust)` : null,
        last_event_count: events.length,
        notified_conflicts: conflicts.map((c) => c.key),
      })
      .eq("id", feed.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.error = msg;
    await sb
      .from("ical_feeds")
      .update({ last_synced_at: new Date().toISOString(), last_status: "error", last_error: msg.slice(0, 500) })
      .eq("id", feed.id);
  }

  return result;
}

async function findOverlap(
  sb: SupabaseClient,
  apartmentId: string,
  ev: IcsEvent,
  excludeId?: string
): Promise<ExistingBooking | null> {
  let q = sb
    .from("bookings")
    .select("id, external_uid, ical_feed_id, check_in, check_out, booking_status, channel, guest_name")
    .eq("apartment_id", apartmentId)
    .neq("booking_status", "cancelled")
    .lt("check_in", ev.end)
    .gt("check_out", ev.start)
    .limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  return ((data || [])[0] as ExistingBooking | undefined) || null;
}

const FEED_SELECT = "id, apartment_id, channel, url, last_synced_at, notified_conflicts, apartments(title, floor)";

/** Bitta kvartiraning lentalari. maxAgeMs berilsa — faqat eskirganlari yangilanadi. */
export async function syncApartmentFeeds(
  apartmentId: string,
  opts: { maxAgeMs?: number } = {}
): Promise<FeedSyncResult[]> {
  const sb = icalServiceClient();
  if (!sb) return [];
  const { data: feeds, error } = await sb.from("ical_feeds").select(FEED_SELECT).eq("apartment_id", apartmentId);
  if (error || !feeds) return []; // jadval hali yaratilmagan bo'lishi mumkin
  if (!opts.maxAgeMs) {
    const results: FeedSyncResult[] = [];
    for (const f of feeds as IcalFeed[]) results.push(await syncFeed(sb, f));
    return results;
  }

  // Ko'p mehmon bir vaqtda kalendarni ochsa, lentani faqat bittasi yangilasin:
  // last_synced_at ni shart bilan "band qilib" olamiz
  const cutoffIso = new Date(Date.now() - opts.maxAgeMs).toISOString();
  const results: FeedSyncResult[] = [];
  for (const f of feeds as IcalFeed[]) {
    if (f.last_synced_at && Date.parse(f.last_synced_at) >= Date.parse(cutoffIso)) continue;
    const { data: claimed } = await sb
      .from("ical_feeds")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", f.id)
      .or(`last_synced_at.is.null,last_synced_at.lt.${cutoffIso}`)
      .select("id");
    if (!claimed || claimed.length === 0) continue;
    results.push(await syncFeed(sb, f)); // f.last_synced_at — eski qiymat (birinchi sinxronmi?)
  }
  return results;
}

/** Cron uchun: barcha lentalar (kvartiralar parallel, 4 tadan) */
export async function syncAllFeeds(): Promise<FeedSyncResult[]> {
  const sb = icalServiceClient();
  if (!sb) throw new Error("SUPABASE_SERVICE_ROLE_KEY sozlanmagan");
  const { data: feeds, error } = await sb.from("ical_feeds").select(FEED_SELECT);
  if (error) throw new Error(error.message);

  const byApt = new Map<string, IcalFeed[]>();
  for (const f of (feeds || []) as IcalFeed[]) {
    byApt.set(f.apartment_id, [...(byApt.get(f.apartment_id) || []), f]);
  }
  const groups = [...byApt.values()];
  const results: FeedSyncResult[] = [];
  const CONCURRENCY = 4;
  for (let i = 0; i < groups.length; i += CONCURRENCY) {
    const batch = await Promise.all(
      groups.slice(i, i + CONCURRENCY).map(async (g) => {
        const out: FeedSyncResult[] = [];
        for (const f of g) out.push(await syncFeed(sb, f));
        return out;
      })
    );
    results.push(...batch.flat());
  }
  return results;
}
