"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/app/dashboard/bookings/actions";
import { Loader2, LogOut } from "lucide-react";
import { btnSecondary } from "@/lib/ui";
import InvoiceModal from "../bookings/InvoiceModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GuestCheckoutButton({ id, booking }: { id: string; booking?: any }) {
  const [pending, start] = useTransition();
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => start(async () => { await updateBookingStatus(id, "completed"); setInvoiceOpen(true); })}
        disabled={pending}
        className={`${btnSecondary} h-9 px-4 text-[12px]`}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><LogOut className="h-3.5 w-3.5 mr-1.5" /> Checkout</>}
      </button>
      <InvoiceModal isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)} booking={booking} />
    </>
  );
}
