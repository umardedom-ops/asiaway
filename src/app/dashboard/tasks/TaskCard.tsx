"use client";

import { useRef, useState, useTransition } from "react";
import { startCleaningTask, completeCleaningTask } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Play, Check, MapPin, CalendarDays, Camera, X } from "lucide-react";
import { btnPrimary, btnSecondary, btnMd } from "@/lib/ui";

interface CleaningTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  aptTitle: string;
  aptAddress: string;
  /** Shef topshiriq berganda biriktirgan foto ("mana bu joyni tozala") */
  briefImageUrl?: string | null;
}

export default function TaskCard({ task }: { task: CleaningTask }) {
  const [pending, start] = useTransition();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setErr("");
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const complete = async () => {
    setErr("");
    let proofUrl: string | undefined;

    // Rasm tanlangan bo'lsa — Supabase Storage'ga yuklaymiz
    if (photo) {
      setUploading(true);
      try {
        const supabase = createClient();
        const ext = photo.name.split(".").pop() || "jpg";
        const path = `proofs/${task.id}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("apartments")
          .upload(path, photo, { upsert: true, contentType: photo.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("apartments").getPublicUrl(path);
        proofUrl = data.publicUrl;
      } catch (e: unknown) {
        setUploading(false);
        setErr(e instanceof Error ? e.message : "Rasm yuklashda xato");
        return;
      }
      setUploading(false);
    }

    start(async () => { await completeCleaningTask(task.id, proofUrl); });
  };

  const busy = pending || uploading;

  return (
    <div className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-[#F5F2EB] leading-snug">{task.aptTitle}</h3>
          <p className="text-[13px] text-[#A8A49B] mt-1">{task.title}</p>
        </div>
        {task.priority === "high" && (
          <span className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Shoshilinch
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#A8A49B]">
        {task.aptAddress && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#C5A46D]" /> {task.aptAddress}
          </span>
        )}
        {task.due_date && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#C5A46D]" /> {task.due_date}
          </span>
        )}
      </div>

      {/* Topshiriq fotosi — shef nima qilish kerakligini rasm bilan ko'rsatgan */}
      {task.briefImageUrl && (
        <a href={task.briefImageUrl} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={task.briefImageUrl}
            alt="Topshiriq fotosi"
            className="w-full h-40 object-cover rounded-[10px] border border-[#C5A46D]/30"
          />
          <span className="block mt-1 text-[11px] text-[#C5A46D]">📷 Topshiriq fotosi — kattalashtirish uchun bosing</span>
        </a>
      )}

      {/* Rasm (dalil) — farrosh tozalangan xona suratini biriktiradi */}
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Dalil" className="w-full h-40 object-cover rounded-[10px] border border-[rgba(197,164,109,0.2)]" />
          <button onClick={clearPhoto} aria-label="O'chirish" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#0B0D0F]/80 border border-[rgba(197,164,109,0.3)] text-[#F5F2EB] flex items-center justify-center hover:text-red-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 h-24 rounded-[10px] border border-dashed border-[rgba(197,164,109,0.3)] text-[#A8A49B] hover:text-[#C5A46D] hover:border-[#C5A46D]/50 transition-colors text-[13px]"
        >
          <Camera className="h-5 w-5" /> Tozalangan xona suratini biriktiring
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hidden" />

      {err && <div className="text-[12px] text-red-400">{err}</div>}

      <div className="flex gap-3">
        {task.status === "todo" && (
          <button
            onClick={() => start(async () => { await startCleaningTask(task.id); })}
            disabled={busy}
            className={`${btnSecondary} ${btnMd} flex-1`}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4 mr-2" /> Boshladim</>}
          </button>
        )}
        <button
          onClick={complete}
          disabled={busy}
          className={`${btnPrimary} ${btnMd} flex-1`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" /> {photo ? "Rasm bilan tasdiqlash" : "Tozalandi"}</>}
        </button>
      </div>
    </div>
  );
}
