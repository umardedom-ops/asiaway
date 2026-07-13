"use client";

import { useTransition } from "react";
import { startCleaningTask, completeCleaningTask } from "./actions";
import { Loader2, Play, Check, MapPin, CalendarDays } from "lucide-react";
import { btnPrimary, btnSecondary, btnMd } from "@/lib/ui";

interface CleaningTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  aptTitle: string;
  aptAddress: string;
}

export default function TaskCard({ task }: { task: CleaningTask }) {
  const [pending, start] = useTransition();

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

      <div className="flex gap-3">
        {task.status === "todo" && (
          <button
            onClick={() => start(async () => { await startCleaningTask(task.id); })}
            disabled={pending}
            className={`${btnSecondary} ${btnMd} flex-1`}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4 mr-2" /> Boshladim</>}
          </button>
        )}
        <button
          onClick={() => start(async () => { await completeCleaningTask(task.id); })}
          disabled={pending}
          className={`${btnPrimary} ${btnMd} flex-1`}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" /> Tozalandi</>}
        </button>
      </div>
    </div>
  );
}
