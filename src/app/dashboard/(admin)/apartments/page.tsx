import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { D, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Image as ImageIcon } from "lucide-react";
import DeleteButton from "./DeleteButton";

export const revalidate = 0; // Dynamic rendering

const formatPrice = (amount: number) => {
  return `$${Number(amount).toLocaleString("en-US")}`;
};

export default async function ApartmentsPage() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

  const { data: apartments, error } = await supabase
    .from("apartments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-[8px] bg-red-950/50 p-4 text-[14px] text-red-400 border border-red-900/50">
        {lang === "uz" ? "Ma'lumotlarni yuklashda xatolik yuz berdi" : lang === "ru" ? "Ошибка при загрузке данных" : "Error loading data"}: {error.message}
      </div>
    );
  }

  const t = lang === "uz" ? {
    subtitle: "Ijara obyektlarini boshqarish",
    add: "Yangi qo'shish",
    img: "Rasm",
    nameDesc: "Nomi / Manzil",
    floorArea: "Qavat & Maydon",
    rooms: "Xonalar",
    price: "Kunlik narxi",
    status: "Status",
    actions: "Amallar",
    noView: "Manzara ko'rsatilmagan",
    noFloor: "Ko'rsatilmagan",
    floorStr: "qavat",
    roomStr: "xona",
    guestStr: "kishi",
    active: "Faol",
    inactive: "Nofaol",
    empty: "Kvartiralar mavjud emas. Yangi qo'shing!"
  } : lang === "ru" ? {
    subtitle: "Управление объектами аренды",
    add: "Добавить новый",
    img: "Фото",
    nameDesc: "Название / Адрес",
    floorArea: "Этаж & Площадь",
    rooms: "Комнаты",
    price: "Цена за сутки",
    status: "Статус",
    actions: "Действия",
    noView: "Вид не указан",
    noFloor: "Не указан",
    floorStr: "этаж",
    roomStr: "комн.",
    guestStr: "чел.",
    active: "Активен",
    inactive: "Неактивен",
    empty: "Апартаментов нет. Добавьте новый!"
  } : {
    subtitle: "Manage rental properties",
    add: "Add New",
    img: "Image",
    nameDesc: "Name / Address",
    floorArea: "Floor & Area",
    rooms: "Rooms",
    price: "Daily price",
    status: "Status",
    actions: "Actions",
    noView: "View not specified",
    noFloor: "Not specified",
    floorStr: "floor",
    roomStr: "rooms",
    guestStr: "guests",
    active: "Active",
    inactive: "Inactive",
    empty: "No apartments found. Add new!"
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{d.apartments.title}</h1>
          <p className="text-[14px] text-[#A8A49B] mt-2 font-light">{t.subtitle}</p>
        </div>
        <Link href="/dashboard/apartments/new">
          <Button className="bg-[#C5A46D] text-[#0B0D0F] font-semibold hover:bg-[#D4B77F] h-11 px-6 rounded-[8px] tracking-wide text-[14px]">
            <Plus className="mr-2 h-4 w-4" /> {t.add}
          </Button>
        </Link>
      </div>

      <div className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#0B0D0F]/50 border-b border-[rgba(197,164,109,0.14)]">
            <TableRow className="hover:bg-transparent border-[rgba(197,164,109,0.14)]">
              <TableHead className="w-[100px] text-[#A8A49B] font-semibold text-[12px] uppercase tracking-[0.1em]">{t.img}</TableHead>
              <TableHead className="text-[#A8A49B] font-semibold text-[12px] uppercase tracking-[0.1em]">{t.nameDesc}</TableHead>
              <TableHead className="text-[#A8A49B] font-semibold text-[12px] uppercase tracking-[0.1em]">{t.floorArea}</TableHead>
              <TableHead className="text-[#A8A49B] font-semibold text-[12px] uppercase tracking-[0.1em]">{t.rooms}</TableHead>
              <TableHead className="text-[#A8A49B] font-semibold text-[12px] uppercase tracking-[0.1em]">{t.price}</TableHead>
              <TableHead className="text-[#A8A49B] font-semibold text-[12px] uppercase tracking-[0.1em]">{t.status}</TableHead>
              <TableHead className="text-right text-[#A8A49B] font-semibold text-[12px] uppercase tracking-[0.1em]">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apartments && apartments.length > 0 ? (
              apartments.map((apt) => (
                <TableRow key={apt.id} className="border-[rgba(197,164,109,0.14)] hover:bg-[#C5A46D]/5 transition-colors">
                  <TableCell>
                    {apt.cover_image ? (
                      <div className="relative h-14 w-20 overflow-hidden rounded-[6px] border border-[rgba(197,164,109,0.22)]">
                        <img
                          src={apt.cover_image}
                          alt={apt.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-[6px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#A8A49B]">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-[15px] text-[#F5F2EB]">{apt.title}</div>
                    <div className="text-[12px] text-[#A8A49B] truncate max-w-xs mt-1 font-light">{apt.view || t.noView}</div>
                  </TableCell>
                  <TableCell className="text-[#F5F2EB]/90 text-[14px]">
                    {apt.floor ? `${apt.floor}-${t.floorStr}` : t.noFloor} / {apt.area_m2} m²
                  </TableCell>
                  <TableCell className="text-[#F5F2EB]/90 text-[14px]">
                    {apt.rooms} {t.roomStr} ({apt.max_guests} {t.guestStr})
                  </TableCell>
                  <TableCell className="font-medium text-[15px] text-[#C5A46D]">
                    {formatPrice(apt.price_per_day)}
                  </TableCell>
                  <TableCell>
                    {apt.status === "active" ? (
                      <Badge className="bg-[#C5A46D]/10 text-[#C5A46D] hover:bg-[#C5A46D]/10 border border-[#C5A46D]/30 font-medium tracking-wide">
                        {t.active}
                      </Badge>
                    ) : (
                      <Badge className="bg-[#0B0D0F] text-[#A8A49B] hover:bg-[#0B0D0F] border border-[rgba(197,164,109,0.4)] font-medium tracking-wide">
                        {t.inactive}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <Link href={`/dashboard/apartments/${apt.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#A8A49B] hover:text-[#C5A46D] hover:bg-[#C5A46D]/10 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteButton id={apt.id} title={apt.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[#A8A49B] font-light text-[15px]">
                  {t.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
