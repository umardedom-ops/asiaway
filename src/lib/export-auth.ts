import { createClient } from "@/lib/supabase/server";

/**
 * Rol tekshiruvi (server-side) — export endpointlari va server actionlar uchun.
 * Ruxsat yo'q bo'lsa null qaytadi — chaqiruvchi 403 / error beradi.
 */
export async function requireRole(allowed: string[]): Promise<{ role: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role;
  if (!role || !allowed.includes(role)) return null;
  return { role };
}

/**
 * Server action uchun qulay guard: ruxsat bo'lmasa {success:false, error} qaytaradi.
 * Masalan: const deny = await denyUnlessRole(["shef"]); if (deny) return deny;
 */
export async function denyUnlessRole(
  allowed: string[]
): Promise<{ success: false; error: string } | null> {
  const r = await requireRole(allowed);
  if (r) return null;
  return { success: false, error: "Ruxsat yo'q — bu amal sizning vakolatingizga kirmaydi" };
}
