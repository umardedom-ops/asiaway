"use client";

import { useState } from "react";
import { updateBookingStatus, updateDepositStatus } from "@/app/dashboard/bookings/actions";
import { Button } from "@/components/ui/button";
import { Check, X, CreditCard, Loader2 } from "lucide-react";

interface BookingRowActionsProps {
  id: string;
  bookingStatus: string;
  depositStatus: string;
}

export default function BookingRowActions({ id, bookingStatus, depositStatus }: BookingRowActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleUpdateBooking = async (status: "confirmed" | "cancelled") => {
    setLoadingAction(status);
    try {
      await updateBookingStatus(id, status);
    } catch (err: any) {
      alert(`Xatolik yuz berdi: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateDeposit = async (status: "paid") => {
    setLoadingAction("deposit_paid");
    try {
      await updateDepositStatus(id, status);
    } catch (err: any) {
      alert(`Xatolik yuz berdi: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      {/* Deposit to'lovi tugmasi */}
      {depositStatus === "pending" && bookingStatus !== "cancelled" && (
        <Button
          size="sm"
          variant="outline"
          disabled={loadingAction !== null}
          onClick={() => handleUpdateDeposit("paid")}
          className="border-emerald-900/50 hover:bg-emerald-950/30 text-emerald-400 hover:text-emerald-300 h-8 text-xs font-semibold space-x-1"
        >
          {loadingAction === "deposit_paid" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CreditCard className="h-3.5 w-3.5" />
          )}
          <span>Zaklat to&apos;landi</span>
        </Button>
      )}

      {/* Bronni tasdiqlash */}
      {bookingStatus === "pending" && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={loadingAction !== null}
            onClick={() => handleUpdateBooking("confirmed")}
            className="border-amber-900/50 hover:bg-amber-950/30 text-amber-500 hover:text-amber-400 h-8 text-xs font-semibold space-x-1"
          >
            {loadingAction === "confirmed" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>Tasdiqlash</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={loadingAction !== null}
            onClick={() => handleUpdateBooking("cancelled")}
            className="border-red-950 hover:bg-red-950/30 text-red-500 hover:text-red-400 h-8 text-xs font-semibold space-x-1"
          >
            {loadingAction === "cancelled" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            <span>Rad etish</span>
          </Button>
        </>
      )}

      {bookingStatus === "confirmed" && (
        <Button
          size="sm"
          variant="outline"
          disabled={loadingAction !== null}
          onClick={() => handleUpdateBooking("cancelled")}
          className="border-red-950 hover:bg-red-950/30 text-red-500 hover:text-red-400 h-8 text-xs font-semibold space-x-1"
        >
          {loadingAction === "cancelled" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          <span>Bekor qilish</span>
        </Button>
      )}
    </div>
  );
}
