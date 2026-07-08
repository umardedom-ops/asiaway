"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveApartment(prevState: any, formData: FormData) {
  const supabase = await createClient();

  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const district = formData.get("district") as string;
    const price_per_day = Number(formData.get("price_per_day"));
    const price_per_month = formData.get("price_per_month") ? Number(formData.get("price_per_month")) : null;
    const deposit_amount = Number(formData.get("deposit_amount"));
    const area_m2 = Number(formData.get("area_m2"));
    const rooms = Number(formData.get("rooms"));
    const floor = formData.get("floor") ? Number(formData.get("floor")) : null;
    const max_guests = Number(formData.get("max_guests"));
    const status = formData.get("status") as string;
    
    // Qulayliklarni parse qilish
    const amenities = formData.getAll("amenities") as string[];

    // Rasm faylini yuklash
    const imageFile = formData.get("cover_image_file") as File;
    let cover_image = formData.get("existing_cover_image") as string || "";

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${id || Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("apartments")
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Rasm yuklashda xatolik: ${uploadError.message}`);
      }

      // Public URL olish
      const { data: { publicUrl } } = supabase.storage
        .from("apartments")
        .getPublicUrl(fileName);
        
      cover_image = publicUrl;
    }

    const apartmentData = {
      title,
      description,
      address,
      district,
      price_per_day,
      price_per_month,
      deposit_amount,
      area_m2,
      rooms,
      floor,
      max_guests,
      amenities,
      cover_image,
      status,
    };

    if (id) {
      // Yangilash (Update)
      const { error } = await supabase
        .from("apartments")
        .update(apartmentData)
        .eq("id", id);

      if (error) throw error;
    } else {
      // Yaratish (Create)
      const { error } = await supabase
        .from("apartments")
        .insert([apartmentData]);

      if (error) throw error;
    }

    revalidatePath("/dashboard/apartments");
    revalidatePath("/apartments");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Save apartment error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteApartment(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("apartments")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Apartamentni o'chirishda xatolik: ${error.message}`);
  }

  revalidatePath("/dashboard/apartments");
  revalidatePath("/apartments");
  revalidatePath("/");
}
