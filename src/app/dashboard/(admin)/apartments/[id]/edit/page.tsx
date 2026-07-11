import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ApartmentForm from "../../ApartmentForm";

interface EditApartmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApartmentPage({ params }: EditApartmentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: apartment, error } = await supabase
    .from("apartments")
    .select("*, apartment_images(*)")
    .eq("id", id)
    .single();

  if (error || !apartment) {
    notFound();
  }

  return <ApartmentForm initialData={apartment} />;
}
