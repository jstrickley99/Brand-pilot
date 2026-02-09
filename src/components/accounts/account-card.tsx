import { Button } from "@/components/ui/button";
import { InstagramAccount } from "@/lib/types";
import { formatNumber, getStatusBgColor, getNicheEmoji } from "@/lib/utils";
import { Settings, Pause, Play, Unplug, Instagram, TrendingUp, TrendingDown } from "lucide-react";

interface AccountCardProps {
  account: InstagramAccount;
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="rounded-xl bg-[#16213E] border border-[#1E3A5F] hover:border-[#3B82F6]/30 transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-xl">
            {getNicheEmoji(account.niche)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-400" />
              <p className="font-semibold text-white">{account.handle}</p>
            </div>
            <p className="text-sm text-gray-400">{account.displayName}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBgColor(account.status)}`}>
          {account.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg bg-white/5">
        <div className="text-center">
          <p className="text-xl font-bold text-white">{formatNumber(account.followers)}</p>
          <p className="text-xs text-gray-400">Followers</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            {account.followersGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-400" />
            )}
            <p className={`text-xl font-bold ${account.followersGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {account.followersGrowth > 0 ? "+" : ""}{account.followersGrowth}%
            </p>
          </div>
          <p className="text-xs text-gray-400">Growth</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white">{account.engagementRate}%</p>
          <p className="text-xs text-gray-400">Engagement</p>
        </div>
      </div>

      {/* Niche & Autonomy */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-white">
          {getNicheEmoji(account.niche)} {account.niche}
        </span>
        <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-white">
          {account.autonomyLevel === "full_auto" ? "Full Auto" : account.autonomyLevel === "semi_auto" ? "Semi-Auto" : "Approval"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1 border-[#1E3A5F] bg-transparent text-white hover:bg-white/5">
          <Settings className="h-3.5 w-3.5 mr-1.5" />
          Configure
        </Button>
        <Button variant="outline" size="sm" className="border-[#1E3A5F] bg-transparent text-white hover:bg-white/5">
          {account.status === "paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="outline" size="sm" className="border-[#1E3A5F] bg-transparent text-red-400 hover:text-red-300 hover:bg-white/5">
          <Unplug className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
