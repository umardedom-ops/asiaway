"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Farrosh vazifani boshlaganda
export async function startCleaningTask(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "in_progress" })
    .eq("id", taskId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

// Farrosh "Tozalandi" bosganda: vazifa done + rasm (dalil) + xona statusi available
export async function completeCleaningTask(taskId: string, proofUrl?: string) {
  const supabase = await createClient();

  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .select("id, apartment_id")
    .eq("id", taskId)
    .maybeSingle();
  if (taskErr || !task) return { success: false, error: taskErr?.message || "Vazifa topilmadi" };

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      ...(proofUrl ? { proof_image_url: proofUrl } : {}),
    })
    .eq("id", taskId);
  if (error) return { success: false, error: error.message };

  if (task.apartment_id) {
    await supabase
      .from("apartments")
      .update({ kanban_status: "available" })
      .eq("id", task.apartment_id);
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard");
  return { success: true };
}
