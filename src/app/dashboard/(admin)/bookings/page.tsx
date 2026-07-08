import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import BookingRowActions from "./BookingRowActions";

export const revalidate = 0; // Dynamic rendering

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default async function BookingsPage() {
  const supabase = await createClient();

  // Bookinglarni kvartira nomi bilan birga tortamiz
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, apartments(title)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
        Ma&apos;lumotlarni yuklashda xatolik yuz berdi: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Bronlar ro&apos;yxati</h1>
        <p className="text-zinc-400 mt-1">Mijozlar tomonidan amalga oshirilgan online buyurtmalar va to&apos;lovlar boshqaruvi</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950/50 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-400">Mehmon</TableHead>
              <TableHead className="text-zinc-400">Apartament</TableHead>
              <TableHead className="text-zinc-400">Kelish - Ketish</TableHead>
              <TableHead className="text-zinc-400">Muddati</TableHead>
              <TableHead className="text-zinc-400">Umumiy narxi</TableHead>
              <TableHead className="text-zinc-400">Zaklat holati</TableHead>
              <TableHead className="text-zinc-400">Bron holati</TableHead>
              <TableHead className="text-right text-zinc-400">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => {
                const aptTitle = booking.apartments?.title || "O'chirilgan kvartira";
                return (
                  <TableRow key={booking.id} className="border-zinc-800 hover:bg-zinc-800/20">
                    <TableCell>
                      <div className="font-semibold text-white">{booking.guest_name}</div>
                      <div className="text-xs text-zinc-500">{booking.guest_phone}</div>
                      {booking.guest_email && (
                        <div className="text-[10px] text-zinc-600">{booking.guest_email}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-300 max-w-xs truncate" title={aptTitle}>
                        {aptTitle}
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">
                      {formatDate(booking.check_in)} — {formatDate(booking.check_out)}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {booking.nights} kecha
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-white">{formatPrice(booking.total_price)}</div>
                      <div className="text-[10px] text-zinc-500">Zaklat: {formatPrice(booking.deposit_amount)}</div>
                    </TableCell>
                    <TableCell>
                      {booking.deposit_status === "paid" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20">
                          To&apos;langan
                        </Badge>
                      ) : booking.deposit_status === "refunded" ? (
                        <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20">
                          Qaytarilgan
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/10 border border-amber-500/20">
                          Kutilmoqda
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.booking_status === "confirmed" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20">
                          Tasdiqlangan
                        </Badge>
                      ) : booking.booking_status === "cancelled" ? (
                        <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/10 border border-red-500/20">
                          Bekor qilingan
                        </Badge>
                      ) : booking.booking_status === "completed" ? (
                        <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20">
                          Yakunlangan
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/10 border border-amber-500/20">
                          Kutilmoqda
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <BookingRowActions
                        id={booking.id}
                        bookingStatus={booking.booking_status}
                        depositStatus={booking.deposit_status}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-zinc-500">
                  Bronlar mavjud emas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
