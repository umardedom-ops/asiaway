import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { D, type Lang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ListChecks, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import AddStaffForm from "./AddStaffForm";
import AddTaskForm from "./AddTaskForm";
import TaskRow from "./TaskRow";
import { ROLE_LABELS, TASK_TYPE_LABELS } from "./labels";
import { fmtDate as fmtDateLib } from "@/lib/date-fmt";

export const revalidate = 0;

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default async function StaffPage() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

  const [{ data: staffRaw }, { data: tasksRaw }, { data: aptsRaw }, { data: journalRaw }] = await Promise.all([
    supabase.from("staff").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, title"),
    // Kirish jurnali (anketa) — oxirgi 30 ta; jadval hali yo'q bo'lsa bo'sh keladi
    supabase.from("login_journal").select("id, role, name, purpose, created_at").order("created_at", { ascending: false }).limit(30),
  ]);

  const staff = staffRaw ?? [];
  const tasks = tasksRaw ?? [];
  const apartments = aptsRaw ?? [];

  const unassigned = lang === "uz" ? "— Tayinlanmagan" : lang === "ru" ? "— Не назначен" : "— Unassigned";
  const staffName = (id: string | null) => staff.find((s) => s.id === id)?.full_name || unassigned;
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

  const t = lang === "uz" ? {
    subtitle: "Menejer va tozalovchilar, vazifa taqsimoti va KPI.",
    staffStat: "Xodimlar", count: "ta", totalStaff: "ta jami",
    activeTasks: "Faol vazifalar", activeSub: "Kutilmoqda / jarayonda",
    doneTasks: "Bajarilgan", doneSub: "Jami yopilgan",
    addStaff: "Xodim qo'shish",
    noStaff: "Hali xodim qo'shilmagan.",
    inactive: "Nofaol", salary: "Oylik", activeLabel: "Faol", doneLabel: "Bajardi",
    addTask: "Vazifa qo'shish",
    tasksList: "Vazifalar",
    taskCol: "Vazifa", staffCol: "Xodim", aptCol: "Apartament", statusCol: "Holat", actionCol: "Amal",
    noTasks: "Hali vazifa yo'q"
  } : lang === "ru" ? {
    subtitle: "Менеджеры и уборщики, распределение задач и KPI.",
    staffStat: "Сотрудники", count: "шт", totalStaff: "всего",
    activeTasks: "Активные задачи", activeSub: "Ожидают / в процессе",
    doneTasks: "Выполнено", doneSub: "Всего закрыто",
    addStaff: "Добавить сотрудника",
    noStaff: "Сотрудников пока нет.",
    inactive: "Неактивен", salary: "Зарплата", activeLabel: "Активн.", doneLabel: "Сделал",
    addTask: "Добавить задачу",
    tasksList: "Задачи",
    taskCol: "Задача", staffCol: "Сотрудник", aptCol: "Апартамент", statusCol: "Статус", actionCol: "Действие",
    noTasks: "Задач пока нет"
  } : {
    subtitle: "Managers and cleaners, task assignment and KPI.",
    staffStat: "Staff", count: "pcs", totalStaff: "total",
    activeTasks: "Active tasks", activeSub: "Pending / in progress",
    doneTasks: "Completed", doneSub: "Total closed",
    addStaff: "Add Staff",
    noStaff: "No staff added yet.",
    inactive: "Inactive", salary: "Salary", activeLabel: "Active", doneLabel: "Done",
    addTask: "Add Task",
    tasksList: "Tasks",
    taskCol: "Task", staffCol: "Staff", aptCol: "Apartment", statusCol: "Status", actionCol: "Action",
    noTasks: "No tasks yet"
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-heading font-medium tracking-tight text-[#F5F2EB]">{d.staff.title}</h1>
        <p className="text-[14px] text-[#A8A49B] mt-2 font-light">{t.subtitle}</p>
      </div>

      {/* Umumiy ko'rsatkichlar */}
      <div className="grid gap-6 md:grid-cols-3">
        <MiniStat title={t.staffStat} value={`${staff.filter((s) => s.active).length} ${t.count}`} icon={<Users className="h-4 w-4 text-[#C5A46D]" />} sub={`${staff.length} ${t.totalStaff}`} />
        <MiniStat title={t.activeTasks} value={`${openTasks} ${t.count}`} icon={<Clock className="h-4 w-4 text-[#C5A46D]" />} sub={t.activeSub} />
        <MiniStat title={t.doneTasks} value={`${doneTasks} ${t.count}`} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} sub={t.doneSub} />
      </div>

      {/* Xodim qo'shish */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.addStaff}</CardTitle></CardHeader>
        <CardContent><AddStaffForm /></CardContent>
      </Card>

      {/* Xodimlar + KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpi.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#A8A49B] bg-[#111417] border border-[rgba(197,164,109,0.14)] rounded-[12px]">
            <Users className="h-10 w-10 text-[rgba(197,164,109,0.3)] mx-auto mb-3" />
            {t.noStaff}
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
                {!s.active && <span className="text-[10px] uppercase tracking-wide text-red-400 border border-red-500/20 rounded px-2 py-0.5">{t.inactive}</span>}
              </div>
              <div className="flex items-center justify-between text-[13px] pt-3 border-t border-[rgba(197,164,109,0.1)]">
                <span className="text-[#A8A49B]">{t.salary}: <span className="text-[#F5F2EB]">{money(s.monthly_salary)}</span></span>
                <span className="text-[#A8A49B]">KPI: <span className="text-[#C5A46D] font-medium">{s.rate}%</span></span>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="flex-1 text-center py-1.5 rounded bg-[#0B0D0F] border border-[rgba(197,164,109,0.1)] text-[#A8A49B]">{t.activeLabel}: <span className="text-[#F5F2EB]">{s.active}</span></span>
                <span className="flex-1 text-center py-1.5 rounded bg-[#0B0D0F] border border-[rgba(197,164,109,0.1)] text-[#A8A49B]">{t.doneLabel}: <span className="text-emerald-400">{s.done}</span></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vazifa qo'shish */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader><CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.addTask}</CardTitle></CardHeader>
        <CardContent><AddTaskForm staff={staff} apartments={apartments} /></CardContent>
      </Card>

      {/* Vazifalar ro'yxati */}
      <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
        <CardHeader className="flex flex-row items-center gap-2">
          <ListChecks className="h-5 w-5 text-[#C5A46D]" />
          <CardTitle className="text-[16px] font-medium text-[#F5F2EB]">{t.tasksList}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                  <th className="text-left font-semibold px-6 py-3">{t.taskCol}</th>
                  <th className="text-left font-semibold px-4 py-3">{t.staffCol}</th>
                  <th className="text-left font-semibold px-4 py-3">{t.aptCol}</th>
                  <th className="text-left font-semibold px-4 py-3">{t.statusCol}</th>
                  <th className="text-right font-semibold px-6 py-3">{t.actionCol}</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[#A8A49B]">{t.noTasks}</td></tr>
                )}
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} staffName={staffName(t.assigned_to)} aptTitle={aptTitle(t.apartment_id)} typeLabel={TASK_TYPE_LABELS[t.type] || t.type} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Kirish jurnali — kim, qachon, qaysi rol bilan tizimga kirgan (anketa) */}
      {(journalRaw?.length ?? 0) > 0 && (
        <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none">
          <CardHeader>
            <CardTitle className="text-[16px] font-medium text-[#F5F2EB] inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C5A46D]" /> {d.journal.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[#A8A49B] text-[11px] uppercase tracking-[0.08em] border-b border-[rgba(197,164,109,0.14)]">
                    <th className="text-left font-semibold px-6 py-3">{d.journal.who}</th>
                    <th className="text-left font-semibold px-4 py-3">{d.journal.role}</th>
                    <th className="text-left font-semibold px-4 py-3">{d.journal.purpose}</th>
                    <th className="text-right font-semibold px-6 py-3">{d.journal.when}</th>
                  </tr>
                </thead>
                <tbody>
                  {(journalRaw ?? []).map((j) => (
                    <tr key={j.id} className="border-b border-[rgba(197,164,109,0.08)] last:border-0 hover:bg-[#0B0D0F]/30">
                      <td className="px-6 py-3 text-[#F5F2EB] font-medium">{j.name}</td>
                      <td className="px-4 py-3"><span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded border border-[#C5A46D]/25 bg-[#C5A46D]/10 text-[#C5A46D]">{j.role}</span></td>
                      <td className="px-4 py-3 text-[#A8A49B] max-w-[280px] truncate">{j.purpose || "—"}</td>
                      {/* BUG FIX: Intl "uz-UZ" bilan month:"short" ishlatilganda "M07" kabi buzuq chiqadi */}
                      <td className="px-6 py-3 text-right text-[#A8A49B] whitespace-nowrap">{fmtDateLib(j.created_at, lang, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MiniStat({ title, value, icon, sub }: { title: string; value: string; icon: React.ReactNode; sub: string }) {
  return (
    <Card className="border-[rgba(197,164,109,0.14)] bg-[#111417] rounded-[12px] shadow-none hover:border-[rgba(197,164,109,0.3)] transition-colors">
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
