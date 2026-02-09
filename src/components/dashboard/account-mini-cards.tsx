import { InstagramAccount } from "@/lib/types";
import { formatNumber, getStatusBgColor, getNicheEmoji, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AccountMiniCardsProps {
  accounts: InstagramAccount[];
}

export function AccountMiniCards({ accounts }: AccountMiniCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="p-4 rounded-xl bg-[#16213E] border border-[#1E3A5F] hover:border-[#3B82F6]/30 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-lg">
                {getNicheEmoji(account.niche)}
              </div>
              <div>
                <p className="font-medium text-sm text-white">{account.handle}</p>
                <p className="text-xs text-gray-400">{account.displayName}</p>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBgColor(account.status)}`}
            >
              {account.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-white">{formatNumber(account.followers)}</p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                {account.followersGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <p
                  className={`text-lg font-bold ${account.followersGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {account.followersGrowth > 0 ? "+" : ""}
                  {account.followersGrowth}%
                </p>
              </div>
              <p className="text-xs text-gray-400">Growth</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{account.engagementRate}%</p>
              <p className="text-xs text-gray-400">Engagement</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Last post: {formatDate(account.lastPostAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
