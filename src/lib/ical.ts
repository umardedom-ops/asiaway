/**
 * iCal (RFC 5545) — o'qish va yozish. Faqat bron sinxronizatsiyasi uchun kerakli qismi:
 * VEVENT ichidagi UID, DTSTART, DTEND, SUMMARY, DESCRIPTION, STATUS.
 *
 * Airbnb, Booking.com va boshqa platformalar band sanalarni shu formatda beradi
 * (odatda DTSTART;VALUE=DATE:20261010 — kelish kuni, DTEND — ketish kuni).
 * Sana satri hamma joyda "YYYY-MM-DD" ko'rinishida (bookings.check_in/check_out kabi).
 */

export interface IcsEvent {
  uid: string;
  start: string; // YYYY-MM-DD, kelish kuni
  end: string; // YYYY-MM-DD, ketish kuni (shu kun band EMAS)
  summary: string;
  description: string;
}

// Toshkent UTC+5, yozgi vaqt yo'q
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function tashkentToday(now = Date.now()): string {
  return new Date(now + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function nightsBetween(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);
}

function unescapeText(v: string): string {
  return v.replace(/\\([\\;,nN])/g, (_, c: string) => (c === "n" || c === "N" ? "\n" : c));
}

/** "20261010", "20261010T140000Z", "20261010T140000" → "2026-10-10" (UTC vaqt Toshkentga o'giriladi) */
function parseIcsDate(value: string): string | null {
  const m = value.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh, mi, ss, z] = m;
  if (hh && z) {
    const utc = Date.UTC(+y, +mo - 1, +d, +hh, +mi, +ss);
    return new Date(utc + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
  }
  return `${y}-${mo}-${d}`;
}

/** "P3D", "P1W" → kunlar soni (faqat butun kun/hafta) */
function parseDurationDays(value: string): number | null {
  const m = value.trim().match(/^P(?:(\d+)W)?(?:(\d+)D)?/);
  if (!m || (!m[1] && !m[2])) return null;
  return Number(m[1] || 0) * 7 + Number(m[2] || 0);
}

/** "DTSTART;VALUE=DATE:20261010" → { name: "DTSTART", value: "20261010" } */
function splitProperty(line: string): { name: string; value: string } | null {
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ":" && !inQuotes) {
      const name = line.slice(0, i).split(";")[0].toUpperCase();
      return { name, value: line.slice(i + 1) };
    }
  }
  return null;
}

export function parseIcs(text: string): IcsEvent[] {
  // Uzun qatorlar keyingi qatorga bo'sh joy/tab bilan davom ettiriladi ("folding")
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);

  const events: IcsEvent[] = [];
  let cur: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      cur = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (cur) {
        const ev = toEvent(cur);
        if (ev) events.push(ev);
      }
      cur = null;
      continue;
    }
    if (!cur) continue;
    const prop = splitProperty(line);
    if (prop && !(prop.name in cur)) cur[prop.name] = prop.value;
  }
  return events;
}

function toEvent(p: Record<string, string>): IcsEvent | null {
  if ((p.STATUS || "").toUpperCase() === "CANCELLED") return null;
  const start = p.DTSTART ? parseIcsDate(p.DTSTART) : null;
  if (!start) return null;

  let end = p.DTEND ? parseIcsDate(p.DTEND) : null;
  if (!end && p.DURATION) {
    const days = parseDurationDays(p.DURATION);
    if (days) end = addDays(start, days);
  }
  // RFC 5545: DTEND yo'q kunlik hodisa — bir kun
  if (!end) end = addDays(start, 1);
  // Kun ichidagi hodisa (masalan 10:00–12:00) ham shu kunni band qiladi
  if (end <= start) end = addDays(start, 1);

  const summary = unescapeText(p.SUMMARY || "").trim();
  const description = unescapeText(p.DESCRIPTION || "").trim();
  // UID bo'lmasa sanalardan barqaror kalit yasaymiz
  const uid = (p.UID || "").trim() || `${start}_${end}`;

  return { uid, start, end, summary, description };
}

// ---------------------------------------------------------------- export

function escapeText(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545: qator 75 baytdan oshmasin, davomi bo'sh joy bilan boshlanadi */
function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let chunk = "";
  let bytes = 0;
  for (const ch of line) {
    const len = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // davom qatorida 1 bayt bo'sh joyga ketadi
    if (bytes + len > limit) {
      parts.push(chunk);
      chunk = "";
      bytes = 0;
    }
    chunk += ch;
    bytes += len;
  }
  parts.push(chunk);
  return parts.join("\r\n ");
}

function icsDate(date: string): string {
  return date.replace(/-/g, "");
}

function icsTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export interface ExportEvent {
  uid: string;
  start: string;
  end: string;
  summary: string;
}

export function buildIcs(calendarName: string, events: ExportEvent[], now = new Date()): string {
  const stamp = icsTimestamp(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ASIA WAY//Calendar Sync//UZ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeText(e.uid)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(e.start)}`,
      `DTEND;VALUE=DATE:${icsDate(e.end)}`,
      `SUMMARY:${escapeText(e.summary)}`,
      "TRANSP:OPAQUE",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
