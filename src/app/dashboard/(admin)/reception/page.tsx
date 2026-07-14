import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { D, type Lang } from "@/lib/i18n";
import ReceptionTabs from "./ReceptionTabs";
import BookingStatCards from "../BookingStatCards";

export const revalidate = 0;

export default async function ReceptionPage() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

  const [{ data: bookings }, { data: apartments }, { data: clients }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, apartments(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("apartments")
      .select("id, title, floor, price_per_day, deposit_amount, status")
      .eq("status", "active")
      .order("floor", { ascending: false }),
    supabase.from("clients").select("*").order("total_spent", { ascending: false }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{d.reception.title}</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          {d.reception.subtitle}
        </p>
      </div>
      <BookingStatCards />
      <ReceptionTabs bookings={bookings ?? []} apartments={apartments ?? []} clients={clients ?? []} />
    </div>
  );
}
