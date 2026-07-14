"use client";

import { useState } from "react";
import { addExpense } from "./actions";
import { Loader2, Plus } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import { useDashLang } from "@/components/DashboardLangProvider";

export const EXPENSE_CATEGORIES: Record<string, string> = {
  rent: "Arenda (egaga)",
  utilities: "Kommunal",
  salary: "Ish haqi",
  cleaning: "Tozalash",
  supplies: "Jihoz / mahsulot",
  marketing: "Marketing",
  repair: "Ta'mirlash",
  other: "Boshqa",
};

export const EXPENSE_CATEGORIES_RU: Record<string, string> = {
  rent: "Аренда (владельцу)",
  utilities: "Коммунальные",
  salary: "Зарплата",
  cleaning: "Уборка",
  supplies: "Инвентарь / продукты",
  marketing: "Маркетинг",
  repair: "Ремонт",
  other: "Другое",
};

const inputCls =
  "w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExpenseForm({ apartments }: { apartments: any[] }) {
  const [category, setCategory] = useState("utilities");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState(new Date().toISOString().split("T")[0]);
  const [apartmentId, setApartmentId] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [err, setErr] = useState("");

  const d = useDashLang();
  const isRu = d.common.save === "Сохранить";
  const cats = isRu ? EXPENSE_CATEGORIES_RU : EXPENSE_CATEGORIES;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) { setErr(isRu ? "Введите сумму" : "Summani kiriting"); setState("error"); return; }
    setState("saving");
    const res = await addExpense({
      category, amount: val, spent_on: spentOn,
      apartment_id: apartmentId || null, note,
    });
    if (res.success) {
      setAmount(""); setNote(""); setApartmentId(""); setState("idle"); setErr("");
    } else {
      setErr(res.error || (isRu ? "Ошибка" : "Xatolik")); setState("error");
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 lg:grid-cols-6 gap-3 items-end">
      <div className="space-y-1.5 col-span-1 lg:col-span-1">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Тип" : "Turi"}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          {Object.entries(cats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Сумма ($)" : "Summa ($)"}</label>
        <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Дата" : "Sana"}</label>
        <input type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Апартамент" : "Apartament"}</label>
        <select value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} className={inputCls}>
          <option value="">— {isRu ? "Общий" : "Umumiy"} —</option>
          {apartments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>
      <div className="space-y-1.5 col-span-1 lg:col-span-1">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{d.booking.notes}</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={isRu ? "необязательно" : "ixtiyoriy"} className={inputCls} />
      </div>
      <button type="submit" disabled={state === "saving"} className={`${btnPrimary} h-11 px-5 text-[14px] gap-2 col-span-2 lg:col-span-1`}>
        {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {isRu ? "Добавить" : "Qo'shish"}
      </button>
      {state === "error" && <div className="col-span-full text-[13px] text-red-400">{err}</div>}
    </form>
  );
}
