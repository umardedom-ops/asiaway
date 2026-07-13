"use client";

import { useState, useTransition } from "react";
import { setTaskStatus, deleteTask } from "./actions";
import { Trash2, Loader2, Check, Play, RotateCcw, Camera } from "lucide-react";
import { TASK_STATUS_LABELS } from "./labels";

const STATUS_STYLE: Record<string, string> = {
  todo: "bg-[#A8A49B]/10 text-[#A8A49B] border-[#A8A49B]/20",
  in_progress: "bg-[#C5A46D]/10 text-[#C5A46D] border-[#C5A46D]/25",
  done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TaskRow({ task, staffName, aptTitle, typeLabel }: { task: any; staffName: string; aptTitle: string; typeLabel: string }) {
  const [pending, start] = useTransition();
  const [busyDel, setBusyDel] = useState(false);
  const run = (fn: () => Promise<unknown>) => start(() => { fn(); });

  return (
    <tr className="border-b border-[rgba(197,164,109,0.08)] last:border-0">
      <td className="px-6 py-3 text-[#F5F2EB] max-w-[240px]">
        <div className="truncate">{task.title}</div>
        <div className="text-[11px] text-[#A8A49B]">{typeLabel}{task.due_date ? ` · ${task.due_date}` : ""}</div>
        {task.proof_image_url && (
          <a href={task.proof_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-[#C5A46D] hover:text-[#D4B77F] mt-1">
            <Camera className="h-3 w-3" /> Dalil rasm
          </a>
        )}
      </td>
      <td className="px-4 py-3 text-[#A8A49B]">{staffName}</td>
      <td className="px-4 py-3 text-[#A8A49B] max-w-[160px] truncate">{aptTitle}</td>
      <td className="px-4 py-3">
        <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLE[task.status] || STATUS_STYLE.todo}`}>
          {TASK_STATUS_LABELS[task.status] || task.status}
        </span>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center justify-end gap-2">
          {pending && <Loader2 className="h-4 w-4 animate-spin text-[#A8A49B]" />}
          {task.status !== "in_progress" && task.status !== "done" && (
            <button onClick={() => run(() => setTaskStatus(task.id, "in_progress"))} aria-label="Boshlash" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors"><Play className="h-4 w-4" /></button>
          )}
          {task.status !== "done" && (
            <button onClick={() => run(() => setTaskStatus(task.id, "done"))} aria-label="Bajarildi" className="text-[#A8A49B] hover:text-emerald-400 transition-colors"><Check className="h-4 w-4" /></button>
          )}
          {task.status === "done" && (
            <button onClick={() => run(() => setTaskStatus(task.id, "todo"))} aria-label="Qayta ochish" className="text-[#A8A49B] hover:text-[#C5A46D] transition-colors"><RotateCcw className="h-4 w-4" /></button>
          )}
          <button onClick={async () => { setBusyDel(true); await deleteTask(task.id); setBusyDel(false); }} aria-label="O'chirish" className="text-[#A8A49B] hover:text-red-400 transition-colors">
            {busyDel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}
