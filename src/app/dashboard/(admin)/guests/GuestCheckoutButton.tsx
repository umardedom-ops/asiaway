"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/app/dashboard/bookings/actions";
import { Loader2, LogOut } from "lucide-react";
import { btnSecondary } from "@/lib/ui";

export default function GuestCheckoutButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await updateBookingStatus(id, "completed"); })}
      disabled={pending}
      className={`${btnSecondary} h-9 px-4 text-[12px]`}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><LogOut className="h-3.5 w-3.5 mr-1.5" /> Checkout</>}
    </button>
  );
}
