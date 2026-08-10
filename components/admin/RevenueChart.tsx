"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              borderRadius: "12px",
              color: "#FFF",
              border: "none",
              fontSize: "12px",
            }}
            formatter={(value: any) => [`Rs. ${value}`, "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#2E7D32" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
