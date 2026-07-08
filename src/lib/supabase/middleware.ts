import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // User auth statusini tekshiramiz
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // /dashboard sahifalarini himoya qilamiz
  if (url.pathname.startsWith("/dashboard")) {
    // /dashboard/login sahifasini chetlab o'tamiz (redirect loop bo'lmasligi uchun)
    if (url.pathname !== "/dashboard/login") {
      if (!user) {
        url.pathname = "/dashboard/login";
        return NextResponse.redirect(url);
      }

      // Admin emaillar ro'yxatini .env.local dan o'qiymiz
      const approvedEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((email) => email.trim().toLowerCase());

      if (!user.email || !approvedEmails.includes(user.email.toLowerCase())) {
        // Ruxsat berilmagan foydalanuvchini logout qilamiz va xato xabari bilan qaytaramiz
        await supabase.auth.signOut();
        url.pathname = "/dashboard/login";
        url.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(url);
      }
    } else {
      // Agar foydalanuvchi allaqachon login qilgan va ruxsati bo'lsa, /dashboard ga yo'naltiramiz
      if (user) {
        const approvedEmails = (process.env.ADMIN_EMAILS || "")
          .split(",")
          .map((email) => email.trim().toLowerCase());

        if (user.email && approvedEmails.includes(user.email.toLowerCase())) {
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
