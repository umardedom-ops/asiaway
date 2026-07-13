"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  const { error } = await supabase.from("tasks").insert([{
    title: input.title.trim(),
    type: input.type || "cleaning",
    assigned_to: input.assigned_to || null,
    apartment_id: input.apartment_id || null,
    due_date: input.due_date || null,
    priority: input.priority || "normal",
    status: "todo",
  }]);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/staff");
  return { success: true };
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
