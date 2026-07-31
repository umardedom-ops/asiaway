"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveApartment(prevState: any, formData: FormData) {
  const supabase = await createClient();

  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const title_ru = formData.get("title_ru") as string;
    const description = formData.get("description") as string;
    const description_ru = formData.get("description_ru") as string;
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
    // Tan narx (biz egaga to'laydigan oylik) + ega ma'lumoti
    const monthly_lease_cost = formData.get("monthly_lease_cost") ? Number(formData.get("monthly_lease_cost")) : 0;
    const owner_name = (formData.get("owner_name") as string) || null;
    const owner_phone = (formData.get("owner_phone") as string) || null;
    // Egaga to'lov kuni (oyning sanasi, 1-31) — bot eslatmasi uchun
    const leaseDayRaw = Number(formData.get("lease_payment_day"));
    const lease_payment_day =
      leaseDayRaw >= 1 && leaseDayRaw <= 31 ? Math.floor(leaseDayRaw) : null;
    
    // Qulayliklarni parse qilish
    const amenities = formData.getAll("amenities") as string[];

    // Rasm faylini yuklash
    const imageFile = formData.get("cover_image_file");
    let cover_image = (formData.get("existing_cover_image") as string) || "";

    if (imageFile && typeof imageFile === "object" && "size" in imageFile && (imageFile as File).size > 0) {
      const file = imageFile as File;
      const fileExt = (file.name || "jpg").split(".").pop();
      const fileName = `${id || Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("apartments")
        .upload(fileName, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Cover image upload error:", uploadError);
        throw new Error(`Asosiy rasmni yuklashda xatolik: ${uploadError.message}`);
      }

      // Public URL olish
      const { data: { publicUrl } } = supabase.storage
        .from("apartments")
        .getPublicUrl(fileName);
        
      cover_image = publicUrl;
    }

    const apartmentData = {
      title,
      title_ru,
      description,
      description_ru,
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
      monthly_lease_cost,
      owner_name,
      owner_phone,
      lease_payment_day,
    };

    let targetAptId = id;

    if (id) {
      // Yangilash (Update) — 1-urinish (barcha maydonlar bilan)
      let { error } = await supabase
        .from("apartments")
        .update(apartmentData)
        .eq("id", id);

      if (error) {
        console.warn("Full update error, trying fallback 1 (without owner/lease fields):", error.message);
        // Fallback 1: Owner va lease maydonlarisiz saqlash
        const fallback1 = { ...apartmentData };
        delete (fallback1 as any).monthly_lease_cost;
        delete (fallback1 as any).owner_name;
        delete (fallback1 as any).owner_phone;
        delete (fallback1 as any).lease_payment_day;

        let res1 = await supabase
          .from("apartments")
          .update(fallback1)
          .eq("id", id);

        if (res1.error) {
          console.warn("Fallback 1 update error, trying fallback 2 (without title_ru/description_ru):", res1.error.message);
          // Fallback 2: Multilingual title_ru va description_ru siz saqlash
          delete (fallback1 as any).title_ru;
          delete (fallback1 as any).description_ru;

          let res2 = await supabase
            .from("apartments")
            .update(fallback1)
            .eq("id", id);

          error = res2.error;
        } else {
          error = null;
        }
      }

      if (error) {
        throw new Error(`Kvartirani yangilashda xatolik: ${error.message}`);
      }
    } else {
      // Yaratish (Create) — 1-urinish
      let { data: newApt, error } = await supabase
        .from("apartments")
        .insert([apartmentData])
        .select("id")
        .single();

      if (error) {
        console.warn("Full insert error, trying fallback 1:", error.message);
        const fallback1 = { ...apartmentData };
        delete (fallback1 as any).monthly_lease_cost;
        delete (fallback1 as any).owner_name;
        delete (fallback1 as any).owner_phone;
        delete (fallback1 as any).lease_payment_day;

        let res1 = await supabase
          .from("apartments")
          .insert([fallback1])
          .select("id")
          .single();

        if (res1.error) {
          console.warn("Fallback 1 insert error, trying fallback 2:", res1.error.message);
          delete (fallback1 as any).title_ru;
          delete (fallback1 as any).description_ru;

          let res2 = await supabase
            .from("apartments")
            .insert([fallback1])
            .select("id")
            .single();

          newApt = res2.data;
          error = res2.error;
        } else {
          newApt = res1.data;
          error = null;
        }
      }

      if (error || !newApt) {
        throw error || new Error("Apartament yaratib bo'lmadi");
      }
      targetAptId = newApt.id;
    }

    // Galereya rasmlarini qayta ishlash
    const galleryFiles = formData.getAll("gallery_files") as File[];
    const deletedImageIds = formData.getAll("deleted_image_ids") as string[];

    // 1. O'chirilishi kerak bo'lgan rasmlarni o'chirish
    if (deletedImageIds.length > 0) {
      const { error: deleteErr } = await supabase
        .from("apartment_images")
        .delete()
        .in("id", deletedImageIds);
      if (deleteErr) console.error("Error deleting old images:", deleteErr);
    }

    // 2. Yangi galereya rasmlarini yuklash
    const uploadedUrls: string[] = [];
    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      if (file && typeof file === "object" && "size" in file && (file as File).size > 0) {
        const fileObj = file as File;
        const fileExt = (fileObj.name || "jpg").split(".").pop();
        const fileName = `gallery_${targetAptId}_${Date.now()}_${i}.${fileExt}`;
        const buffer = Buffer.from(await fileObj.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from("apartments")
          .upload(fileName, buffer, {
            contentType: fileObj.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("apartments")
            .getPublicUrl(fileName);
          uploadedUrls.push(publicUrl);
        } else {
          console.error("Error uploading gallery image:", uploadError);
          throw new Error(`Galereya rasmini yuklashda xatolik: ${uploadError.message}`);
        }
      }
    }

    // 3. Yangi rasmlarni ma'lumotlar bazasiga yozish
    if (uploadedUrls.length > 0) {
      const imgInserts = uploadedUrls.map((url, index) => ({
        apartment_id: targetAptId,
        url,
        is_360: false,
        sort_order: index + 10,
      }));
      const { error: imgErr } = await supabase
        .from("apartment_images")
        .insert(imgInserts);

      if (imgErr) {
        console.warn("Full apartment_images insert error, trying simple insert:", imgErr.message);
        const simpleInserts = uploadedUrls.map((url) => ({
          apartment_id: targetAptId,
          url,
        }));
        await supabase.from("apartment_images").insert(simpleInserts);
      }
    }

    revalidatePath("/dashboard/apartments");
    revalidatePath("/apartments");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Save apartment error:", error);
    return { success: false, error: error.message || "Apartamentni saqlashda kutilmagan xatolik" };
  }
}

export async function deleteApartment(id: string) {
  // Apartamentni O'CHIRISH — FAQAT SHEF
  const { denyUnlessRole } = await import("@/lib/export-auth");
  const deny = await denyUnlessRole(["shef"]);
  if (deny) throw new Error(deny.error);

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
