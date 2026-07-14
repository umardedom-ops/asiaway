import Link from "next/link";
import { cookies } from "next/headers";
import { logout } from "../login/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { D, type Lang } from "@/lib/i18n";
import DashboardLangSwitcher from "@/components/DashboardLangSwitcher";
import { DashboardLangProvider } from "@/components/DashboardLangProvider";
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  LogOut,
  Building2,
  Users,
  Wallet,
  UserCog
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rolni aniqlaymiz
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  const isShef = role === "shef";

  // Cookie'dan tilni o'qiymiz
  const cookieStore = await cookies();
  const lang = (cookieStore.get("asiaway-lang")?.value || "uz") as Lang;
  const d = D[lang];

  // Rolga qarab guruhlangan menyu
  const sections: { title: string | null; items: { name: string; href: string; icon: typeof Home }[] }[] = [
    { title: null, items: [
      { name: d.sidebar.panel, href: "/dashboard", icon: LayoutDashboard },
    ] },
    { title: lang === "ru" ? "Ресепшн" : "Qabul", items: [
      { name: d.sidebar.reception, href: "/dashboard/reception", icon: CalendarCheck },
    ] },
    { title: lang === "ru" ? "Клиенты" : "Mijozlar", items: [
      { name: d.sidebar.crm, href: "/dashboard/crm", icon: Users },
    ] },
    { title: lang === "ru" ? "Объекты" : "Obyektlar", items: [
      { name: d.sidebar.apartments, href: "/dashboard/apartments", icon: Home },
    ] },
    { title: lang === "ru" ? "Финансы" : "Moliya", items: [
      { name: d.sidebar.kassa, href: "/dashboard/kassa", icon: Wallet },
      ...(isShef ? [
        { name: d.sidebar.finance, href: "/dashboard/finance", icon: Wallet },
      ] : []),
    ] },
    ...(isShef ? [{ title: lang === "ru" ? "Команда" : "Jamoa", items: [
      { name: d.sidebar.staff, href: "/dashboard/staff", icon: UserCog },
    ] }] : []),
  ];

  // Mobil uchun yassi ro'yxat
  const navigation = sections.flatMap((s) => s.items);

  return (
    <DashboardLangProvider>
      <div className="min-h-screen bg-[#0B0D0F] text-[#F5F2EB] flex font-sans">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-[280px] border-r border-[rgba(197,164,109,0.14)] bg-[#111417] p-6 space-y-6">
          <div className="flex flex-col space-y-4 px-2">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-[#C5A46D]" />
              <span className="text-[20px] font-heading font-semibold tracking-wide text-[#F5F2EB]">AsiaWay</span>
              <span className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 bg-[#C5A46D]/10 text-[#C5A46D] rounded border border-[#C5A46D]/20">
                {isShef ? d.sidebar.shef : d.sidebar.menejer}
              </span>
            </div>
            <div>
              <DashboardLangSwitcher />
            </div>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto custom-scrollbar -mr-2 pr-2">
            {sections.map((section, si) => (
              <div key={si} className="space-y-1">
                {section.title && (
                  <div className="px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A8A49B]/50 mb-1.5">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-2.5 rounded-[8px] text-[#A8A49B] hover:text-[#F5F2EB] hover:bg-[#C5A46D]/10 transition-colors group"
                    >
                      <Icon className="h-[18px] w-[18px] text-[#A8A49B] group-hover:text-[#C5A46D] transition-colors shrink-0" />
                      <span className="font-medium text-[13.5px]">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-[rgba(197,164,109,0.14)] pt-6 px-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[#A8A49B] truncate" title={user?.email}>
                {d.sidebar.system}: <span className="font-medium text-[#F5F2EB]">{user?.email}</span>
              </div>
            </div>
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                className="w-full justify-start space-x-2 bg-transparent border-[rgba(197,164,109,0.22)] text-[#F5F2EB] hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 transition-colors rounded-[8px] h-11"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-[13px] font-medium tracking-wide">{d.sidebar.logout}</span>
              </Button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Mobile */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-[rgba(197,164,109,0.14)] bg-[#111417]">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-[#C5A46D]" />
              <span className="font-heading font-medium text-[#F5F2EB] text-[18px]">AsiaWay</span>
            </div>
            <div className="flex items-center space-x-3">
              <DashboardLangSwitcher />
              <form action={logout}>
                <Button type="submit" variant="ghost" size="icon" className="text-[#A8A49B] hover:text-red-400">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </header>

          {/* Mobile Navigation Bar */}
          <nav className="md:hidden flex justify-around border-b border-[rgba(197,164,109,0.14)] bg-[#111417] py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center py-2 px-3 text-[#A8A49B] hover:text-[#C5A46D] transition-colors"
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-[10px] tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Main Content Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <div className="max-w-[1200px] mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardLangProvider>
  );
}
