"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { completeCleaningTaskAndFreeRoom } from "@/lib/cleaning";

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
  const res = await completeCleaningTaskAndFreeRoom(supabase, taskId, { proofUrl });
  if (!res.success) return res;

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard");
  return { success: true };
}
