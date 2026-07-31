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
    const monthly_lease_cost = formData.get("monthly_lease_cost") ? Number(formData.get("monthly_lease_cost")) : 0;
    const owner_name = (formData.get("owner_name") as string) || null;
    const owner_phone = (formData.get("owner_phone") as string) || null;
    const leaseDayRaw = Number(formData.get("lease_payment_day"));
    const lease_payment_day =
      leaseDayRaw >= 1 && leaseDayRaw <= 31 ? Math.floor(leaseDayRaw) : null;
    
    const amenities = formData.getAll("amenities") as string[];

    // Helper: Fail-safe Storage Upload with Auto Bucket Creation & Data URL Fallback
    const uploadImage = async (fileName: string, buffer: Buffer, mimeType: string): Promise<string> => {
      // 1. Try uploading to 'apartments' bucket
      let { error: uploadErr } = await supabase.storage
        .from("apartments")
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadErr && (uploadErr.message?.toLowerCase().includes("not found") || uploadErr.message?.includes("Bucket"))) {
        console.warn("Storage bucket missing, attempting auto-creation:", uploadErr.message);
        try {
          await supabase.storage.createBucket("apartments", { public: true });
        } catch (e) {
          console.error("Bucket creation failed:", e);
        }

        // Retry upload
        const retry = await supabase.storage
          .from("apartments")
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });
        uploadErr = retry.error;
      }

      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage
          .from("apartments")
          .getPublicUrl(fileName);
        return publicUrl;
      }

      console.warn("Storage upload failed completely, using data URL fallback:", uploadErr?.message);
      // Fallback: convert buffer to base64 Data URL so the image is NEVER lost
      const base64 = buffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    };

    // Rasm faylini yuklash
    const imageFile = formData.get("cover_image_file");
    let cover_image = (formData.get("existing_cover_image") as string) || "";

    if (imageFile && typeof imageFile === "object" && "size" in imageFile && (imageFile as File).size > 0) {
      const file = imageFile as File;
      const fileExt = (file.name || "jpg").split(".").pop();
      const fileName = `${id || Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      cover_image = await uploadImage(fileName, buffer, file.type || "image/jpeg");
    }

    const apartmentData: Record<string, any> = {
      title,
      title_ru: title_ru || title,
      description,
      description_ru: description_ru || description,
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
      // Yangilash (Update)
      let dataToUpdate = { ...apartmentData };
      let { error } = await supabase
        .from("apartments")
        .update(dataToUpdate)
        .eq("id", id);

      if (error) {
        console.warn("Initial update error:", error.message);
        // Specific column missing fallback
        const match = error.message.match(/column "(.*?)"/i) || error.message.match(/column apartments\.(.*?) /i);
        if (match && match[1]) {
          const missingCol = match[1];
          delete dataToUpdate[missingCol];
          const res = await supabase.from("apartments").update(dataToUpdate).eq("id", id);
          error = res.error;
        }
      }

      if (error) {
        // Fallback: Remove optional owner/lease fields if schema missing
        delete dataToUpdate.monthly_lease_cost;
        delete dataToUpdate.owner_name;
        delete dataToUpdate.owner_phone;
        delete dataToUpdate.lease_payment_day;
        const res = await supabase.from("apartments").update(dataToUpdate).eq("id", id);
        error = res.error;
      }

      if (error) {
        throw new Error(`Kvartirani yangilashda xatolik: ${error.message}`);
      }
    } else {
      // Yaratish (Create)
      let dataToInsert = { ...apartmentData };
      let { data: newApt, error } = await supabase
        .from("apartments")
        .insert([dataToInsert])
        .select("id")
        .single();

      if (error) {
        console.warn("Initial insert error:", error.message);
        delete dataToInsert.monthly_lease_cost;
        delete dataToInsert.owner_name;
        delete dataToInsert.owner_phone;
        delete dataToInsert.lease_payment_day;

        const res = await supabase
          .from("apartments")
          .insert([dataToInsert])
          .select("id")
          .single();

        newApt = res.data;
        error = res.error;
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

        const publicUrl = await uploadImage(fileName, buffer, fileObj.type || "image/jpeg");
        uploadedUrls.push(publicUrl);
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
