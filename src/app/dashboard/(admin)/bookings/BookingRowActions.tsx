"use client";

import { useState } from "react";
import { updateBookingStatus, updateDepositStatus, checkInBooking } from "@/app/dashboard/bookings/actions";
import { Button } from "@/components/ui/button";
import { Check, X, CreditCard, Loader2, Receipt, LogIn, LogOut } from "lucide-react";
import InvoiceModal from "./InvoiceModal";

interface BookingRowActionsProps {
  id: string;
  bookingStatus: string;
  depositStatus: string;
  checkedIn?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking?: any;
}

export default function BookingRowActions({ id, bookingStatus, depositStatus, checkedIn, booking }: BookingRowActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const handleCheckIn = async () => {
    setLoadingAction("checkin");
    try { await checkInBooking(id); }
    catch (err: any) { alert(`Xatolik: ${err.message}`); }
    finally { setLoadingAction(null); }
  };

  const handleCheckout = async () => {
    setLoadingAction("checkout");
    try { await updateBookingStatus(id, "completed"); }
    catch (err: any) { alert(`Xatolik: ${err.message}`); }
    finally { setLoadingAction(null); }
  };

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
      {/* Joylashtirish (check-in) — tasdiqlangan, hali kirmagan mehmon */}
      {bookingStatus === "confirmed" && !checkedIn && (
        <Button
          size="sm"
          variant="outline"
          disabled={loadingAction !== null}
          onClick={handleCheckIn}
          className="border-emerald-900/50 hover:bg-emerald-950/30 text-emerald-400 hover:text-emerald-300 h-8 text-xs font-semibold space-x-1"
        >
          {loadingAction === "checkin" ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}
          <span>Joylashtirish</span>
        </Button>
      )}

      {/* Checkout — hozir turgan mehmon */}
      {bookingStatus === "confirmed" && checkedIn && (
        <Button
          size="sm"
          variant="outline"
          disabled={loadingAction !== null}
          onClick={handleCheckout}
          className="border-blue-900/50 hover:bg-blue-950/30 text-blue-400 hover:text-blue-300 h-8 text-xs font-semibold space-x-1"
        >
          {loadingAction === "checkout" ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
          <span>Checkout</span>
        </Button>
      )}

      {/* Chek (invoice) — confirmed yoki completed bronlar uchun */}
      {(bookingStatus === "confirmed" || bookingStatus === "completed") && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInvoiceOpen(true)}
            className="border-[rgba(197,164,109,0.4)] hover:bg-[#C5A46D]/10 text-[#C5A46D] hover:text-[#D4B77F] h-8 text-xs font-semibold space-x-1"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Chek</span>
          </Button>
          <InvoiceModal isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)} booking={booking} />
        </>
      )}

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
