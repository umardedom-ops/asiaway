import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/export-auth";

export const revalidate = 0;

/**
 * Targetolog Excel (targetolog/shef) — mijozlar bazasi + marketing tahlili.
 * Varaqlar: Mijozlar · Bronlar (source/UTM) · Kanal tahlili · Leadlar.
 */

const DARK = "FF111417";

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  row.height = 20;
}

export async function GET() {
  const auth = await requireRole(["shef", "targetolog"]);
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: clients }, { data: bookings }, { data: leads }, { data: apartments }] = await Promise.all([
    svc.from("clients").select("*").order("created_at", { ascending: false }),
    svc.from("bookings").select("*").order("created_at", { ascending: false }),
    svc.from("leads").select("*").order("created_at", { ascending: false }),
    svc.from("apartments").select("id, title"),
  ]);

  const aptTitle = (id: string | null) => (apartments || []).find((a) => a.id === id)?.title || "—";

  const wb = new ExcelJS.Workbook();
  wb.creator = "ASIA WAY PMS";

  // ---------- 1. Mijozlar bazasi ----------
  const cl = wb.addWorksheet("Mijozlar");
  cl.columns = [
    { header: "Ism", key: "n", width: 26 },
    { header: "Telefon", key: "p", width: 18 },
    { header: "Email", key: "e", width: 26 },
    { header: "Bosqich", key: "s", width: 14 },
    { header: "Tashriflar", key: "v", width: 11 },
    { header: "Umumiy sarf", key: "t", width: 14 },
    { header: "Qo'shilgan", key: "c", width: 14 },
  ];
  styleHeader(cl.getRow(1));
  for (const c of clients || []) {
    cl.addRow({
      n: c.name, p: c.phone, e: c.email || "", s: c.stage || "",
      v: Number(c.total_stays || 0), t: Number(c.total_spent || 0),
      c: c.created_at ? String(c.created_at).split("T")[0] : "",
    });
  }
  cl.getColumn("t").numFmt = '"$"#,##0';

  // ---------- 2. Bronlar (marketing kesimi) ----------
  const bk = wb.addWorksheet("Bronlar (marketing)");
  bk.columns = [
    { header: "Sana", key: "d", width: 12 },
    { header: "Mehmon", key: "g", width: 24 },
    { header: "Telefon", key: "p", width: 16 },
    { header: "Apartament", key: "ap", width: 26 },
    { header: "Kanal", key: "ch", width: 12 },
    { header: "Source", key: "src", width: 14 },
    { header: "utm_medium", key: "um", width: 14 },
    { header: "utm_campaign", key: "uc", width: 20 },
    { header: "utm_content", key: "uo", width: 16 },
    { header: "fbclid", key: "fb", width: 10 },
    { header: "Summa", key: "a", width: 12 },
    { header: "Holat", key: "st", width: 12 },
  ];
  styleHeader(bk.getRow(1));
  for (const b of bookings || []) {
    const u = b.utm_data || {};
    bk.addRow({
      d: b.created_at ? String(b.created_at).split("T")[0] : "",
      g: b.guest_name, p: b.guest_phone, ap: aptTitle(b.apartment_id),
      ch: b.channel || "", src: b.source || "",
      um: u.utm_medium || "", uc: u.utm_campaign || "", uo: u.utm_content || "",
      fb: u.fbclid ? "ha" : "", a: Number(b.total_price || 0), st: b.booking_status,
    });
  }
  bk.getColumn("a").numFmt = '"$"#,##0';

  // ---------- 3. Kanal tahlili ----------
  const an = wb.addWorksheet("Kanal tahlili");
  an.columns = [
    { header: "Manba (source/kanal)", key: "s", width: 22 },
    { header: "Bronlar soni", key: "c", width: 14 },
    { header: "Jami summa", key: "t", width: 14 },
    { header: "O'rtacha chek", key: "avg", width: 14 },
    { header: "Bekor qilinganlar", key: "x", width: 16 },
  ];
  styleHeader(an.getRow(1));
  const bySrc = new Map<string, { c: number; t: number; x: number }>();
  for (const b of bookings || []) {
    const key = (b.source || b.channel || "nomalum").toLowerCase();
    const cur = bySrc.get(key) || { c: 0, t: 0, x: 0 };
    if (b.booking_status === "cancelled") cur.x += 1;
    else { cur.c += 1; cur.t += Number(b.total_price || 0); }
    bySrc.set(key, cur);
  }
  for (const [s, v] of [...bySrc.entries()].sort((a, b) => b[1].t - a[1].t)) {
    an.addRow({ s, c: v.c, t: v.t, avg: v.c > 0 ? Math.round(v.t / v.c) : 0, x: v.x });
  }
  an.getColumn("t").numFmt = '"$"#,##0';
  an.getColumn("avg").numFmt = '"$"#,##0';

  // ---------- 4. Leadlar (konversiya) ----------
  const ld = wb.addWorksheet("Leadlar");
  ld.columns = [
    { header: "Sana", key: "d", width: 12 },
    { header: "Ism", key: "n", width: 22 },
    { header: "Telefon", key: "p", width: 16 },
    { header: "Manba", key: "s", width: 14 },
    { header: "Holat", key: "st", width: 14 },
    { header: "Xabar", key: "m", width: 40 },
  ];
  styleHeader(ld.getRow(1));
  for (const l of leads || []) {
    ld.addRow({
      d: l.created_at ? String(l.created_at).split("T")[0] : "",
      n: l.name, p: l.phone, s: l.source || "", st: l.status, m: l.message || "",
    });
  }
  // Konversiya xulosasi
  const total = (leads || []).length;
  const won = (leads || []).filter((l) => l.status === "won").length;
  ld.addRow({});
  const convRow = ld.addRow({
    d: "", n: `JAMI: ${total} lead`, p: `Bronga aylandi: ${won}`,
    s: total > 0 ? `Konversiya: ${Math.round((won / total) * 100)}%` : "",
  });
  convRow.font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().split("T")[0];
  return new NextResponse(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="asiaway-mijozlar-${stamp}.xlsx"`,
    },
  });
}
