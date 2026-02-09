"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FollowerChartProps {
  data: { date: string; followers: number }[];
}

export function FollowerChart({ data }: FollowerChartProps) {
  return (
    <div className="rounded-xl bg-[#111827] border border-[#1E293B] p-6">
      <h3 className="font-semibold mb-4 text-[#F8FAFC]">Follower Growth</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickFormatter={(v) => (v / 1000).toFixed(0) + "K"}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1E293B",
                borderRadius: "8px",
                color: "#F8FAFC",
              }}
              formatter={(value) => [Number(value).toLocaleString(), "Followers"]}
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="#3B82F6"
              fill="url(#followerGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
