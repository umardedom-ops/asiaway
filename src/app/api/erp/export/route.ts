import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ERP / SAP integratsiya nuqtasi (API hook).
// Tashqi tizim (SAP, 1C, ...) shu endpointdan ma'lumot oladi:
//   GET /api/erp/export?type=finance|rooms|bookings&from=YYYY-MM-DD&to=YYYY-MM-DD
// Auth: Authorization: Bearer <ERP_API_KEY>  (env'da saqlanadi)

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const key = process.env.ERP_API_KEY;
  if (!key || auth !== `Bearer ${key}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "finance";
  const from = url.searchParams.get("from") || "1970-01-01";
  const to = url.searchParams.get("to") || "2999-12-31";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    if (type === "rooms") {
      // Xonalar qoldig'i va holati
      const { data, error } = await supabase
        .from("apartments")
        .select(
          "id, title, floor, rooms, area_m2, price_per_day, price_per_month, monthly_lease_cost, status, kanban_status"
        );
      if (error) throw error;
      return NextResponse.json({ type, count: data.length, items: data });
    }

    if (type === "bookings") {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, apartment_id, guest_name, guest_phone, channel, check_in, check_out, nights, total_price, deposit_amount, deposit_status, booking_status, payment_provider, created_at"
        )
        .gte("created_at", `${from}T00:00:00Z`)
        .lte("created_at", `${to}T23:59:59Z`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ type, from, to, count: data.length, items: data });
    }

    // type === "finance": daromad (bronlar) + xarajatlar
    const [{ data: bookings, error: bErr }, { data: expenses, error: eErr }] =
      await Promise.all([
        supabase
          .from("bookings")
          .select("id, total_price, deposit_amount, booking_status, created_at")
          .neq("booking_status", "cancelled")
          .gte("created_at", `${from}T00:00:00Z`)
          .lte("created_at", `${to}T23:59:59Z`),
        supabase
          .from("expenses")
          .select("id, category, amount, currency, spent_on, apartment_id, note")
          .gte("spent_on", from)
          .lte("spent_on", to),
      ]);
    if (bErr) throw bErr;
    if (eErr) throw eErr;

    const income = (bookings || []).reduce((s, b) => s + Number(b.total_price || 0), 0);
    const expenseTotal = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);

    return NextResponse.json({
      type: "finance",
      from,
      to,
      summary: {
        income_usd: income,
        expenses_usd: expenseTotal,
        profit_usd: income - expenseTotal,
      },
      bookings: bookings || [],
      expenses: expenses || [],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
