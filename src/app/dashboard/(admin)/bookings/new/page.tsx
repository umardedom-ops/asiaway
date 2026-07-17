import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ManualBookingForm from "../ManualBookingForm";
import { sourceToChannel } from "../channels";
import { getDashDict } from "@/lib/dash-lang";

export const revalidate = 0;

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; name?: string; phone?: string; telegram?: string; place?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const d = await getDashDict();

  const { data: apartments } = await supabase
    .from("apartments")
    .select("id, title, price_per_day, deposit_amount")
    .order("floor", { ascending: false });

  // CRM'dan kelgan bo'lsa — leadning TO'LIQ yozuvini olamiz (hech narsa yo'qolmasin:
  // source, utm_data, izoh/xabar, email — hammasi bronga ko'chadi).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lead: any = null;
  if (sp.lead) {
    const { data } = await supabase.from("leads").select("*").eq("id", sp.lead).maybeSingle();
    lead = data;
  }

  const prefill = {
    leadId: sp.lead || "",
    name: lead?.name || sp.name || "",
    phone: lead?.phone || sp.phone || "",
    email: lead?.email || "",
    channel: lead ? sourceToChannel(lead.source) : undefined,
    source: lead?.source || undefined,
    utm_data: lead?.utm_data ?? undefined,
    notes: [lead?.notes, lead?.message].filter(Boolean).join(" | ") || "",
    place: sp.place === "1",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-5">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-[rgba(197,164,109,0.22)] bg-transparent hover:bg-[rgba(197,164,109,0.08)] text-[#A8A49B] hover:text-[#C5A46D] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">
            {prefill.place ? d.newBookingPage.placeTitle : d.newBookingPage.manualTitle}
          </h1>
          <p className="text-[14px] text-[#A8A49B] mt-1 font-light">
            {prefill.leadId
              ? `${d.newBookingPage.crmClient} (${prefill.name}) — ${d.newBookingPage.chooseDates}`
              : d.newBookingPage.manualSub}
          </p>
        </div>
      </div>

      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardContent className="p-8">
          <ManualBookingForm apartments={apartments ?? []} prefill={prefill} />
        </CardContent>
      </Card>
    </div>
  );
}
