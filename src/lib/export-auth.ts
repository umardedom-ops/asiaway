import { createClient } from "@/lib/supabase/server";

/**
 * Excel export endpointlari uchun rol tekshiruvi (server-side).
 * Ruxsat yo'q bo'lsa null qaytadi — chaqiruvchi 403 beradi.
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
