import Link from "next/link";
import { logout } from "../login/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  LogOut,
  Building2,
  Menu,
  Users,
  UsersRound,
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

  const navigation = [
    { name: "Boshqaruv paneli", href: "/dashboard", icon: LayoutDashboard },
    { name: "Apartamentlar", href: "/dashboard/apartments", icon: Home },
    { name: "Bronlar ro'yxati", href: "/dashboard/bookings", icon: CalendarCheck },
    { name: "CRM (Murojaatlar)", href: "/dashboard/crm", icon: Users },
    { name: "Mehmonlar", href: "/dashboard/clients", icon: UsersRound },
    { name: "Moliya", href: "/dashboard/finance", icon: Wallet },
    { name: "Xodimlar", href: "/dashboard/staff", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F2EB] flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[280px] border-r border-[rgba(197,164,109,0.14)] bg-[#111417] p-6 space-y-8">
        <div className="flex items-center space-x-3 px-2">
          <Building2 className="h-6 w-6 text-[#C5A46D]" />
          <span className="text-[20px] font-heading font-semibold tracking-wide text-[#F5F2EB]">ASIA WAY</span>
          <span className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 bg-[#C5A46D]/10 text-[#C5A46D] rounded border border-[#C5A46D]/20">Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-[8px] text-[#A8A49B] hover:text-[#F5F2EB] hover:bg-[#C5A46D]/10 transition-colors group"
              >
                <Icon className="h-5 w-5 text-[#A8A49B] group-hover:text-[#C5A46D] transition-colors" />
                <span className="font-medium text-[14px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-[rgba(197,164,109,0.14)] pt-6 px-2 space-y-4">
          <div className="text-[12px] text-[#A8A49B] truncate" title={user?.email}>
            Tizimda: <span className="font-medium text-[#F5F2EB]">{user?.email}</span>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start space-x-2 bg-transparent border-[rgba(197,164,109,0.22)] text-[#F5F2EB] hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 transition-colors rounded-[8px] h-11"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-[13px] font-medium tracking-wide">Chiqish</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Mobile Menu & Header Details */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[rgba(197,164,109,0.14)] bg-[#111417]">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-[#C5A46D]" />
            <span className="font-heading font-medium text-[#F5F2EB] text-[18px]">ASIA WAY</span>
          </div>
          <div className="flex items-center space-x-3">
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
  );
}
