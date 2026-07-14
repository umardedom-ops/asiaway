"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus } from "./actions";
import { format } from "date-fns";
import { CalendarPlus, LogIn, Phone, MessageSquare, Save, Loader2 } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import { useDashLang } from "@/components/DashboardLangProvider";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-[#C5A46D]/10 text-[#C5A46D] border-[#C5A46D]/25",
  waiting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/20",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LeadRow({ lead }: { lead: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status || "new");
  const [notes, setNotes] = useState(lead.notes || "");
  const [isPending, startTransition] = useTransition();
  const d = useDashLang();

  const STATUS_LABELS: Record<string, string> = {
    new: d.crm.status === "Status" ? "Yangi" : "Новый", 
    contacted: d.crm.status === "Status" ? "Suhbatlashildi" : "Связались", 
    waiting: d.crm.status === "Status" ? "Kutmoqda" : "Ожидает", 
    won: d.crm.status === "Status" ? "Muvaffaqiyatli" : "Успешно", 
    lost: d.crm.status === "Status" ? "Rad etdi" : "Отказ",
  };

  const handleUpdate = () => startTransition(async () => { await updateLeadStatus(lead.id, status, notes); });

  // CRM → Bron yoki Joylashtirish (mijoz ma'lumoti bilan to'ldirilgan holda ochiladi)
  const goToBooking = (place: boolean) => {
    const q = new URLSearchParams({ lead: lead.id, name: lead.name || "", phone: lead.phone || "" });
    if (place) q.set("place", "1");
    router.push(`/dashboard/bookings/new?${q.toString()}`);
  };

  return (
    <div className="bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[12px] overflow-hidden hover:border-[rgba(197,164,109,0.3)] transition-colors">
      {/* Yuqori qism: ism + holat */}
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div className="min-w-0">
          <h3 className="text-[17px] font-heading font-medium text-[#F5F2EB]">{lead.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[13px] text-[#A8A49B]">
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#C5A46D]" /> {lead.phone}</span>
            {lead.whatsapp && <span>WA: {lead.whatsapp}</span>}
            {lead.telegram && <span>TG: {lead.telegram}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLE[status] || STATUS_STYLE.new}`}>
            {STATUS_LABELS[status] || status}
          </span>
          <div className="text-[11px] text-[#A8A49B] mt-2">{format(new Date(lead.created_at), "dd MMM yyyy, HH:mm")}</div>
          <div className="text-[11px] text-[#C5A46D] mt-0.5 capitalize">{d.crm.source}: {lead.source || "Sayt"}</div>
        </div>
      </div>

      {lead.message && (
        <div className="mx-5 mb-4 flex gap-2.5 bg-[#0B0D0F] p-3.5 rounded-[8px] border border-[rgba(197,164,109,0.08)]">
          <MessageSquare className="h-4 w-4 text-[#C5A46D]/60 shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#A8A49B] leading-relaxed italic">{lead.message}</p>
        </div>
      )}

      {/* Pastki panel: holat + eslatma + amallar */}
      <div className="border-t border-[rgba(197,164,109,0.1)] bg-[#0B0D0F]/40 p-4 flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.crm.status}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 bg-[#111417] border border-[rgba(197,164,109,0.22)] text-[#F5F2EB] rounded-[8px] px-3 text-[13.5px] focus:outline-none focus:border-[#C5A46D]">
              <option value="new">{STATUS_LABELS.new}</option>
              <option value="contacted">{STATUS_LABELS.contacted}</option>
              <option value="waiting">{STATUS_LABELS.waiting}</option>
              <option value="won">{STATUS_LABELS.won}</option>
              <option value="lost">{STATUS_LABELS.lost}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.crm.note}</label>
            <div className="flex gap-2">
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="..."
                className="flex-1 h-10 bg-[#111417] border border-[rgba(197,164,109,0.22)] text-[#F5F2EB] rounded-[8px] px-3 text-[13.5px] focus:outline-none focus:border-[#C5A46D] placeholder:text-[#A8A49B]/40" />
              <button onClick={handleUpdate} disabled={isPending} title={d.common.save}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[8px] border border-[rgba(197,164,109,0.22)] text-[#A8A49B] hover:text-[#C5A46D] hover:border-[#C5A46D]/50 transition-colors">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Amallar — HAR HOLATDA ko'rinadi */}
        <div className="flex gap-2 shrink-0">
          <button onClick={() => goToBooking(false)} className={`${btnPrimary} h-10 px-4 text-[12.5px] gap-1.5`}>
            <CalendarPlus className="h-3.5 w-3.5" /> {d.reception.tabs.bookings}
          </button>
          <button onClick={() => goToBooking(true)} className={`${btnSecondary} h-10 px-4 text-[12.5px] gap-1.5`}>
            <LogIn className="h-3.5 w-3.5" /> {d.reception.tabs.placement}
          </button>
        </div>
      </div>
    </div>
  );
}
