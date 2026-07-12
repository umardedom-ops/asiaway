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

      // Role checking from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;

      // If user is not in profiles table or has no role, restrict
      if (!role) {
        await supabase.auth.signOut();
        url.pathname = "/dashboard/login";
        url.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(url);
      }

      // Route Protection based on roles
      if (url.pathname.startsWith('/dashboard/finance') && role !== 'shef') {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
      
      if (url.pathname.startsWith('/dashboard/staff') && role !== 'shef') {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      if (role === 'cleaning') {
        // Cleaning staff can only see the tasks/cleaning page
        if (!url.pathname.startsWith('/dashboard/tasks')) {
          url.pathname = "/dashboard/tasks";
          return NextResponse.redirect(url);
        }
      }

    } else {
      // If logging in and already auth'd
      if (user) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
