"use client";

import { useState, useTransition } from "react";
import { toggleStaffActive, deleteStaff } from "./actions";
import { toast } from "@/components/ui/toast";
import { useDashLang } from "@/components/DashboardLangProvider";
import { Loader2, Power, Trash2 } from "lucide-react";

/**
 * Xodim kartasidagi amallar (faqat shef ko'radi):
 *  - Faollashtirish / Nofaol qilish (ishdan bo'shatilgan xodim tarixi saqlanadi)
 *  - Butunlay o'chirish (tasdiq bilan)
 */
export default function StaffCardActions({
  id,
  name,
  active,
  isShef,
}: {
  id: string;
  name: string;
  active: boolean;
  isShef: boolean;
}) {
  const d = useDashLang();
  const isRu = d.lang === "ru";
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!isShef) return null; // faqat shef boshqaradi

  const doToggle = () =>
    start(async () => {
      const res = await toggleStaffActive(id, !active);
      if (!res.success) toast(res.error || (isRu ? "Ошибка" : "Xatolik"));
      else toast(active ? (isRu ? "Сотрудник деактивирован" : "Xodim nofaol qilindi") : (isRu ? "Сотрудник активирован" : "Xodim faollashtirildi"), "success");
    });

  const doDelete = () =>
    start(async () => {
      const res = await deleteStaff(id);
      if (!res.success) toast(res.error || (isRu ? "Ошибка" : "Xatolik"));
      else toast(isRu ? "Сотрудник удалён" : "Xodim o'chirildi", "success");
      setConfirming(false);
    });

  if (confirming) {
    return (
      <div className="flex items-center gap-2 pt-3 border-t border-[rgba(197,164,109,0.1)]">
        <span className="text-[12px] text-[#A8A49B] flex-1">{isRu ? `Удалить ${name}?` : `${name} o'chirilsinmi?`}</span>
        <button
          onClick={doDelete}
          disabled={pending}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-[6px] bg-red-500/15 text-red-400 border border-red-500/30 text-[12px] font-medium hover:bg-red-500 hover:text-white transition-colors active:scale-95"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          {isRu ? "Да, удалить" : "Ha, o'chir"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="h-8 px-3 rounded-[6px] border border-[rgba(197,164,109,0.22)] text-[#A8A49B] text-[12px] hover:text-[#F5F2EB] transition-colors active:scale-95"
        >
          {d.common.cancel}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-[rgba(197,164,109,0.1)]">
      <button
        onClick={doToggle}
        disabled={pending}
        className={`inline-flex items-center justify-center gap-1.5 flex-1 h-8 rounded-[6px] border text-[12px] font-medium transition-colors active:scale-95 ${
          active
            ? "border-[rgba(197,164,109,0.22)] text-[#A8A49B] hover:text-amber-400 hover:border-amber-500/30"
            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        }`}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
        {active ? (isRu ? "Деактивировать" : "Nofaol qilish") : (isRu ? "Активировать" : "Faollashtirish")}
      </button>
      <button
        onClick={() => setConfirming(true)}
        disabled={pending}
        aria-label={isRu ? "Удалить" : "O'chirish"}
        title={isRu ? "Удалить" : "O'chirish"}
        className="inline-flex items-center justify-center h-8 w-8 rounded-[6px] border border-red-500/25 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors active:scale-95"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
