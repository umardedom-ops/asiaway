"use client";

import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  color: string;
}

export default function Sparkline({ data, color }: SparklineProps) {
  // data.length bo'lmasa yoki barcha qiymatlar 0 bo'lsa, tekis chiziq ko'rsatamiz
  const chartData = data.length > 0 ? data.map((val, i) => ({ x: i, y: val })) : [{ x: 0, y: 0 }, { x: 1, y: 0 }];

  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
