"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createManualLead } from "./actions";
import { Loader2, Plus, UserPlus, ChevronDown } from "lucide-react";
import { btnPrimary } from "@/lib/ui";

const inputCls =
  "w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors placeholder:text-[#A8A49B]/40";
const labelCls = "text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]";

// Murojaat qayerdan kelgani (manba)
const SOURCES: { v: string; l: string }[] = [
  { v: "instagram", l: "Instagram" },
  { v: "telegram", l: "Telegram" },
  { v: "whatsapp", l: "WhatsApp" },
  { v: "telefon", l: "Telefon qo'ng'irog'i" },
  { v: "kelib", l: "O'zi kelib" },
  { v: "boshqa", l: "Boshqa" },
];

export default function AddLeadForm({ isRu }: { isRu: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", source: "instagram", telegram: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr("");
    const res = await createManualLead(f);
    setSaving(false);
    if (res.success) {
      setF({ name: "", phone: "", source: f.source, telegram: "", message: "" });
      setOpen(false);
      router.refresh();
    } else setErr(res.error || (isRu ? "Ошибка" : "Xatolik"));
  };

  return (
    <div className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] overflow-hidden">
      {/* Ochish/yopish sarlavha */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#C5A46D]/5 transition-colors"
      >
        <span className="inline-flex items-center gap-2.5 text-[15px] font-medium text-[#F5F2EB]">
          <UserPlus className="h-4 w-4 text-[#C5A46D]" />
          {isRu ? "Добавить заявку вручную" : "Qo'lda murojaat qo'shish"}
          <span className="text-[12px] text-[#A8A49B] font-light hidden sm:inline">
            {isRu ? "(Instagram, звонок, WhatsApp...)" : "(Instagram, qo'ng'iroq, WhatsApp...)"}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-[#A8A49B] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form onSubmit={submit} className="px-5 pb-5 pt-1 space-y-4 border-t border-[rgba(197,164,109,0.1)]">
          {err && <div className="rounded-[8px] bg-red-950/40 p-3 text-red-400 border border-red-900/50 text-[13px]">{err}</div>}

          <div className="grid md:grid-cols-3 gap-4 pt-3">
            <div className="space-y-1.5">
              <label className={labelCls}>{isRu ? "Имя" : "Ism"} *</label>
              <input value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} required />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>{isRu ? "Телефон" : "Telefon"} *</label>
              <input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998" className={inputCls} required />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>{isRu ? "Источник" : "Manba (qayerdan)"}</label>
              <select value={f.source} onChange={(e) => set("source", e.target.value)} className={inputCls}>
                {SOURCES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Telegram/Instagram username</label>
              <input value={f.telegram} onChange={(e) => set("telegram", e.target.value)} placeholder="@username (ixtiyoriy)" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>{isRu ? "Сообщение / заметка" : "Xabar / izoh"}</label>
              <input value={f.message} onChange={(e) => set("message", e.target.value)} placeholder={isRu ? "Что хочет клиент..." : "Mijoz nimani xohlaydi..."} className={inputCls} />
            </div>
          </div>

          <button type="submit" disabled={saving} className={`${btnPrimary} h-11 px-6 text-[14px] gap-2`}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isRu ? "Добавить в CRM" : "CRM ga qo'shish"}
          </button>
        </form>
      )}
    </div>
  );
}
