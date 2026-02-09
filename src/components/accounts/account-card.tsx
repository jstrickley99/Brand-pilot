import { Button } from "@/components/ui/button";
import { InstagramAccount, PlatformConnection } from "@/lib/types";
import { formatNumber, getStatusBgColor, getNicheEmoji } from "@/lib/utils";
import { Settings, Pause, Play, Unplug, Instagram, TrendingUp, TrendingDown, Info, ArrowRight, Loader2 } from "lucide-react";
import { PlatformIcon, getPlatformLabel } from "./platform-icons";

interface AccountCardProps {
  account: InstagramAccount;
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="rounded-xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-xl">
            {getNicheEmoji(account.niche)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-400" />
              <p className="font-semibold text-[#F8FAFC]">{account.handle}</p>
            </div>
            <p className="text-sm text-[#94A3B8]">{account.displayName}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBgColor(account.status)}`}>
          {account.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg bg-white/5">
        <div className="text-center">
          <p className="text-xl font-bold text-[#F8FAFC]">{formatNumber(account.followers)}</p>
          <p className="text-xs text-[#94A3B8]">Followers</p>
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
          <p className="text-xs text-[#94A3B8]">Growth</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#F8FAFC]">{account.engagementRate}%</p>
          <p className="text-xs text-[#94A3B8]">Engagement</p>
        </div>
      </div>

      {/* Niche & Autonomy */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-[#F8FAFC]">
          {getNicheEmoji(account.niche)} {account.niche}
        </span>
        <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-[#F8FAFC]">
          {account.autonomyLevel === "full_auto" ? "Full Auto" : account.autonomyLevel === "semi_auto" ? "Semi-Auto" : "Approval"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1 border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5">
          <Settings className="h-3.5 w-3.5 mr-1.5" />
          Configure
        </Button>
        <Button variant="outline" size="sm" className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5">
          {account.status === "paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="outline" size="sm" className="border-[#1E293B] bg-transparent text-red-400 hover:text-red-300 hover:bg-white/5">
          <Unplug className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface PlatformCardProps {
  connection: PlatformConnection;
  onConnect?: () => void;
  onDisconnect?: () => void;
  isConnecting?: boolean;
  igUsername?: string;
}

export function PlatformCard({ connection, onConnect, onDisconnect, isConnecting, igUsername }: PlatformCardProps) {
  const label = getPlatformLabel(connection.platform);
  const isConnected = connection.connected;

  return (
    <div className={`rounded-xl bg-[#111827] border p-6 transition-all ${
      isConnected ? "border-emerald-400/20" : "border-[#1E293B] hover:border-[#3B82F6]/30"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={connection.platform} />
          <div>
            <p className="font-semibold text-[#F8FAFC]">{label}</p>
            {isConnected ? (
              <p className="text-xs text-emerald-400">
                {igUsername ? `@${igUsername}` : "Connected"}
              </p>
            ) : (
              <p className="text-xs text-[#64748B]">Not connected</p>
            )}
          </div>
        </div>
        {connection.requiresPro && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
            Pro
          </span>
        )}
        {isConnected && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
            Connected
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[#94A3B8] mb-4">{connection.description}</p>

      {/* Info notice */}
      {connection.infoNotice && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 mb-4">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">{connection.infoNotice}</p>
        </div>
      )}

      {/* Action button */}
      {isConnected && onDisconnect ? (
        <Button
          onClick={onDisconnect}
          variant="outline"
          className="w-full border-red-400/20 text-red-400 hover:bg-red-400/10"
        >
          <Unplug className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      ) : connection.requiresPro ? (
        <Button className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white">
          Upgrade to Pro
        </Button>
      ) : onConnect ? (
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect {label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      ) : (
        <Button className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
          Connect {label}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
