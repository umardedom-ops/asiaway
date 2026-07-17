import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/export-auth";

export const revalidate = 0;

/**
 * Moliyaviy Excel (finansist/shef) — yashirin ikonkadan yuklab olinadi.
 * Varaqlar: Oylik P&L (6 oy) · Kirim jurnali · Xarajatlar · Apartamentlar · Xulosalar.
 * Summalar USD.
 */

const GOLD = "FFC5A46D";
const DARK = "FF111417";

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  row.height = 20;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const auth = await requireRole(["shef", "finansist"]);
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  const sinceStr = since.toISOString().split("T")[0];

  const [{ data: bookings }, { data: payments }, { data: expenses }, { data: apartments }, { data: staff }] =
    await Promise.all([
      svc.from("bookings")
        .select("apartment_id, total_price, check_in, booking_status")
        .gte("check_in", sinceStr)
        .in("booking_status", ["confirmed", "completed"]),
      svc.from("payments")
        .select("paid_at, guest_name, amount, method, kind, note")
        .gte("paid_at", `${sinceStr}T00:00:00Z`)
        .order("paid_at", { ascending: false }),
      svc.from("expenses")
        .select("spent_on, amount, category, note, apartment_id")
        .gte("spent_on", sinceStr)
        .order("spent_on", { ascending: false }),
      svc.from("apartments").select("id, title, monthly_lease_cost, status"),
      svc.from("staff").select("monthly_salary, active"),
    ]);

  const apts = apartments || [];
  const aptTitle = (id: string | null) => apts.find((a) => a.id === id)?.title || "—";
  const rentMonthly = apts
    .filter((a) => a.status === "active")
    .reduce((s, a) => s + Number(a.monthly_lease_cost || 0), 0);
  const salaryMonthly = (staff || [])
    .filter((s) => s.active !== false)
    .reduce((sum, s) => sum + Number(s.monthly_salary || 0), 0);

  const wb = new ExcelJS.Workbook();
  wb.creator = "ASIA WAY PMS";
  wb.created = new Date();

  // ---------- 1. Oylik P&L ----------
  const pl = wb.addWorksheet("Oylik P&L");
  pl.columns = [
    { header: "Oy", key: "m", width: 12 },
    { header: "Daromad (bronlar)", key: "inc", width: 20 },
    { header: "O'zgaruvchan xarajat", key: "vexp", width: 20 },
    { header: "Arenda (tan narx)", key: "rent", width: 18 },
    { header: "Ish haqi", key: "sal", width: 14 },
    { header: "Sof foyda", key: "net", width: 16 },
    { header: "Marja %", key: "mg", width: 10 },
  ];
  styleHeader(pl.getRow(1));

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(monthKey(d));
  }
  const plRows: { m: string; inc: number; vexp: number; net: number }[] = [];
  for (const m of months) {
    const inc = (bookings || [])
      .filter((b) => String(b.check_in).startsWith(m))
      .reduce((s, b) => s + Number(b.total_price || 0), 0);
    const vexp = (expenses || [])
      .filter((e) => String(e.spent_on).startsWith(m))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const net = inc - vexp - rentMonthly - salaryMonthly;
    const mg = inc > 0 ? Math.round((net / inc) * 100) : 0;
    plRows.push({ m, inc, vexp, net });
    pl.addRow({ m, inc, vexp, rent: rentMonthly, sal: salaryMonthly, net, mg: `${mg}%` });
  }
  for (const col of ["inc", "vexp", "rent", "sal", "net"]) {
    pl.getColumn(col).numFmt = '"$"#,##0';
  }

  // ---------- 2. Kirim jurnali ----------
  const inc = wb.addWorksheet("Kirim jurnali");
  inc.columns = [
    { header: "Sana", key: "d", width: 18 },
    { header: "Mehmon", key: "g", width: 24 },
    { header: "Summa", key: "a", width: 12 },
    { header: "Usul", key: "m", width: 12 },
    { header: "Turi", key: "k", width: 12 },
    { header: "Izoh", key: "n", width: 36 },
  ];
  styleHeader(inc.getRow(1));
  for (const p of payments || []) {
    inc.addRow({
      d: p.paid_at ? new Date(p.paid_at).toLocaleString("ru-RU") : "",
      g: p.guest_name, a: Number(p.amount || 0), m: p.method, k: p.kind, n: p.note,
    });
  }
  inc.getColumn("a").numFmt = '"$"#,##0.00';

  // ---------- 3. Xarajatlar ----------
  const exp = wb.addWorksheet("Xarajatlar");
  exp.columns = [
    { header: "Sana", key: "d", width: 14 },
    { header: "Kategoriya", key: "c", width: 18 },
    { header: "Summa", key: "a", width: 12 },
    { header: "Apartament", key: "ap", width: 28 },
    { header: "Izoh", key: "n", width: 36 },
  ];
  styleHeader(exp.getRow(1));
  for (const e of expenses || []) {
    exp.addRow({ d: e.spent_on, c: e.category, a: Number(e.amount || 0), ap: aptTitle(e.apartment_id), n: e.note });
  }
  exp.getColumn("a").numFmt = '"$"#,##0.00';

  // ---------- 4. Apartamentlar (joriy oy) ----------
  const curM = monthKey(new Date());
  const aptWs = wb.addWorksheet("Apartamentlar");
  aptWs.columns = [
    { header: "Apartament", key: "t", width: 32 },
    { header: "Daromad (joriy oy)", key: "i", width: 18 },
    { header: "Arenda", key: "l", width: 14 },
    { header: "Sof", key: "n", width: 14 },
  ];
  styleHeader(aptWs.getRow(1));
  const perApt = apts
    .filter((a) => a.status === "active")
    .map((a) => {
      const i = (bookings || [])
        .filter((b) => b.apartment_id === a.id && String(b.check_in).startsWith(curM))
        .reduce((s, b) => s + Number(b.total_price || 0), 0);
      const l = Number(a.monthly_lease_cost || 0);
      return { t: a.title, i, l, n: i - l };
    })
    .sort((x, y) => y.n - x.n);
  for (const r of perApt) aptWs.addRow(r);
  for (const col of ["i", "l", "n"]) aptWs.getColumn(col).numFmt = '"$"#,##0';

  // ---------- 5. Xulosalar (avtomatik tahlil) ----------
  const sum = wb.addWorksheet("Xulosalar");
  sum.columns = [{ header: "Tahlil xulosalari", key: "x", width: 100 }];
  styleHeader(sum.getRow(1));

  const cur = plRows[plRows.length - 1];
  const best = [...plRows].sort((a, b) => b.inc - a.inc)[0];
  const curMargin = cur.inc > 0 ? Math.round((cur.net / cur.inc) * 100) : 0;
  const bestApt = perApt[0];
  const worstApt = perApt[perApt.length - 1];
  const byCat = new Map<string, number>();
  for (const e of expenses || []) {
    if (!String(e.spent_on).startsWith(curM)) continue;
    byCat.set(e.category, (byCat.get(e.category) || 0) + Number(e.amount || 0));
  }
  const topCat = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];

  const conclusions: string[] = [
    `Joriy oy (${cur.m}): daromad $${cur.inc.toLocaleString()}, sof natija $${cur.net.toLocaleString()} (marja ${curMargin}%).`,
    `Eng yaxshi oy (6 oy ichida): ${best.m} — daromad $${best.inc.toLocaleString()}.`,
    bestApt ? `Eng foydali apartament (joriy oy): ${bestApt.t} — sof $${bestApt.n.toLocaleString()}.` : "",
    worstApt && worstApt.n < 0 ? `Eng zarar keltirayotgan apartament: ${worstApt.t} — sof $${worstApt.n.toLocaleString()}. Narx/bandlik strategiyasini ko'rib chiqing.` : "",
    topCat ? `Joriy oy eng katta o'zgaruvchan xarajat: ${topCat[0]} — $${topCat[1].toLocaleString()}.` : "",
    `Doimiy oylik yuk: arenda $${rentMonthly.toLocaleString()} + ish haqi $${salaryMonthly.toLocaleString()} = $${(rentMonthly + salaryMonthly).toLocaleString()}. Zararsizlik nuqtasi shundan yuqori daromad talab qiladi.`,
    cur.net < 0
      ? `DIQQAT: joriy oy zarar bilan ketmoqda. Bandlikni oshirish (marketing) yoki arenda shartlarini qayta kelishish tavsiya etiladi.`
      : `Joriy oy foydada — trendni saqlash uchun bandlik va o'rtacha kecha narxini kuzatib boring.`,
  ].filter(Boolean);

  for (const c of conclusions) {
    const r = sum.addRow({ x: `• ${c}` });
    r.alignment = { wrapText: true, vertical: "top" };
  }
  sum.getRow(1).font = { bold: true, color: { argb: GOLD } };

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="asiaway-moliya-${curM}.xlsx"`,
    },
  });
}
