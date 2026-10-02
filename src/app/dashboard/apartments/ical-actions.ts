"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessRole } from "@/lib/export-auth";
import { syncApartmentFeeds, validateFeedUrl, icalServiceClient, type FeedSyncResult } from "@/lib/ical-sync";
import { tashkentToday } from "@/lib/ical";
import { CHANNEL_LABELS } from "@/app/dashboard/(admin)/bookings/channels";

const ALLOWED = ["shef", "menejer"];

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function editPath(apartmentId: string) {
  return `/dashboard/apartments/${apartmentId}/edit`;
}

export async function addIcalFeed(input: {
  apartment_id: string;
  channel: string;
  url: string;
}): Promise<ActionResult<FeedSyncResult[]>> {
  const deny = await denyUnlessRole(ALLOWED);
  if (deny) return deny;

  const url = validateFeedUrl(input.url);
  if (!url) return { success: false, error: "Havola noto'g'ri — platformadan nusxalangan https:// havolani qo'ying" };
  if (!Object.hasOwn(CHANNEL_LABELS, input.channel)) return { success: false, error: "Platforma noto'g'ri" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ical_feeds")
    .insert([{ apartment_id: input.apartment_id, channel: input.channel, url }]);
  if (error) {
    if (error.code === "23505") return { success: false, error: "Bu havola allaqachon qo'shilgan" };
    if (/ical_feeds/i.test(error.message) && /exist|find/i.test(error.message)) {
      return { success: false, error: "Bazada ical_feeds jadvali yo'q — 20261002000000_ical_sync.sql migratsiyasini ishga tushiring" };
    }
    return { success: false, error: error.message };
  }

  // Darhol birinchi sinxronizatsiya — xato bo'lsa foydalanuvchi shu zahoti ko'radi
  const results = await syncApartmentFeeds(input.apartment_id);
  revalidatePath(editPath(input.apartment_id));
  return { success: true, data: results };
}

export async function deleteIcalFeed(feedId: string, apartmentId: string): Promise<ActionResult> {
  const deny = await denyUnlessRole(ALLOWED);
  if (deny) return deny;

  const supabase = await createClient();
  // Shu lentadan kelgan kelajakdagi bronlar sanani abadiy band qilib qolmasin
  const { error: cancelErr } = await supabase
    .from("bookings")
    .update({ booking_status: "cancelled" })
    .eq("ical_feed_id", feedId)
    .neq("booking_status", "cancelled")
    .gt("check_in", tashkentToday());
  if (cancelErr) return { success: false, error: cancelErr.message };

  const { error } = await supabase.from("ical_feeds").delete().eq("id", feedId);
  if (error) return { success: false, error: error.message };

  revalidatePath(editPath(apartmentId));
  return { success: true };
}

export async function syncIcalNow(apartmentId: string): Promise<ActionResult<FeedSyncResult[]>> {
  const deny = await denyUnlessRole(ALLOWED);
  if (deny) return deny;
  if (!icalServiceClient()) return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY sozlanmagan (Vercel env)" };

  const results = await syncApartmentFeeds(apartmentId);
  revalidatePath(editPath(apartmentId));
  return { success: true, data: results };
}
