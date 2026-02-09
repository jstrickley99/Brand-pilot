import { Users, TrendingUp, Zap, CreditCard, FileText, UserPlus } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const statItems = [
  { key: "totalAccounts" as const, label: "Total Accounts", icon: Users, format: (v: number) => v.toString() },
  { key: "totalFollowers" as const, label: "Total Followers", icon: UserPlus, format: formatNumber },
  { key: "avgEngagementRate" as const, label: "Avg Engagement", icon: TrendingUp, format: (v: number) => v + "%" },
  { key: "creditsRemaining" as const, label: "Credits Left", icon: CreditCard, format: (v: number) => v.toLocaleString() },
  { key: "postsThisWeek" as const, label: "Posts This Week", icon: FileText, format: (v: number) => v.toString() },
  { key: "followersGainedThisWeek" as const, label: "New Followers", icon: Zap, format: (v: number) => "+" + formatNumber(v) },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <div key={item.key} className="p-4 rounded-xl bg-[#16213E] border border-[#1E3A5F]">
          <div className="flex items-center gap-2 mb-2">
            <item.icon className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{item.format(stats[item.key])}</p>
        </div>
      ))}
    </div>
  );
}
