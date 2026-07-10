"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "./actions";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function LeadRow({ lead }: { lead: any }) {
  const [status, setStatus] = useState(lead.status || "new");
  const [notes, setNotes] = useState(lead.notes || "");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      await updateLeadStatus(lead.id, status, notes);
    });
  };

  const STATUS_LABELS: Record<string, string> = {
    new: "Yangi",
    contacted: "Suhbatlashildi",
    waiting: "Kutmoqda",
    won: "Muvaffaqiyatli",
    lost: "Rad etdi",
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "new": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "contacted": return "text-[#C5A46D] bg-[#C5A46D]/10 border-[#C5A46D]/20";
      case "waiting": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "won": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "lost": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-[#A8A49B] bg-[#A8A49B]/10 border-[#A8A49B]/20";
    }
  };

  return (
    <div className="bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#C5A46D]/30 transition-colors">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[18px] font-heading font-medium text-[#F5F2EB]">{lead.name}</h3>
            <div className="text-[14px] text-[#A8A49B] flex items-center space-x-3 mt-1">
              <span>{lead.phone}</span>
              {lead.whatsapp && <span>• WA: {lead.whatsapp}</span>}
              {lead.telegram && <span>• TG: {lead.telegram}</span>}
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded border ${getStatusColor(status)}`}>
              {STATUS_LABELS[status] || status}
            </span>
            <div className="text-[12px] text-[#A8A49B] mt-2">
              {format(new Date(lead.created_at), "dd MMM yyyy, HH:mm")}
            </div>
            <div className="text-[12px] text-[#C5A46D] mt-1 capitalize font-medium tracking-wide">
              Manba: {lead.source || "Sayt"}
            </div>
          </div>
        </div>

        {lead.message && (
          <div className="bg-[#0B0D0F] p-4 rounded-lg border border-[rgba(197,164,109,0.08)]">
            <p className="text-[14px] text-[#A8A49B] leading-relaxed italic">&quot;{lead.message}&quot;</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A8A49B] uppercase tracking-wider">Mijoz holati</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 bg-[#0B0D0F] border border-[rgba(197,164,109,0.22)] text-[#F5F2EB] rounded-[8px] px-3 focus:outline-none focus:border-[#C5A46D] transition-colors"
            >
              <option value="new">Yangi</option>
              <option value="contacted">Suhbatlashildi</option>
              <option value="waiting">Kutmoqda</option>
              <option value="won">Muvaffaqiyatli</option>
              <option value="lost">Rad etdi</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A8A49B] uppercase tracking-wider">Eslatma (Notes)</label>
            <div className="flex space-x-3">
              <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mijoz haqida xulosa..."
                className="flex-1 h-11 bg-[#0B0D0F] border border-[rgba(197,164,109,0.22)] text-[#F5F2EB] rounded-[8px] px-4 focus:outline-none focus:border-[#C5A46D] transition-colors placeholder:text-[#A8A49B]/40"
              />
              <Button 
                onClick={handleUpdate}
                disabled={isPending}
                className="bg-[#C5A46D] text-[#0B0D0F] hover:bg-[#D4B77F] h-11 px-6 font-semibold"
              >
                {isPending ? "..." : "Saqlash"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
