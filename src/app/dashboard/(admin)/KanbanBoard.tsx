"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";

type Apartment = {
  id: string;
  title: string;
  kanban_status: 'available' | 'occupied' | 'dirty' | 'cleaning';
  owner_phone?: string;
  monthly_lease_cost?: number;
};

export default function KanbanBoard({ initialData }: { initialData: Apartment[] }) {
  const [apartments, setApartments] = useState<Apartment[]>(initialData);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Supabase Realtime kanalini sozlash
    const channel = supabase.channel('realtime-apartments')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'apartments' }, 
        (payload) => {
          setApartments((current) => 
            current.map((apt) => 
              apt.id === payload.new.id ? { ...apt, kanban_status: payload.new.kanban_status } : apt
            )
          );
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'apartments' },
        (payload) => {
          setApartments((current) => [payload.new as Apartment, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Status bo'yicha guruhlash
  const available = apartments.filter(a => a.kanban_status === 'available');
  const occupied = apartments.filter(a => a.kanban_status === 'occupied');
  const dirty = apartments.filter(a => a.kanban_status === 'dirty');
  const cleaning = apartments.filter(a => a.kanban_status === 'cleaning');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-heading font-medium text-[#F5F2EB]">Jonli Holatlar Doskasi (Kanban)</h2>
        <p className="text-[13px] text-[#A8A49B] mt-1 font-light">Apartament holatlari sahifani yangilamasdan, bir zumda o&apos;zgaradi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* BO'SH (AVAILABLE) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#22c55e]/20 pb-2">
            <h3 className="text-[14px] font-medium text-[#22c55e] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span> Bo&apos;sh (Sotuvga tayyor)
            </h3>
            <Badge variant="outline" className="text-[#22c55e] border-[#22c55e]/30">{available.length}</Badge>
          </div>
          <div className="space-y-3">
            {available.map(apt => (
              <Card key={apt.id} className="bg-[#111417] border-[#22c55e]/10 hover:border-[#22c55e]/30 transition-colors shadow-none cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="font-medium text-[#F5F2EB] text-[14px] truncate">{apt.title}</div>
                  <Home className="h-4 w-4 text-[#22c55e]/60" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* BAND (OCCUPIED) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
            <h3 className="text-[14px] font-medium text-red-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Band (Mehmon bor)
            </h3>
            <Badge variant="outline" className="text-red-500 border-red-500/30">{occupied.length}</Badge>
          </div>
          <div className="space-y-3">
            {occupied.map(apt => (
              <Card key={apt.id} className="bg-[#111417] border-red-500/10 hover:border-red-500/30 transition-colors shadow-none cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="font-medium text-[#F5F2EB] text-[14px] truncate">{apt.title}</div>
                  <Home className="h-4 w-4 text-red-500/60" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* IFLOS (DIRTY) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-yellow-500/20 pb-2">
            <h3 className="text-[14px] font-medium text-yellow-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Check-out qilingan
            </h3>
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">{dirty.length}</Badge>
          </div>
          <div className="space-y-3">
            {dirty.map(apt => (
              <Card key={apt.id} className="bg-[#111417] border-yellow-500/10 hover:border-yellow-500/30 transition-colors shadow-none cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="font-medium text-[#F5F2EB] text-[14px] truncate">{apt.title}</div>
                  <Home className="h-4 w-4 text-yellow-500/60" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* TOZALANYAPTI (CLEANING) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
            <h3 className="text-[14px] font-medium text-blue-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tozalanyapti
            </h3>
            <Badge variant="outline" className="text-blue-500 border-blue-500/30">{cleaning.length}</Badge>
          </div>
          <div className="space-y-3">
            {cleaning.map(apt => (
              <Card key={apt.id} className="bg-[#111417] border-blue-500/10 hover:border-blue-500/30 transition-colors shadow-none cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="font-medium text-[#F5F2EB] text-[14px] truncate">{apt.title}</div>
                  <Home className="h-4 w-4 text-blue-500/60" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
