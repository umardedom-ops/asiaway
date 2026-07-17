"use client";

import { useRef, useState } from "react";
import { addTask } from "./actions";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Loader2, Plus, CheckCircle2, AlertTriangle, Camera, X } from "lucide-react";
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
  // Topshiriq fotosi ("mana bu joyni tozala" rasmi) — Storage'ga yuklanadi
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const d = useDashLang();
  const isRu = d.lang === "ru";

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };
  const clearPhoto = () => {
    setPhoto(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr(isRu ? "Введите название задачи" : "Vazifa nomini kiriting"); return; }
    setSaving(true); setErr(""); setInfo(null);

    // Foto tanlangan bo'lsa — avval Storage'ga (TaskCard'dagi proof bilan bir xil bucket)
    let briefUrl: string | null = null;
    if (photo) {
      try {
        const sb = createBrowserClient();
        const ext = photo.name.split(".").pop() || "jpg";
        const path = `briefs/${Date.now()}.${ext}`;
        const { error: upErr } = await sb.storage
          .from("apartments")
          .upload(path, photo, { upsert: true, contentType: photo.type });
        if (upErr) throw upErr;
        briefUrl = sb.storage.from("apartments").getPublicUrl(path).data.publicUrl;
      } catch (ex: unknown) {
        setSaving(false);
        setErr((isRu ? "Фото не загрузилось: " : "Foto yuklanmadi: ") + (ex instanceof Error ? ex.message : ""));
        return;
      }
    }

    const res = await addTask({
      title, type, assigned_to: assignedTo || null,
      apartment_id: apartmentId || null, due_date: dueDate || null, priority,
      brief_image_url: briefUrl,
    });
    setSaving(false);
    if (res.success) {
      setTitle(""); setDueDate(""); clearPhoto();
      const n = res.notified;
      const dbg = res.debug ? ` [роль: ${res.debug.staffRole ?? "не найдена"} → бот: ${res.debug.botRole}]` : "";
      if (n && n.sent > 0) setInfo({ type: "success", text: `${isRu ? "Задача добавлена · Отправлено в Telegram (" + n.role + ")" : "Vazifa qo'shildi · Telegram (" + n.role + ") botiga yuborildi"}${dbg}` });
      else setInfo({ type: "warn", text: `${isRu ? "Задача добавлена, но в Telegram НЕ ОТПРАВЛЕНО — " : "Vazifa qo'shildi, lekin Telegram xabari YUBORILMADI — "}${n?.reason || (isRu ? "неизвестная причина" : "noma'lum sabab")}${dbg}` });
    }
    else setErr(res.error || (isRu ? "Ошибка" : "Xatolik"));
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 lg:grid-cols-8 gap-3 items-end">
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
      {/* Topshiriq fotosi (ixtiyoriy) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{isRu ? "Фото" : "Foto"}</label>
        {preview ? (
          <div className="relative h-[44px] w-full rounded-[8px] overflow-hidden border border-[#C5A46D]/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Foto" className="h-full w-full object-cover" />
            <button type="button" onClick={clearPhoto} aria-label="X" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-[44px] rounded-[8px] border border-dashed border-[rgba(197,164,109,0.3)] text-[#A8A49B] hover:text-[#C5A46D] hover:border-[#C5A46D]/50 transition-colors inline-flex items-center justify-center gap-1.5 text-[12px]"
          >
            <Camera className="h-4 w-4" /> {isRu ? "Фото" : "Foto"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hidden" />
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
