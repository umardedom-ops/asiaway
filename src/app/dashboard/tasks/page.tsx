import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import TaskCard from "./TaskCard";
import { Building2, LogOut, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

// Farrosh sahifasi: faqat tozalash vazifalari (mobil-birinchi)
export default async function CleaningTasksPage() {
  const supabase = await createClient();

  const [{ data: tasks }, { data: apartments }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, apartment_id")
      .eq("type", "cleaning")
      .in("status", ["todo", "in_progress"])
      .order("priority", { ascending: false })
      .order("due_date", { ascending: true }),
    supabase.from("apartments").select("id, title, address"),
  ]);

  const aptMap = new Map(
    (apartments || []).map((a) => [a.id, { title: a.title as string, address: (a.address as string) || "" }])
  );

  const list = (tasks || []).map((t) => ({
    id: t.id as string,
    title: (t.title as string) || "Tozalash",
    status: t.status as string,
    priority: (t.priority as string) || "normal",
    due_date: (t.due_date as string) || null,
    aptTitle: aptMap.get(t.apartment_id)?.title || "Apartament",
    aptAddress: aptMap.get(t.apartment_id)?.address || "",
  }));

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F2EB] font-sans">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(197,164,109,0.14)] bg-[#111417]">
        <div className="flex items-center gap-2.5">
          <Building2 className="h-5 w-5 text-[#C5A46D]" />
          <span className="font-heading font-semibold text-[18px]">AsiaWay</span>
          <span className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 bg-[#C5A46D]/10 text-[#C5A46D] rounded border border-[#C5A46D]/20">
            Tozalash
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Chiqish"
            className="p-2 text-[#A8A49B] hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </header>

      <main className="max-w-[640px] mx-auto p-5 space-y-4">
        <h1 className="text-[20px] font-heading font-semibold">
          Tozalanadigan xonalar{" "}
          <span className="text-[#C5A46D]">({list.length})</span>
        </h1>

        {list.length === 0 ? (
          <div className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] p-10 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-[#C5A46D] mx-auto" />
            <p className="text-[15px] text-[#F5F2EB] font-medium">Hammasi toza!</p>
            <p className="text-[13px] text-[#A8A49B]">Hozircha tozalash vazifalari yo&apos;q.</p>
          </div>
        ) : (
          list.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </main>
    </div>
  );
}
