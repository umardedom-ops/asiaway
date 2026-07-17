import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BookingStatCards from "../BookingStatCards";
import { Plus } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import KanbanBoard from "./KanbanBoard";
import { getDashDict } from "@/lib/dash-lang";

export const revalidate = 0;

export default async function BookingsPage() {
  const supabase = await createClient();
  const d = await getDashDict();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, apartments(title)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{d.bookingsPage.title}</h1>
          <p className="text-[14px] text-[#A8A49B] mt-1 font-light">{d.bookingsPage.subtitle}</p>
        </div>
        <Link href="/dashboard/bookings/new">
          <button className={`${btnPrimary} h-11 px-6 text-[14px] gap-2`}>
            <Plus className="h-4 w-4" /> {d.bookingsPage.addManual}
          </button>
        </Link>
      </div>

      <BookingStatCards />

      {error ? (
        <div className="rounded-[8px] bg-red-950/20 p-4 text-red-400 border border-red-900/50 text-[14px]">
          {d.bookingsPage.loadError}: {error.message}
        </div>
      ) : (
        <div className="h-[calc(100vh-250px)] min-h-[500px]">
          <KanbanBoard initialBookings={bookings || []} />
        </div>
      )}
    </div>
  );
}
