"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

/**
 * Dashboard diagramma komponentlari (recharts) — champagne dark tema.
 * Qoidalar: bitta o'q, ingichka marklar, recessive grid, tooltip default yoqilgan.
 */

const INK = "#F5F2EB";
const MUTED = "#A8A49B";
const GRID = "rgba(197,164,109,0.10)";
const GOLD = "#C5A46D";
const GREEN = "#34d399";
const RED = "#f87171";

const tooltipStyle = {
  backgroundColor: "#0B0D0F",
  border: "1px solid rgba(197,164,109,0.3)",
  borderRadius: 8,
  color: INK,
  fontSize: 12,
};

const fmtUsd = (v: number) => `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Oylik daromad vs xarajat (guruhlangan ustunlar, 6 oy) */
export function IncomeExpenseChart({
  data, incomeLabel, expenseLabel,
}: {
  data: { month: string; income: number; expense: number }[];
  incomeLabel: string;
  expenseLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={2}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtUsd} width={70} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtUsd(Number(v ?? 0))} cursor={{ fill: "rgba(197,164,109,0.06)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: MUTED }} />
        <Bar dataKey="income" name={incomeLabel} fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" name={expenseLabel} fill={RED} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Xarajatlar taqsimoti — kategoriya bo'yicha gorizontal ustunlar ("qancha qayerga") */
export function ExpenseBreakdownChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42 + 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, bottom: 0, left: 8 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtUsd} />
        <YAxis type="category" dataKey="name" tick={{ fill: INK, fontSize: 12 }} axisLine={false} tickLine={false} width={150} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtUsd(Number(v ?? 0))} cursor={{ fill: "rgba(197,164,109,0.06)" }} />
        <Bar dataKey="value" fill={GOLD} radius={[0, 4, 4, 0]} maxBarSize={20}
          label={{ position: "right", fill: MUTED, fontSize: 11, formatter: (v: unknown) => fmtUsd(Number(v ?? 0)) }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Marketing: manba (source/kanal) bo'yicha bronlar summasi — targetolog uchun */
export function SourceRevenueChart({ data, countLabel }: { data: { name: string; value: number; count: number }[]; countLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42 + 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 90, bottom: 0, left: 8 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtUsd} />
        <YAxis type="category" dataKey="name" tick={{ fill: INK, fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, _n, item) => [`${fmtUsd(Number(v ?? 0))} · ${(item as { payload?: { count?: number } })?.payload?.count ?? 0} ${countLabel}`, ""]}
          cursor={{ fill: "rgba(197,164,109,0.06)" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}
          label={{ position: "right", fill: MUTED, fontSize: 11, formatter: (v: unknown) => fmtUsd(Number(v ?? 0)) }}>
          {data.map((_, i) => (
            <Cell key={i} fill={GOLD} fillOpacity={1 - i * 0.09} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Marketing: oylik leadlar va bronga aylanganlar (konversiya dinamikasi) */
export function LeadsFunnelChart({
  data, leadsLabel, wonLabel,
}: {
  data: { month: string; leads: number; won: number }[];
  leadsLabel: string;
  wonLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={2}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(197,164,109,0.06)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: MUTED }} />
        <Bar dataKey="leads" name={leadsLabel} fill={MUTED} fillOpacity={0.55} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="won" name={wonLabel} fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
