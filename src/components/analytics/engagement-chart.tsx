"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EngagementChartProps {
  data: { date: string; rate: number }[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="rounded-xl bg-[#111827] border border-[#1E293B] p-6">
      <h3 className="font-semibold mb-4 text-[#F8FAFC]">Engagement Rate</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickFormatter={(v) => v + "%"}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1E293B",
                borderRadius: "8px",
                color: "#F8FAFC",
              }}
              formatter={(value) => [value + "%", "Engagement"]}
            />
            <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
