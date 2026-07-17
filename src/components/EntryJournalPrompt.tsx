"use client";

import { useEffect, useState } from "react";
import { logDashboardEntry } from "@/app/dashboard/(admin)/journal/actions";
import { useDashLang } from "@/components/DashboardLangProvider";
import { btnPrimary } from "@/lib/ui";
import { Loader2, ShieldCheck } from "lucide-react";

const FLAG = "aw-entry-logged";

/**
 * Kirish anketasi (bir brauzer-sessiyada bir marta): Ism + qisqa maqsad.
 * Rol/vaqt/qurilma server tomonda avtomatik yoziladi, shef botiga xabar boradi.
 * Shef o'zi uchun chiqmaydi.
 */
export default function EntryJournalPrompt({ role }: { role: string | null }) {
  const d = useDashLang();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role === "shef" || !role) return; // shef uchun anketa shart emas
    try {
      if (!sessionStorage.getItem(FLAG)) setOpen(true);
    } catch { /* sessionStorage yo'q bo'lsa jim */ }
  }, [role]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await logDashboardEntry({ name, purpose });
    } catch { /* jurnal hech qachon ishni bloklamasin */ }
    try { sessionStorage.setItem(FLAG, "1"); } catch { /* ignore */ }
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0B0D0F]/80 backdrop-blur-sm p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-[380px] rounded-[14px] border border-[rgba(197,164,109,0.25)] bg-[#111417] p-6 space-y-4 shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-[#C5A46D]" />
          <h2 className="text-[18px] font-heading font-medium text-[#F5F2EB]">{d.journal.title}</h2>
        </div>
        <p className="text-[12.5px] text-[#A8A49B] font-light">{d.journal.subtitle}</p>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.journal.who} *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={d.journal.enterName}
            required
            autoFocus
            className="w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors placeholder:text-[#A8A49B]/40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.journal.purpose}</label>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder={d.journal.enterPurpose}
            className="w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors placeholder:text-[#A8A49B]/40"
          />
        </div>

        <button type="submit" disabled={saving || !name.trim()} className={`${btnPrimary} w-full h-11 text-[14px] gap-2`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {d.journal.submit}
        </button>
      </form>
    </div>
  );
}
