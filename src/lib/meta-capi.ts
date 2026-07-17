import crypto from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Meta Conversions API (CAPI) — server-side event yuborish.
 *
 * Qamrov:
 *  - Purchase — bron `confirmed` bo'lgan BARCHA yo'llarda (qo'lda tasdiqlash,
 *    sayt simulyatsiya-broni, Payme/Click webhook). Dedup ikki qatlam:
 *    `bookings.capi_sent_at` (DB) + `event_id` (Meta o'zi dedup qiladi,
 *    browser pixel bilan ham to'qnashmaydi).
 *  - Lead — saytdan/CRM'dan yangi murojaat.
 *
 * Xavfsizlik: telefon/email/ism SHA-256 bilan xeshlenadi (Meta talabi),
 * xom ko'rinishda hech narsa yuborilmaydi. Env yo'q bo'lsa jim o'tkazadi —
 * sayt oqimini hech qachon buzmaydi.
 *
 * Env: META_PIXEL_ID, META_CAPI_ACCESS_TOKEN, META_TEST_EVENT_CODE (ixtiyoriy).
 */

const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Telefon normalizatsiyasi: faqat raqamlar, O'zbekiston lokal formatiga 998 qo'shiladi */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 9) digits = `998${digits}`; // 901234567 -> 998901234567
  return digits;
}

function normalizeEmail(email?: string | null): string | null {
  const e = email?.trim().toLowerCase();
  return e && e.includes("@") ? e : null;
}

export interface MetaEventInput {
  eventName: "Purchase" | "Lead" | "InitiateCheckout" | "Contact";
  /** Dedup kaliti — bir xil event_id ikki marta hisoblanmaydi */
  eventId: string;
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  sourceUrl?: string;
  actionSource?: "website" | "system_generated" | "phone_call" | "chat";
}

export function metaCapiConfigured(): boolean {
  return Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN);
}

/** Bitta eventni Meta CAPI'ga yuboradi. Hech qachon throw qilmaydi. */
export async function sendMetaEvent(input: MetaEventInput): Promise<{ sent: boolean; reason?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return { sent: false, reason: "META_PIXEL_ID / META_CAPI_ACCESS_TOKEN env yo'q" };

  try {
    // user_data — hammasi xeshlangan (fbp/fbc dan tashqari, Meta talabi shunday)
    const userData: Record<string, unknown> = {};
    const ph = normalizePhone(input.phone);
    if (ph) userData.ph = [sha256(ph)];
    const em = normalizeEmail(input.email);
    if (em) userData.em = [sha256(em)];
    const fn = input.firstName?.trim().toLowerCase();
    if (fn) userData.fn = [sha256(fn)];
    if (input.externalId) userData.external_id = [sha256(input.externalId)];
    if (input.fbp) userData.fbp = input.fbp;
    if (input.fbc) userData.fbc = input.fbc;

    if (Object.keys(userData).length === 0) {
      return { sent: false, reason: "user_data bo'sh — hech bo'lmasa telefon kerak" };
    }

    const event: Record<string, unknown> = {
      event_name: input.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: input.actionSource || "website",
      event_source_url: input.sourceUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://asiaway.uz",
      user_data: userData,
    };

    const customData: Record<string, unknown> = {};
    if (typeof input.value === "number") customData.value = Math.round(input.value * 100) / 100;
    if (input.currency) customData.currency = input.currency;
    if (input.contentName) customData.content_name = input.contentName;
    if (input.contentIds?.length) customData.content_ids = input.contentIds;
    if (Object.keys(customData).length > 0) event.custom_data = customData;

    const body: Record<string, unknown> = { data: [event] };
    if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("Meta CAPI xato:", res.status, JSON.stringify(json)?.slice(0, 500));
      return { sent: false, reason: `HTTP ${res.status}` };
    }
    console.log(`Meta CAPI OK: ${input.eventName} (${input.eventId})`, json?.events_received != null ? `received=${json.events_received}` : "");
    return { sent: true };
  } catch (e) {
    console.error("Meta CAPI exception:", e instanceof Error ? e.message : e);
    return { sent: false, reason: "network" };
  }
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key);
}

/** utm_data jsonb'dan fbc/fbp ni chiqaradi (fbclid bo'lsa standart fbc yasaydi) */
function fbcFromUtm(utm: Record<string, string> | null | undefined): { fbp: string | null; fbc: string | null } {
  if (!utm) return { fbp: null, fbc: null };
  const fbp = utm.fbp || null;
  let fbc = utm.fbc || null;
  if (!fbc && utm.fbclid) fbc = `fb.1.${Date.now()}.${utm.fbclid}`;
  return { fbp, fbc };
}

/**
 * Bron tasdiqlanганда Purchase yuborish — BARCHA confirm yo'llari shu bitta
 * funksiyani chaqiradi. Dedup: capi_sent_at (ustun bo'lmasa ham ishlayveradi).
 */
export async function sendPurchaseForBooking(bookingId: string): Promise<void> {
  if (!metaCapiConfigured()) return;
  const svc = serviceClient();
  if (!svc) return;

  try {
    const { data: b } = await svc
      .from("bookings")
      .select("*, apartments(title)")
      .eq("id", bookingId)
      .maybeSingle();

    if (!b || b.booking_status !== "confirmed") return;
    if (b.capi_sent_at) return; // allaqachon yuborilgan

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apt: any = Array.isArray(b.apartments) ? b.apartments[0] : b.apartments;
    const { fbp, fbc } = fbcFromUtm(b.utm_data);

    const res = await sendMetaEvent({
      eventName: "Purchase",
      eventId: `purchase.${b.id}`,
      phone: b.guest_phone,
      email: b.guest_email,
      firstName: b.guest_name?.split(" ")[0],
      externalId: b.client_id || b.id,
      fbp,
      fbc,
      value: Number(b.total_price || 0),
      currency: "USD", // narxlar tizimda USD'da saqlanadi
      contentName: apt?.title || "Apartment Booking",
      contentIds: b.apartment_id ? [String(b.apartment_id)] : undefined,
      actionSource: b.payment_provider === "simulate" || b.payment_provider == null ? "system_generated" : "website",
    });

    if (res.sent) {
      // capi_sent_at ustuni bo'lmasa (migratsiya RUN qilinmagan) — jim: Meta event_id dedup qiladi
      await svc
        .from("bookings")
        .update({ capi_sent_at: new Date().toISOString() })
        .eq("id", b.id)
        .then(({ error }) => {
          if (error && !/column/i.test(error.message)) console.error("capi_sent_at:", error.message);
        });
    }
  } catch (e) {
    console.error("sendPurchaseForBooking:", e instanceof Error ? e.message : e);
  }
}

/** Yangi murojaat (lead) uchun Lead event. */
export async function sendLeadEventForLead(params: {
  leadId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  utm?: Record<string, string> | null;
}): Promise<void> {
  if (!metaCapiConfigured()) return;
  const { fbp, fbc } = fbcFromUtm(params.utm);
  await sendMetaEvent({
    eventName: "Lead",
    eventId: `lead.${params.leadId}`,
    phone: params.phone,
    email: params.email,
    firstName: params.name?.split(" ")[0],
    externalId: params.leadId,
    fbp,
    fbc,
    actionSource: "website",
  });
}
