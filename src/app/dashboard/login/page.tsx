import { login } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";
import InstallPwaButton from "@/components/InstallPwaButton";

interface PageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0D0F] px-4 py-12 font-sans">
      <Card className="w-full max-w-md border-[rgba(197,164,109,0.14)] bg-[#111417] shadow-2xl rounded-[12px]">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C5A46D]/10 text-[#C5A46D] border border-[#C5A46D]/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-[28px] font-heading font-medium tracking-wide text-[#F5F2EB] mt-4">
            AsiaWay
          </CardTitle>
          <CardDescription className="text-[13px] text-[#A8A49B] tracking-wide mt-2">
            Tizimga kirish uchun ma&apos;lumotlarni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-[8px] bg-red-950/40 p-4 text-[13px] text-red-400 border border-red-900/50">
              {error === "unauthorized" 
                ? "Sizda admin huquqlari mavjud emas!" 
                : "Email yoki parol noto'g'ri. Iltimos, qaytadan urinib ko'ring."}
            </div>
          )}

          <form action={login} className="space-y-5" autoComplete="off">
            {/* Brauzer eski admin@makon.uz ni avto-to'ldirmasligi uchun soxta maydonlar */}
            <input type="text" name="fake-user" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
            <input type="password" name="fake-pass" autoComplete="new-password" className="hidden" tabIndex={-1} aria-hidden="true" />
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[13px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Email manzili</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="rol@asiaway.uz"
                required
                autoComplete="off"
                className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] placeholder:text-[#A8A49B]/50 focus-visible:ring-[#C5A46D]/30 focus-visible:border-[#C5A46D]"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] text-[#A8A49B] uppercase tracking-[0.1em] font-semibold">Parol</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-12 rounded-[8px] border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] text-[#F5F2EB] placeholder:text-[#A8A49B]/50 focus-visible:ring-[#C5A46D]/30 focus-visible:border-[#C5A46D]"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 mt-4 rounded-[8px] bg-[#C5A46D] font-semibold tracking-wide text-[#0B0D0F] hover:bg-[#D4B77F] transition-colors"
            >
              Kirish
            </Button>
          </form>

          {/* PWA: kompyuter/telefonga ilova sifatida o'rnatish (brauzer qo'llasa ko'rinadi) */}
          <div className="mt-5">
            <InstallPwaButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
