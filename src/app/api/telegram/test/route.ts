import { NextResponse } from "next/server";
import { notifyRole, type BotRole } from "@/lib/telegram";

// Test xabar: /api/telegram/test?role=menejer  (yoki cleaning / shef)
// Tugmali variant:  &btn=1  — inline tugma bilan yuboradi (vazifa xabari kabi)
// HAQIQIY natijani qaytaradi: sent (nechta chatga ketdi) + reason (rad etilsa sabab).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const role = (url.searchParams.get("role") || "menejer") as BotRole;
  const withBtn = url.searchParams.get("btn") === "1";

  if (!["shef", "menejer", "cleaning"].includes(role)) {
    return NextResponse.json({ error: "role: shef | menejer | cleaning" }, { status: 400 });
  }

  const result = await notifyRole(
    role,
    `🧪 <b>TEST XABAR</b>\n\nBu — ${role.toUpperCase()} roli uchun sinov.\nVaqt: ${new Date().toLocaleString("uz-UZ")}`,
    withBtn
      ? [[{ text: "✅ Test tugma", callback_data: "task:00000000-0000-0000-0000-000000000000:done" }]]
      : undefined
  );

  return NextResponse.json({
    ...result, // { sent, role, reason? }
    ok: result.sent > 0,
    tugma_bilan: withBtn,
    izoh:
      result.sent > 0
        ? "Xabar Telegram tomonidan QABUL QILINDI."
        : `YUBORILMADI. Sabab: ${result.reason}`,
  });
}
