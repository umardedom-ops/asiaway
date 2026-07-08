"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  // Supabase Auth orqali tizimga kiramiz
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/dashboard/login?error=${encodeURIComponent(error.message)}`);
  }

  // Muvaffaqiyatli kirganda dashboardga o'tish
  return redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/dashboard/login");
}
