"use client";

import { useState } from "react";
import { deleteApartment } from "@/app/dashboard/apartments/actions";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface DeleteButtonProps {
  id: string;
  title: string;
}

export default function DeleteButton({ id, title }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Haqiqatan ham "${title}" apartamentini o'chirmoqchisiz? Bu amalni ortga qaytarib bo'lmaydi.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteApartment(id);
    } catch (err: any) {
      toast(`Xatolik yuz berdi: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      disabled={isDeleting}
      onClick={handleDelete}
      className="bg-red-950/40 hover:bg-red-900 border border-red-900/50 text-red-400 hover:text-white"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
