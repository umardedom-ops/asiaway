import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ListChecks, CheckCircle2, Clock } from "lucide-react";
import AddStaffForm from "./AddStaffForm";
import AddTaskForm from "./AddTaskForm";
import TaskRow from "./TaskRow";
import { ROLE_LABELS, TASK_TYPE_LABELS } from "./labels";

export const revalidate = 0;

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default async function StaffPage() {
  const supabase = await createClient();

  const [{ data: staffRaw }, { data: tasksRaw }, { data: aptsRaw }] = await Promise.all([
    supabase.from("staff").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, title"),
  ]);

  const staff = staffRaw ?? [];
  const tasks = tasksRaw ?? [];
  const apartments = aptsRaw ?? [];

  const staffName = (id: string | null) => staff.find((s) => s.id === id)?.full_name || "— Tayinlanmagan";
  const aptTitle = (id: string | null) => apartments.find((a) => a.id === id)?.title || "—";

  // KPI: xodim bo'yicha bajarilgan / faol vazifalar
  const kpi = staff.map((s) => {
    const mine = tasks.filter((t) => t.assigned_to === s.id);
    const done = mine.filter((t) => t.status === "done").length;
    const active = mine.filter((t) => t.status === "todo" || t.status === "in_progress").length;
    const rate = mine.length > 0 ? Math.round((done / mine.length) * 100) : 0;
    return { ...s, total: mine.length, done, active, rate };
  });

  const openTasks = tasks.filter((t) => t.status === "todo" || t.status === "in_progress").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">Xodimlar · Vazifalar</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">Menejer va tozalovchilar, vazifa taqsimoti va KPI.</p>
      </div>

      {/* Umumiy ko'rsatkichlar */}
      <div className="grid gap-6 md:grid-cols-3">
        <MiniStat title="Xodimlar" value={`${staff.filter((s) => s.active).length} ta`} icon={<Users className="h-4 w-4 text-[#C5A46D]" />} sub={`${staff.length} ta jami`} />
        <MiniStat title="Faol vazifalar" value={`${openTasks} ta`} icon={<Clock className="h-4 w-4 text-[#C5A46D]" />} sub="Kutilmoqda / jarayonda" />
        <MiniStat title="Bajarilgan" value={`${doneTasks} ta`} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} sub="Jami yopilgan" />
      </div>

      {/* Xodim qo'shish */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Xodim qo&apos;shish</CardTitle></CardHeader>
        <CardContent><AddStaffForm /></CardContent>
      </Card>

      {/* Xodimlar + KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpi.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#A8A49B] bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[12px]">
            <Users className="h-10 w-10 text-[rgba(197,164,109,0.3)] mx-auto mb-3" />
            Hali xodim qo&apos;shilmagan.
          </div>
        )}
        {kpi.map((s) => (
          <Card key={s.id} className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[16px] font-medium text-[#F5F2EB]">{s.full_name}</div>
                  <div className="text-[12px] text-[#C5A46D] mt-0.5">{ROLE_LABELS[s.role] || s.role}</div>
                  {s.phone && <div className="text-[12px] text-[#A8A49B] mt-1">{s.phone}</div>}
                </div>
                {!s.active && <span className="text-[10px] uppercase tracking-wide text-red-400 border border-red-500/20 rounded px-2 py-0.5">Nofaol</span>}
              </div>
              <div className="flex items-center justify-between text-[13px] pt-3 border-t border-[rgba(197,164,109,0.1)]">
                <span className="text-[#A8A49B]">Oylik: <span className="text-[#F5F2EB]">{money(s.monthly_salary)}</span></span>
                <span className="text-[#A8A49B]">KPI: <span className="text-[#C5A46D] font-medium">{s.rate}%</span></span>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="flex-1 text-center py-1.5 rounded bg-[#0B0D0F] border border-[rgba(197,164,109,0.1)] text-[#A8A49B]">Faol: <span className="text-[#F5F2EB]">{s.active}</span></span>
                <span className="flex-1 text-center py-1.5 rounded bg-[#0B0D0F] border border-[rgba(197,164,109,0.1)] text-[#A8A49B]">Bajardi: <span className="text-emerald-400">{s.done}</span></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vazifa qo'shish */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Vazifa qo&apos;shish</CardTitle></CardHeader>
        <CardContent><AddTaskForm staff={staff} apartments={apartments} /></CardContent>
      </Card>

      {/* Vazifalar ro'yxati */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader className="flex flex-row items-center gap-2">
          <ListChecks className="h-5 w-5 text-[#C5A46D]" />
          <CardTitle className="text-[16px] font-medium text-[#F5F2EB]">Vazifalar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                  <th className="text-left font-semibold px-6 py-3">Vazifa</th>
                  <th className="text-left font-semibold px-4 py-3">Xodim</th>
                  <th className="text-left font-semibold px-4 py-3">Apartament</th>
                  <th className="text-left font-semibold px-4 py-3">Holat</th>
                  <th className="text-right font-semibold px-6 py-3">Amal</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[#A8A49B]">Hali vazifa yo&apos;q</td></tr>
                )}
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} staffName={staffName(t.assigned_to)} aptTitle={aptTitle(t.apartment_id)} typeLabel={TASK_TYPE_LABELS[t.type] || t.type} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ title, value, icon, sub }: { title: string; value: string; icon: React.ReactNode; sub: string }) {
  return (
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-[28px] font-medium text-[#F5F2EB]">{value}</div>
        <p className="text-[12px] text-[#A8A49B] mt-2 font-light">{sub}</p>
      </CardContent>
    </Card>
  );
}
