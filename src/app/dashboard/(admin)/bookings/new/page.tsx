import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ManualBookingForm from "../ManualBookingForm";

export const revalidate = 0;

export default async function NewBookingPage() {
  const supabase = await createClient();
  const { data: apartments } = await supabase
    .from("apartments")
    .select("id, title")
    .order("floor", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-5">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-[rgba(197,164,109,0.22)] bg-transparent hover:bg-[rgba(197,164,109,0.08)] text-[#A8A49B] hover:text-[#C5A46D] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Qo&apos;lда bron qo&apos;shish</h1>
          <p className="text-[14px] text-[#A8A49B] mt-1 font-light">Airbnb, Booking, Instagram, WhatsApp yoki telefon orqali kelgan bronni kiriting.</p>
        </div>
      </div>

      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardContent className="p-8">
          <ManualBookingForm apartments={apartments ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
