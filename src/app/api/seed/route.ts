import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { APARTMENTS } from "@/lib/seed-data";

export async function GET() {
  // Service role key orqali RLS cheklovlaridan o'tib bazaga yozamiz
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    console.log("Seeding apartments starting...");

    // 1. Avval mavjudlarini o'chiramiz (seed qayta ishga tushsa dublikat bo'lmasligi uchun)
    const { error: deleteError } = await supabase
      .from("apartments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) throw deleteError;

    // 2. Kvartiralarni kiritamiz
    const apartmentsData = APARTMENTS.map((apt) => ({
      id: apt.id.includes("apt-") ? undefined : apt.id, // Agar uuid bo'lmasa o'zi yaratsin
      title: apt.title,
      description: apt.description,
      address: "Toshkent shahri, Toshkent City, Botir Zokirov ko'chasi 1A/1",
      district: "Yunusobod / Shayxontohur",
      price_per_day: apt.price_per_day,
      price_per_month: apt.price_per_month,
      deposit_amount: apt.deposit_amount,
      area_m2: apt.area_m2,
      rooms: apt.rooms,
      floor: apt.floor,
      max_guests: apt.max_guests,
      amenities: apt.amenities.map(a => a.toUpperCase()), // Standardized
      cover_image: apt.cover_image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60",
      status: apt.status,
    }));

    const { data: insertedApts, error: insertError } = await supabase
      .from("apartments")
      .insert(apartmentsData)
      .select();

    if (insertError) throw insertError;

    // 3. Har bir apartament uchun rasmlarni kiritamiz
    for (const apt of APARTMENTS) {
      if (apt.cover_image) {
        // Bu yerda db dagi yangi yaratilgan id ni topamiz (agar id o'zgargan bo'lsa)
        const dbApt = insertedApts.find(a => a.title === apt.title);
        if (dbApt) {
          const { error: imgError } = await supabase
            .from("apartment_images")
            .insert([
              {
                apartment_id: dbApt.id,
                url: apt.cover_image,
                is_360: false,
                sort_order: 1,
              }
            ]);
          if (imgError) console.error("Image seed error:", imgError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Supabase ma'lumotlar bazasi muvaffaqiyatli to'ldirildi!",
      inserted: insertedApts.length,
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
