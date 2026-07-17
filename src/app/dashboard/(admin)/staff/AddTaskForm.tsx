"use client";

import { useState } from "react";
import { addTask } from "./actions";
import { Loader2, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import { TASK_TYPE_LABELS, TASK_TYPE_LABELS_RU, inputCls } from "./labels";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { uz, ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashLang } from "@/components/DashboardLangProvider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AddTaskForm({ staff, apartments }: { staff: any[]; apartments: any[] }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("cleaning");
  const [assignedTo, setAssignedTo] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("normal");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState<{ type: "success" | "warn"; text: string } | null>(null);
  const d = useDashLang();
  const isRu = d.lang === "ru";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr(isRu ? "Введите название задачи" : "Vazifa nomini kiriting"); return; }
    setSaving(true); setErr(""); setInfo(null);
    const res = await addTask({
      title, type, assigned_to: assignedTo || null,
      apartment_id: apartmentId || null, due_date: dueDate || null, priority,
    });
    setSaving(false);
    if (res.success) {
      setTitle(""); setDueDate("");
      const n = res.notified;
      const dbg = res.debug ? ` [роль: ${res.debug.staffRole ?? "не найдена"} → бот: ${res.debug.botRole}]` : "";
      if (n && n.sent > 0) setInfo({ type: "success", text: `${isRu ? "Задача добавлена · Отправлено в Telegram (" + n.role + ")" : "Vazifa qo'shildi · Telegram (" + n.role + ") botiga yuborildi"}${dbg}` });
      else setInfo({ type: "warn", text: `${isRu ? "Задача добавлена, но в Telegram НЕ ОТПРАВЛЕНО — " : "Vazifa qo'shildi, lekin Telegram xabari YUBORILMADI — "}${n?.reason || (isRu ? "неизвестная причина" : "noma'lum sabab")}${dbg}` });
    }
    else setErr(res.error || (isRu ? "Ошибка" : "Xatolik"));
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 lg:grid-cols-7 gap-3 items-end">
      <div className="space-y-1.5 col-span-2 lg:col-span-2">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Задача" : "Vazifa"}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isRu ? "например: уборка 22 этажа" : "masalan: 22-qavatni tozalash"} className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Тип" : "Turi"}</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          {Object.entries(isRu ? TASK_TYPE_LABELS_RU : TASK_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Сотрудник" : "Xodim"}</label>
        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputCls}>
          <option value="">— {isRu ? "Не выбран" : "Tanlanmagan"} —</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Апартамент" : "Apartament"}</label>
        <select value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} className={inputCls}>
          <option value="">—</option>
          {apartments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>
      <div className="space-y-1.5 flex flex-col">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Срок" : "Muddat"}</label>
        <Popover>
          <PopoverTrigger 
            className={cn(
              inputCls,
              "justify-start text-left font-normal flex items-center h-[44px]",
              !dueDate && "text-[#A8A49B]/50"
            )}
          >
            <CalendarIcon className="mr-2.5 h-4 w-4 shrink-0 text-[#C5A46D]" />
            {dueDate ? format(new Date(dueDate), "d MMMM yyyy", { locale: isRu ? ru : uz }) : <span>{isRu ? "Выберите дату" : "Sana tanlang"}</span>}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 bg-[#111417] border-[rgba(197,164,109,0.14)]" align="start">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  // YYYY-MM-DD formatida saqlaymiz, mahalliy vaqt o'zgarishini oldini olish uchun
                  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                  setDueDate(d.toISOString().split('T')[0]);
                } else {
                  setDueDate("");
                }
              }}
              className="bg-[#111417] text-[#F5F2EB] [&_.rdp-day_button:hover]:bg-[#C5A46D]/20 [&_.rdp-day_button[data-selected=true]]:bg-[#C5A46D] [&_.rdp-day_button[data-selected=true]]:text-[#111417] [&_.rdp-button_previous]:border-[rgba(197,164,109,0.2)] [&_.rdp-button_next]:border-[rgba(197,164,109,0.2)]"
            />
          </PopoverContent>
        </Popover>
      </div>
      <button type="submit" disabled={saving} className={`${btnPrimary} h-11 px-5 text-[14px] gap-2 col-span-2 lg:col-span-1`}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {isRu ? "Добавить" : "Qo'shish"}
      </button>
      {err && (
        <div className="col-span-full inline-flex items-center gap-1.5 text-[13px] text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {err}
        </div>
      )}
      {info && (
        <div className={`col-span-full inline-flex items-center gap-1.5 text-[13px] ${info.type === "success" ? "text-emerald-400" : "text-amber-400"}`}>
          {info.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
          {info.text}
        </div>
      )}
    </form>
  );
}
