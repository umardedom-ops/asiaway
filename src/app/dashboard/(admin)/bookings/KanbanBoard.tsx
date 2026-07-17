"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateBookingStatus, checkInBooking } from "@/app/dashboard/bookings/actions";
import { Badge } from "@/components/ui/badge";
import { CHANNEL_LABELS, CHANNEL_STYLE } from "./channels";
import { Info } from "lucide-react";
import { toast } from "@/components/ui/toast";

const formatPrice = (amount: number) => `$${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const formatDate = (dateStr: string, isRu?: boolean) =>
  new Date(dateStr).toLocaleDateString(isRu ? "ru-RU" : "uz-UZ", { day: "numeric", month: "short", year: "numeric" });

type ColumnId = "pending" | "confirmed" | "checked_in" | "completed";

const COLUMN_IDS: ColumnId[] = ["pending", "confirmed", "checked_in", "completed"];

function getColumnId(b: any): ColumnId {
  if (b.booking_status === "completed") return "completed";
  if (b.booking_status === "confirmed" && b.checked_in_at) return "checked_in";
  if (b.booking_status === "confirmed") return "confirmed";
  return "pending"; // default for pending and cancelled (cancelled can be hidden or put in pending)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableItem({ id, booking, isRu, d }: { id: string; booking: any; isRu: boolean; d: ReturnType<typeof useDashLang> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const ch = booking.channel || "direct";
  const aptTitle = booking.apartments?.title || "—";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[#111417] border border-[rgba(197,164,109,0.14)] p-3 rounded-[8px] mb-3 cursor-grab active:cursor-grabbing hover:border-[rgba(197,164,109,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C5A46D]/5 relative group"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium text-[#F5F2EB] text-[13px]">{booking.guest_name}</div>
          <div className="text-[11px] text-[#A8A49B]">{booking.guest_phone}</div>
        </div>
        <span className={`inline-block text-[9px] font-medium px-2 py-0.5 rounded-full border ${CHANNEL_STYLE[ch] || CHANNEL_STYLE.other}`}>
          {d.channels[ch as keyof typeof d.channels] || CHANNEL_LABELS[ch] || ch}
        </span>
      </div>

      <div className="text-[11px] text-[#C5A46D] mb-1 truncate" title={aptTitle}>{aptTitle}</div>
      <div className="text-[11px] text-[#A8A49B] mb-2">
        {formatDate(booking.check_in, isRu)} — {formatDate(booking.check_out, isRu)}
      </div>

      <div className="flex justify-between items-end border-t border-[rgba(197,164,109,0.08)] pt-2">
        <div>
          <div className="text-[#F5F2EB] font-semibold text-[13px]">{formatPrice(booking.total_price)}</div>
          {booking.deposit_status === "paid" && (
             <span className="text-[9px] text-emerald-400">{d.reception.deposit}: {d.ownerPay.paidLabel}</span>
          )}
        </div>
        
        {/* Marketing tracking tooltip (targetolog uchun): source + utm_data (jsonb) + izoh */}
        {(booking.source || booking.utm_data || booking.notes) && (
          <div className="relative flex items-center justify-center">
            <Info className="h-4 w-4 text-[#A8A49B] hover:text-[#C5A46D] cursor-help peer transition-colors" />
            <div className="absolute bottom-full right-0 mb-2 w-52 p-2.5 bg-[#0B0D0F] border border-[rgba(197,164,109,0.25)] rounded-[8px] text-[10.5px] text-[#A8A49B] opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 z-50 shadow-xl shadow-black/50 space-y-0.5 text-left">
              {booking.source && <div><strong className="text-[#C5A46D]">Source:</strong> {booking.source}</div>}
              {booking.utm_data?.utm_medium && <div><strong className="text-[#C5A46D]">Medium:</strong> {booking.utm_data.utm_medium}</div>}
              {booking.utm_data?.utm_campaign && <div><strong className="text-[#C5A46D]">Campaign:</strong> {booking.utm_data.utm_campaign}</div>}
              {booking.utm_data?.utm_content && <div><strong className="text-[#C5A46D]">Content:</strong> {booking.utm_data.utm_content}</div>}
              {booking.utm_data?.fbclid && <div className="truncate"><strong className="text-[#C5A46D]">fbclid:</strong> {booking.utm_data.fbclid}</div>}
              {booking.notes && <div className="mt-1 border-t border-[rgba(197,164,109,0.12)] pt-1 text-[#F5F2EB]"><strong className="text-[#C5A46D]">{isRu ? "Примечание" : "Izoh"}:</strong> {booking.notes}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useDashLang } from "@/components/DashboardLangProvider";

export default function KanbanBoard({ initialBookings }: { initialBookings: any[] }) {
  const d = useDashLang();
  const isRu = d.lang === "ru";

  // Kolonka sarlavhalari — i18n lug'atidan (uz/ru/en)
  const COLUMN_TITLES: Record<ColumnId, string> = {
    pending: d.reception.pending,
    confirmed: d.reception.confirmed,
    checked_in: d.reception.staying,
    completed: d.reception.completed,
  };

  const [items, setItems] = useState<Record<ColumnId, any[]>>({
    pending: [],
    confirmed: [],
    checked_in: [],
    completed: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  // Drag boshlanganda element QAYSI kolonkada bo'lganini eslab qolamiz —
  // handleDragOver optimistik ravishda elementni yangi kolonkaga ko'chiradi,
  // shuning uchun handleDragEnd'da "eski" kolonkani items'dan topib bo'lmaydi.
  const [originContainer, setOriginContainer] = useState<ColumnId | null>(null);

  useEffect(() => {
    const newItems: Record<ColumnId, any[]> = {
      pending: [],
      confirmed: [],
      checked_in: [],
      completed: [],
    };
    // Hide cancelled bookings from the board or keep them in pending
    initialBookings.forEach((b) => {
      if (b.booking_status !== "cancelled") {
         newItems[getColumnId(b)].push(b);
      }
    });
    setItems(newItems);
  }, [initialBookings]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    const origin = (Object.keys(items) as ColumnId[]).find((key) =>
      items[key].some((item) => item.id === id)
    );
    setOriginContainer(origin ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the containers
    const activeContainer = Object.keys(items).find((key) =>
      items[key as ColumnId].some((item) => item.id === activeId)
    ) as ColumnId;
    
    let overContainer = Object.keys(items).find((key) =>
      items[key as ColumnId].some((item) => item.id === overId)
    ) as ColumnId;

    if (!overContainer && COLUMN_IDS.includes(overId as ColumnId)) {
        overContainer = overId as ColumnId;
    }

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      return {
        ...prev,
        [activeContainer]: [
          ...activeItems.slice(0, activeIndex),
          ...activeItems.slice(activeIndex + 1),
        ],
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          activeItems[activeIndex],
          ...overItems.slice(overIndex, overItems.length),
        ],
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    const origin = originContainer;
    setOriginContainer(null);

    if (!over) return;

    // handleDragOver elementni allaqachon yangi kolonkaga ko'chirgan,
    // shuning uchun HOZIRGI kolonka = element turgan joy.
    const activeContainer = (Object.keys(items) as ColumnId[]).find((key) =>
      items[key].some((item) => item.id === active.id)
    ) as ColumnId;

    let overContainer = (Object.keys(items) as ColumnId[]).find((key) =>
      items[key].some((item) => item.id === over.id)
    ) as ColumnId;

    if (!overContainer && COLUMN_IDS.includes(over.id as ColumnId)) {
        overContainer = over.id as ColumnId;
    }

    const finalContainer = overContainer || activeContainer;

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = items[activeContainer].findIndex((item) => item.id === active.id);
      const overIndex = items[overContainer].findIndex((item) => item.id === over.id);

      if (activeIndex !== overIndex) {
        setItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
        }));
      }
    }

    // DB'ga yozish: ASL (drag boshlanishidagi) kolonka bilan YAKUNIY kolonkani solishtiramiz
    if (origin && finalContainer && origin !== finalContainer) {
      const overContainerDb = finalContainer;
       const id = active.id as string;
       try {
         if (overContainerDb === "confirmed") {
            await updateBookingStatus(id, "confirmed");
         } else if (overContainerDb === "checked_in") {
            await checkInBooking(id);
         } else if (overContainerDb === "completed") {
            await updateBookingStatus(id, "completed");
         } else if (overContainerDb === "pending") {
            await updateBookingStatus(id, "pending");
         }
       } catch (err: any) {
         toast((isRu ? "Ошибка: " : "Xatolik: ") + err.message);
         // Ideally revert state here, but for simplicity we rely on next refresh or user refresh
       }
    }
  };

  const getBookingById = (id: string) => {
    for (const key of Object.keys(items)) {
      const found = items[key as ColumnId].find(i => i.id === id);
      if (found) return found;
    }
    return null;
  };

  const activeBooking = activeId ? getBookingById(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        {COLUMN_IDS.map((colId) => (
          <div key={colId} className="flex-shrink-0 w-80 bg-[#0B0D0F] rounded-[12px] border border-[rgba(197,164,109,0.14)] flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[rgba(197,164,109,0.14)] flex justify-between items-center bg-[#111417] rounded-t-[12px]">
              <h3 className="font-semibold text-[#F5F2EB] tracking-wide text-[13px] uppercase">{COLUMN_TITLES[colId]}</h3>
              <Badge className="bg-[#C5A46D]/10 text-[#C5A46D]">{items[colId].length}</Badge>
            </div>

            <SortableContext id={colId} items={items[colId].map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="p-3 flex-1 overflow-y-auto min-h-[150px]">
                {items[colId].map((booking) => (
                  <SortableItem key={booking.id} id={booking.id} booking={booking} isRu={isRu} d={d} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeBooking ? (
          <div className="bg-[#111417] border border-[#C5A46D] p-3 rounded-[8px] opacity-90 shadow-xl shadow-[#C5A46D]/10 rotate-2 w-80">
            <div className="font-medium text-[#F5F2EB] text-[13px] mb-1">{activeBooking.guest_name}</div>
            <div className="text-[11px] text-[#A8A49B]">{formatDate(activeBooking.check_in, isRu)}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
