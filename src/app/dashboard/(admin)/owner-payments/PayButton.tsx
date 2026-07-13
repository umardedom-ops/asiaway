"use client";

import { useTransition } from "react";
import { markLeasePaid } from "./actions";
import { Loader2, Check } from "lucide-react";
import { btnPrimary } from "@/lib/ui";

export default function PayButton({
  apartmentId,
  period,
}: {
  apartmentId: string;
  period: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() => start(async () => { await markLeasePaid(apartmentId, period); })}
      disabled={pending}
      className={`${btnPrimary} h-9 px-4 text-[12px]`}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <>
          <Check className="h-3.5 w-3.5 mr-1.5" /> To&apos;landi
        </>
      )}
    </button>
  );
}
