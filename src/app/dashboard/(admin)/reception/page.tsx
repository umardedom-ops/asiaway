import { createClient } from "@/lib/supabase/server";
import ReceptionTabs from "./ReceptionTabs";

export const revalidate = 0;

// Qabul — bron, joylashtirish va xonalar holati bitta bo'limda (tab bilan)
export default async function ReceptionPage() {
  const supabase = await createClient();

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
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Qabul</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">
          Bronlar, mehmon joylashtirish (walk-in) va xonalar bandligi — bitta joyda.
        </p>
      </div>
      <ReceptionTabs bookings={bookings ?? []} apartments={apartments ?? []} clients={clients ?? []} />
    </div>
  );
}
