import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ApartmentForm from "../../ApartmentForm";
import CalendarSyncPanel, { type FeedRow } from "../../CalendarSyncPanel";

// Platformalarga beriladigan iCal havola doim asosiy domenda bo'lishi kerak
const SITE_URL = "https://www.asiaway.uz";

interface EditApartmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApartmentPage({ params }: EditApartmentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: apartment, error }, { data: feeds, error: feedsError }] = await Promise.all([
    supabase.from("apartments").select("*, apartment_images(*)").eq("id", id).single(),
    supabase
      .from("ical_feeds")
      .select("id, channel, url, last_synced_at, last_status, last_error, last_event_count")
      .eq("apartment_id", id)
      .order("created_at"),
  ]);

  if (error || !apartment) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <ApartmentForm initialData={apartment} />
      <CalendarSyncPanel
        apartmentId={apartment.id}
        siteUrl={SITE_URL}
        feeds={feedsError ? null : ((feeds || []) as FeedRow[])}
      />
    </div>
  );
}
