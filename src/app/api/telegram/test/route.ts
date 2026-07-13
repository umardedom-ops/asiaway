import { NextResponse } from "next/server";
import { notifyRole, type BotRole } from "@/lib/telegram";

// Test xabar yuborish: /api/telegram/test?role=menejer
// notifyRole yo'lini to'g'ridan-to'g'ri sinaydi (lead oqimidan mustaqil).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const role = (url.searchParams.get("role") || "menejer") as BotRole;

  if (!["shef", "menejer", "cleaning"].includes(role)) {
    return NextResponse.json({ error: "role: shef | menejer | cleaning" }, { status: 400 });
  }

  await notifyRole(
    role,
    `🧪 <b>TEST XABAR</b>\n\nBu — ${role.toUpperCase()} roli uchun sinov xabari.\nAgar buni ko'rsangiz, Telegram ulanishi ishlayapti ✅\n\nVaqt: ${new Date().toLocaleString("uz-UZ")}`
  );

  return NextResponse.json({
    sent: true,
    role,
    note: "Agar Telegram'ga xabar kelmasa: token yoki obuna muammosi. /api/telegram/status ni tekshiring.",
  });
}
