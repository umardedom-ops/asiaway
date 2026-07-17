"use client";

import React, { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  color: string;
  /** Screen-reader ta'rifi (masalan: "Oylik daromad trendi") */
  label?: string;
}

/**
 * Stat-karta ichidagi mini-trend (sparkline).
 * Qoidalar: 2px chiziq, o'qsiz/legendsiz/gridsiz, yumshoq gradient to'ldirish,
 * animatsiya yo'q (SSR keyin sakramasin). Joy olmaydi — karta ichida 40px.
 */
export default function Sparkline({ data, color, label }: SparklineProps) {
  const gid = useId();
  const chartData =
    data.length > 1
      ? data.map((val, i) => ({ x: i, y: val }))
      : [{ x: 0, y: 0 }, { x: 1, y: 0 }];

  return (
    <div className="h-10 w-24 shrink-0" role="img" aria-label={label || "trend"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${gid})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
