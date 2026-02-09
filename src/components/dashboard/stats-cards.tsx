import { Users, TrendingUp, Zap, CreditCard, FileText, UserPlus } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const statItems = [
  { key: "totalAccounts" as const, label: "Total Accounts", icon: Users, format: (v: number) => v.toString(), accent: "border-l-[#3B82F6]" },
  { key: "totalFollowers" as const, label: "Total Followers", icon: UserPlus, format: formatNumber, accent: "border-l-[#10B981]" },
  { key: "avgEngagementRate" as const, label: "Avg Engagement", icon: TrendingUp, format: (v: number) => v + "%", accent: "border-l-[#8B5CF6]" },
  { key: "creditsRemaining" as const, label: "Credits Left", icon: CreditCard, format: (v: number) => v.toLocaleString(), accent: "border-l-[#F97316]" },
  { key: "postsThisWeek" as const, label: "Posts This Week", icon: FileText, format: (v: number) => v.toString(), accent: "border-l-[#EC4899]" },
  { key: "followersGainedThisWeek" as const, label: "New Followers", icon: Zap, format: (v: number) => "+" + formatNumber(v), accent: "border-l-[#14B8A6]" },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <div key={item.key} className={`p-4 rounded-xl bg-[#111827] border border-[#1E293B] border-l-2 ${item.accent}`}>
          <div className="flex items-center gap-2 mb-2">
            <item.icon className="h-4 w-4 text-[#94A3B8]" />
            <span className="text-xs text-[#94A3B8]">{item.label}</span>
          </div>
          <p className="text-2xl font-bold text-[#F8FAFC]">{item.format(stats[item.key])}</p>
        </div>
      ))}
    </div>
  );
}
