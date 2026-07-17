import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Tozalash vazifasini yopish + xonani bo'shatish — YAGONA joy.
 * Oqim: checkout(completed) -> kanban_status='dirty' + farrosh bot xabari
 * (clients-sync.ts) -> farrosh tasdiqlaydi (bot tugmasi / /dashboard/tasks /
 * staff paneli) -> shu funksiya -> task done + kanban_status='available'.
 *
 * Avval bu logika 3 joyda nusxa edi (telegram webhook, tasks/actions,
 * staff/actions) — endi hammasi shu helperni chaqiradi.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

export async function completeCleaningTaskAndFreeRoom(
  supabase: SB,
  taskId: string,
  opts?: { proofUrl?: string }
): Promise<{ success: boolean; error?: string; apartmentFreed?: boolean }> {
  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .select("id, type, apartment_id")
    .eq("id", taskId)
    .maybeSingle();
  if (taskErr || !task) return { success: false, error: taskErr?.message || "Vazifa topilmadi" };

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      ...(opts?.proofUrl ? { proof_image_url: opts.proofUrl } : {}),
    })
    .eq("id", taskId);
  if (error) return { success: false, error: error.message };

  // Faqat TOZALASH vazifasi xonani bo'shatadi (boshqa tur vazifalar emas)
  let apartmentFreed = false;
  if (task.type === "cleaning" && task.apartment_id) {
    const { error: aptErr } = await supabase
      .from("apartments")
      .update({ kanban_status: "available" })
      .eq("id", task.apartment_id);
    apartmentFreed = !aptErr;
  }

  return { success: true, apartmentFreed };
}
