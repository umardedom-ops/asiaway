"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { notifyRole, esc } from "@/lib/telegram";

/**
 * Kirish anketasi: ism + maqsad qo'lda, qolgani (rol, vaqt, qurilma) avtomatik.
 * login_journal jadvaliga yoziladi + shef botiga xabar boradi.
 */
export async function logDashboardEntry(input: { name: string; purpose?: string }) {
  const name = input.name?.trim();
  if (!name) return { success: false, error: "name" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "auth" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role || "nomalum";

  const h = await headers();
  const userAgent = (h.get("user-agent") || "").slice(0, 300);

  const { error } = await supabase.from("login_journal").insert([{
    user_id: user.id,
    role,
    name: name.slice(0, 100),
    purpose: input.purpose?.trim().slice(0, 300) || null,
    user_agent: userAgent,
  }]);
  // Jadval hali yaratilmagan bo'lsa ham oqimni buzmaymiz
  if (error && !/relation|does not exist/i.test(error.message)) {
    console.error("login_journal:", error.message);
  }

  // Shefga xabar (o'zi kirganida shovqin qilmaymiz — bu client tomonda filtrlangan)
  await notifyRole("shef", (lang: string) => {
    const isRu = lang === "ru";
    const title = isRu ? "🔐 <b>ВХОД В СИСТЕМУ</b>" : "🔐 <b>TIZIMGA KIRISH</b>";
    const roleLbl = isRu ? "Роль" : "Rol";
    const purposeLbl = isRu ? "Цель" : "Maqsad";
    return {
      text:
        `${title}\n\n👤 ${esc(name)}\n🎖 ${roleLbl}: ${esc(role)}` +
        (input.purpose ? `\n📝 ${purposeLbl}: ${esc(input.purpose.trim())}` : ""),
    };
  });

  return { success: true };
}
