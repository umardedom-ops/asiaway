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

      // ---- ROL BO'YICHA HIMOYA ----
      // shef       — hamma narsa
      // finansist  — moliya bloki: finance, kassa, income, cashflow, owner-payments
      // targetolog — marketing bloki: crm, bronlar, mijozlar
      // menejer    — operatsion blok (moliya/staff'dan tashqari hammasi)
      // cleaning   — faqat /dashboard/tasks
      const path = url.pathname;
      const redirectTo = (p: string) => {
        url.pathname = p;
        return NextResponse.redirect(url);
      };

      if (role === 'cleaning') {
        if (!path.startsWith('/dashboard/tasks')) return redirectTo('/dashboard/tasks');
      } else if (role === 'finansist') {
        const allowed = [
          '/dashboard/finance', '/dashboard/kassa', '/dashboard/income',
          '/dashboard/cashflow', '/dashboard/owner-payments',
        ];
        const isHome = path === '/dashboard' || path === '/dashboard/';
        if (!isHome && !allowed.some((p) => path.startsWith(p))) {
          return redirectTo('/dashboard/finance');
        }
      } else if (role === 'targetolog') {
        const allowed = [
          '/dashboard/crm', '/dashboard/bookings', '/dashboard/clients',
        ];
        const isHome = path === '/dashboard' || path === '/dashboard/';
        if (!isHome && !allowed.some((p) => path.startsWith(p))) {
          return redirectTo('/dashboard/crm');
        }
      } else if (role === 'menejer') {
        const blocked = [
          '/dashboard/finance', '/dashboard/owner-payments',
          '/dashboard/cashflow', '/dashboard/income', '/dashboard/staff',
          '/dashboard/apartments', // obyektlar CRUD — menejerga kerak emas
        ];
        if (blocked.some((p) => path.startsWith(p))) return redirectTo('/dashboard');
      }
      // shef — cheklovsiz

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
