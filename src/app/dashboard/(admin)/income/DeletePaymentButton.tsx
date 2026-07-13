"use client";

import { useTransition } from "react";
import { deletePayment } from "./actions";
import { Loader2, Trash2 } from "lucide-react";

export default function DeletePaymentButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await deletePayment(id); })}
      disabled={pending}
      aria-label="O'chirish"
      className="text-[#A8A49B] hover:text-red-400 transition-colors"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
