"use client";

import { useState } from "react";
import { deleteExpense } from "./actions";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteExpenseButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => { setBusy(true); await deleteExpense(id); setBusy(false); }}
      disabled={busy}
      aria-label="O'chirish"
      className="text-[#A8A49B] hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
