import { createClient } from "@/lib/supabase/server";
import { APARTMENTS, BRAND } from "@/lib/seed-data";
import HomeContent from "@/components/HomeContent";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: dbApartments } = await supabase
    .from("apartments")
    .select("*, apartment_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const apartmentsToShow = dbApartments && dbApartments.length > 0 ? dbApartments : APARTMENTS;

  return <HomeContent apartments={apartmentsToShow} phones={BRAND.phones} address={BRAND.address} />;
}
