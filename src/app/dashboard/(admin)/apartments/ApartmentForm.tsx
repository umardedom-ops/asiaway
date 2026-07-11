"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveApartment } from "@/app/dashboard/apartments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AMENITY_LABELS } from "@/lib/seed-data";
import { Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface ApartmentFormProps {
  initialData?: any; // Edit bo'layotganda to'ldiriladi
}

export default function ApartmentForm({ initialData }: ApartmentFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveApartment, null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.cover_image || null);
  const [existingImages, setExistingImages] = useState<any[]>(initialData?.apartment_images || []);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleRemoveExistingImage = (id: string) => {
    setDeletedImageIds((prev) => [...prev, id]);
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setGalleryPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard/apartments");
    }
  }, [state, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center space-x-5">
        <Link href="/dashboard/apartments">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-[rgba(197,164,109,0.22)] bg-transparent hover:bg-[rgba(197,164,109,0.08)] text-[#A8A49B] hover:text-[#C5A46D] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">
            {initialData ? "Apartamentni tahrirlash" : "Yangi apartament qo'shish"}
          </h1>
          <p className="text-[14px] text-[#A8A49B] mt-1 font-light">
            Nest One binosidagi ijaraga beriladigan obyekt ma&apos;lumotlarini kiriting
          </p>
        </div>
      </div>

      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardContent className="p-8">
          <form action={formAction} className="space-y-10">
            {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
            {initialData?.cover_image && (
              <input type="hidden" name="existing_cover_image" value={initialData.cover_image} />
            )}

            {/* Error Message */}
            {state?.error && (
              <div className="rounded-[8px] bg-red-950/40 p-4 text-red-400 border border-red-900/50 text-[14px]">
                Xatolik yuz berdi: {state.error}
              </div>
            )}

            <div className="grid gap-10 md:grid-cols-2">
              {/* Asosiy ma'lumotlar */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Apartament nomi (Sarlavha)</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={initialData?.title}
                    placeholder="Masalan: 34-qavat | 78 m² | Premium Penthouse"
                    required
                    className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] placeholder:text-[#A8A49B]/50 focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Tavsif (Description)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={initialData?.description}
                    placeholder="Kvartira haqida to'liqroq ma'lumotlar..."
                    rows={4}
                    className="rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] placeholder:text-[#A8A49B]/50 focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30 resize-none pt-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Manzil</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={initialData?.address || "Botir Zokirov ko'chasi 1A/1"}
                      required
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="district" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Tuman/Zona</Label>
                    <Input
                      id="district"
                      name="district"
                      defaultValue={initialData?.district || "Tashkent City"}
                      required
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="rooms" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Xonalar soni</Label>
                    <Input
                      id="rooms"
                      name="rooms"
                      type="number"
                      min={1}
                      defaultValue={initialData?.rooms || 2}
                      required
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="floor" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Qavati</Label>
                    <Input
                      id="floor"
                      name="floor"
                      type="number"
                      defaultValue={initialData?.floor}
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="area_m2" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Maydoni (m²)</Label>
                    <Input
                      id="area_m2"
                      name="area_m2"
                      type="number"
                      min={1}
                      defaultValue={initialData?.area_m2}
                      required
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="max_guests" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Maks. mehmonlar</Label>
                    <Input
                      id="max_guests"
                      name="max_guests"
                      type="number"
                      min={1}
                      defaultValue={initialData?.max_guests || 4}
                      required
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Status</Label>
                    <Select name="status" defaultValue={initialData?.status || "active"}>
                      <SelectTrigger className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus:border-[#C5A46D] focus:ring-[#C5A46D]/30">
                        <SelectValue placeholder="Statusni tanlang" />
                      </SelectTrigger>
                      <SelectContent className="border-[rgba(197,164,109,0.14)] bg-[#111417] text-[#F5F2EB]">
                        <SelectItem value="active" className="focus:bg-[#0B0D0F] focus:text-[#C5A46D]">Faol</SelectItem>
                        <SelectItem value="inactive" className="focus:bg-[#0B0D0F] focus:text-[#C5A46D]">Nofaol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Rasm va Narxlar */}
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="price_per_day" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Kunlik narxi ($)</Label>
                    <Input
                      id="price_per_day"
                      name="price_per_day"
                      type="number"
                      min={0}
                      defaultValue={initialData?.price_per_day}
                      required
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#C5A46D] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30 font-medium text-[16px]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="price_per_month" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Oylik narxi ($)</Label>
                    <Input
                      id="price_per_month"
                      name="price_per_month"
                      type="number"
                      min={0}
                      defaultValue={initialData?.price_per_month}
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#C5A46D] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30 font-medium text-[16px]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="deposit_amount" className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Zarur zaklat ($)</Label>
                    <Input
                      id="deposit_amount"
                      name="deposit_amount"
                      type="number"
                      min={0}
                      defaultValue={initialData?.deposit_amount || 200}
                      required
                      className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#C5A46D] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30 font-medium text-[16px]"
                    />
                  </div>
                </div>

                {/* Tan narx (biz egaga to'laydigan oylik) — foyda hisobi uchun */}
                <div className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#0B0D0F]/40 p-5 space-y-4">
                  <div className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Tan narx · Ega ma&apos;lumoti</div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="monthly_lease_cost" className="text-[11px] text-[#A8A49B] uppercase tracking-[0.08em] font-semibold">Egaga oylik ($)</Label>
                      <Input
                        id="monthly_lease_cost"
                        name="monthly_lease_cost"
                        type="number"
                        min={0}
                        defaultValue={initialData?.monthly_lease_cost || 0}
                        className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30 font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="owner_name" className="text-[11px] text-[#A8A49B] uppercase tracking-[0.08em] font-semibold">Ega ismi</Label>
                      <Input
                        id="owner_name"
                        name="owner_name"
                        defaultValue={initialData?.owner_name || ""}
                        placeholder="Ixtiyoriy"
                        className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="owner_phone" className="text-[11px] text-[#A8A49B] uppercase tracking-[0.08em] font-semibold">Ega telefoni</Label>
                      <Input
                        id="owner_phone"
                        name="owner_phone"
                        defaultValue={initialData?.owner_phone || ""}
                        placeholder="+998"
                        className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] focus-visible:border-[#C5A46D] focus-visible:ring-[#C5A46D]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Rasm yuklash */}
                <div className="space-y-3">
                  <Label className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Asosiy muqova rasmi (Cover Image)</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(197,164,109,0.22)] rounded-[12px] p-8 bg-[#0B0D0F]/50 hover:bg-[#0B0D0F] transition-colors">
                    {imagePreview ? (
                      <div className="space-y-5 w-full">
                        <div className="relative h-48 w-full overflow-hidden rounded-[8px] border border-[rgba(197,164,109,0.14)]">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImagePreview(null)}
                          className="w-full h-11 border-[rgba(197,164,109,0.22)] hover:bg-red-950/40 text-[#A8A49B] hover:text-red-400 hover:border-red-900/50 rounded-[8px] transition-colors"
                        >
                          Rasmni olib tashlash
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-[#A8A49B]/50" />
                        <div className="mt-5 flex items-center justify-center text-[14px] text-[#A8A49B]">
                          <label
                            htmlFor="cover_image_file"
                            className="relative cursor-pointer rounded-[4px] font-semibold text-[#C5A46D] hover:text-[#D4B77F] focus-within:outline-none"
                          >
                            <span>Rasm yuklash</span>
                            <input
                              id="cover_image_file"
                              name="cover_image_file"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-2">yoki sudrab kelib tashlang</p>
                        </div>
                        <p className="text-[11px] text-[#A8A49B]/50 mt-2 font-light">PNG, JPG, WEBP formats up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qo'shimcha rasmlar (Galereya) */}
                <div className="space-y-4">
                  <Label className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Qo'shimcha rasmlar (Galereya)</Label>
                  
                  {/* Deleted images tracking */}
                  {deletedImageIds.map((id) => (
                    <input key={id} type="hidden" name="deleted_image_ids" value={id} />
                  ))}

                  {/* Previews grid of existing and new previews */}
                  {(existingImages.length > 0 || galleryPreviews.length > 0) && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Existing database images */}
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative h-28 w-full group overflow-hidden rounded-[8px] border border-[rgba(197,164,109,0.14)] bg-[#0B0D0F]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="Gallery" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(img.id)}
                            className="absolute top-2 right-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 rounded-full w-6 h-6 flex items-center justify-center text-[10px] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {/* Newly selected images */}
                      {galleryPreviews.map((url, idx) => (
                        <div key={idx} className="relative h-28 w-full group overflow-hidden rounded-[8px] border border-[rgba(197,164,109,0.14)] bg-[#0B0D0F]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="New Preview" className="h-full w-full object-cover opacity-70" />
                          <div className="absolute inset-0 bg-[#0B0D0F]/40 flex items-center justify-center">
                            <span className="text-[10px] text-[#C5A46D] font-semibold bg-[#111417] px-2 py-0.5 rounded border border-[rgba(197,164,109,0.2)]">Yangi</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload input */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(197,164,109,0.22)] rounded-[12px] p-6 bg-[#0B0D0F]/50 hover:bg-[#0B0D0F] transition-colors">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-[#A8A49B]/50" />
                      <div className="mt-3 flex items-center justify-center text-[13px] text-[#A8A49B]">
                        <label
                          htmlFor="gallery_files"
                          className="relative cursor-pointer rounded-[4px] font-semibold text-[#C5A46D] hover:text-[#D4B77F] focus-within:outline-none"
                        >
                          <span>Galereyaga rasm qo'shish</span>
                          <input
                            id="gallery_files"
                            name="gallery_files"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleGalleryChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-[#A8A49B]/50 mt-1 font-light">Bir nechta rasm tanlashingiz mumkin</p>
                    </div>
                  </div>
                </div>

                {/* Qulayliklar (Amenities) */}
                <div className="space-y-4">
                  <Label className="text-[12px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Qulayliklar (Amenities)</Label>
                  <div className="grid grid-cols-2 gap-4 bg-[#0B0D0F] p-5 rounded-[12px] border border-[rgba(197,164,109,0.14)] max-h-56 overflow-y-auto custom-scrollbar">
                    {Object.entries(AMENITY_LABELS).map(([key, label]) => {
                      const isChecked = initialData?.amenities?.some(
                        (a: string) => a.toLowerCase() === key.toLowerCase()
                      );
                      return (
                        <label key={key} className="flex items-center space-x-3 cursor-pointer text-[14px] text-[#A8A49B] hover:text-[#F5F2EB] group transition-colors">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              name="amenities"
                              value={key}
                              defaultChecked={isChecked}
                              className="h-5 w-5 rounded-[4px] border-[rgba(197,164,109,0.4)] bg-[#111417] text-[#C5A46D] focus:ring-[#C5A46D] focus:ring-offset-[#0B0D0F] cursor-pointer"
                            />
                          </div>
                          <span className="font-light">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-[rgba(197,164,109,0.14)]">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#C5A46D] text-[#0B0D0F] font-semibold tracking-wide hover:bg-[#D4B77F] disabled:bg-[rgba(197,164,109,0.2)] disabled:text-[#A8A49B] h-12 px-10 rounded-[8px] text-[15px] transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saqlanmoqda...
                  </>
                ) : (
                  "Saqlash"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
