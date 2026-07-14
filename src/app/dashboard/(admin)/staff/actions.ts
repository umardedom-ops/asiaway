"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyRole, type BotRole } from "@/lib/telegram";

const TYPE_LABELS: Record<string, string> = {
  cleaning: "Tozalash", checkin: "Kutib olish", checkout: "Kuzatish",
  maintenance: "Ta'mirlash", shopping: "Xarid", other: "Boshqa",
};

// Xodim roli → qaysi bot xabar oladi
function botForStaffRole(role?: string | null): BotRole {
  if (role === "cleaner") return "cleaning";
  if (role === "manager") return "menejer";
  return "menejer"; // maintenance / driver / other → menejer botiga
}

export async function addStaff(input: { full_name: string; role: string; phone?: string; monthly_salary?: number }) {
  if (!input.full_name?.trim()) return { success: false, error: "Ism kiriting" };
  const supabase = await createClient();
  const { error } = await supabase.from("staff").insert([{
    full_name: input.full_name.trim(),
    role: input.role || "cleaner",
    phone: input.phone?.trim() || null,
    monthly_salary: input.monthly_salary || 0,
  }]);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function addTask(input: {
  title: string; type: string; assigned_to?: string | null;
  apartment_id?: string | null; due_date?: string | null; priority?: string;
}) {
  if (!input.title?.trim()) return { success: false, error: "Vazifa nomini kiriting" };
  const supabase = await createClient();
  const { error, data: task } = await supabase.from("tasks").insert([{
    title: input.title.trim(),
    type: input.type || "cleaning",
    assigned_to: input.assigned_to || null,
    apartment_id: input.apartment_id || null,
    due_date: input.due_date || null,
    priority: input.priority || "normal",
    status: "todo",
  }]).select("id").single();

  if (error) return { success: false, error: error.message };

  // Xona nomi
  let aptTitle = "";
  if (input.apartment_id) {
    const { data: apt } = await supabase.from("apartments").select("title").eq("id", input.apartment_id).maybeSingle();
    if (apt) aptTitle = apt.title as string;
  }

  // Mas'ul xodim va uning roli.
  // MUHIM: staff.role bazada 'manager' | 'cleaner' | 'maintenance' | 'driver' | 'other'
  // (bot rollari esa 'menejer' | 'cleaning' | 'shef') — shuning uchun map qilamiz.
  let staffName = "";
  let staffRole: string | null = null;
  if (input.assigned_to) {
    const { data: staff } = await supabase.from("staff").select("full_name, role").eq("id", input.assigned_to).maybeSingle();
    if (staff) {
      staffName = staff.full_name as string;
      staffRole = staff.role as string;
    }
  }

  // Kimga yuboriladi: mas'ul xodim roli bo'yicha, bo'lmasa vazifa turi bo'yicha
  const role: BotRole = staffRole
    ? botForStaffRole(staffRole)
    : input.type === "cleaning" ? "cleaning" : "menejer";

  const aptLine = aptTitle ? `\n🏢 <b>Xona:</b> ${aptTitle}` : "";
  const staffLine = staffName ? `\n👤 <b>Mas'ul:</b> ${staffName}` : "";
  const dateLine = input.due_date ? `\n⏳ <b>Muddat:</b> ${input.due_date}` : "";
  const prioLine = input.priority === "high" ? `\n⚠️ <b>Muhimlik:</b> Yuqori` : "";

  const msg =
    `📝 <b>YANGI VAZIFA</b> — ${TYPE_LABELS[input.type] || input.type}\n\n` +
    `📌 <b>Vazifa:</b> ${input.title.trim()}${aptLine}${staffLine}${dateLine}${prioLine}`;

  // Telegram botga yuborish + "Bajarildi" tugmasi (bosilsa vazifa yopiladi)
  const notified = await notifyRole(
    role,
    msg,
    task?.id ? [[{ text: "✅ Bajarildi", callback_data: `task:${task.id}:done` }]] : undefined
  );

  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/tasks");
  // notified.sent = nechta chatga ketdi; 0 bo'lsa reason'да sabab bor
  return { success: true, notified };
}

export async function setTaskStatus(id: string, status: string) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  patch.completed_at = status === "done" ? new Date().toISOString() : null;
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) return { success: false, error: error.message };

  // Tozalash vazifasi yakunlansa — xona statusi "available" (bo'sh/toza)
  if (status === "done") {
    const { data: task } = await supabase
      .from("tasks")
      .select("type, apartment_id")
      .eq("id", id)
      .maybeSingle();
    if (task?.type === "cleaning" && task.apartment_id) {
      await supabase
        .from("apartments")
        .update({ kanban_status: "available" })
        .eq("id", task.apartment_id);
    }
  }

  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function toggleStaffActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("staff").update({ active }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/staff");
  return { success: true };
}
