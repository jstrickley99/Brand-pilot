"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlatformIcon, getPlatformLabel } from "@/components/accounts/platform-icons";
import { mockPlatformConnections } from "@/lib/mock-data";
import { Check, Lock, Loader2, X, AlertCircle } from "lucide-react";
import { useNangoConnect } from "@/hooks/use-nango-connect";

interface ConnectStepProps {
  connectedPlatforms: string[];
  onToggle: (platformId: string) => void;
}

export function ConnectStep({ connectedPlatforms, onToggle }: ConnectStepProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null);
  const instagram = useNangoConnect("instagram");
  const tiktok = useNangoConnect("tiktok");
  const youtube = useNangoConnect("youtube");

  const nangoHooks: Record<string, typeof instagram> = {
    ig: instagram,
    tt: tiktok,
    yt: youtube,
  };

  // Sync Nango connection states with wizard's connectedPlatforms
  useEffect(() => {
    for (const [id, hook] of Object.entries(nangoHooks)) {
      const inWizard = connectedPlatforms.includes(id);
      const inNango = hook.connection?.connected === true;

      if (inNango && !inWizard) {
        onToggle(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instagram.connection?.connected, tiktok.connection?.connected, youtube.connection?.connected, connectedPlatforms, onToggle]);

  async function handleConnect(platformId: string) {
    const hook = nangoHooks[platformId];
    if (hook) {
      // Real OAuth via Nango
      await hook.connect();
      return;
    }

    // Mock flow for other platforms
    setConnecting(platformId);
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
    onToggle(platformId);
    setConnecting(null);
  }

  function handleDisconnectClick(platformId: string) {
    setConfirmDisconnect(platformId);
  }

  function handleConfirmDisconnect(platformId: string) {
    const hook = nangoHooks[platformId];
    if (hook) {
      hook.disconnect();
    }
    onToggle(platformId);
    setConfirmDisconnect(null);
  }

  return (
    <div className="py-4">
      <h2 className="text-lg font-semibold text-[#F8FAFC] mb-1">Connect Your Platforms</h2>
      <p className="text-sm text-[#94A3B8] mb-6">
        Connect your social media accounts to get started
      </p>
      <div className="space-y-3">
        {mockPlatformConnections.map((conn) => {
          const hook = nangoHooks[conn.id];
          const hasNango = !!hook;
          const isConnected = hasNango
            ? hook.connection?.connected === true
            : connectedPlatforms.includes(conn.id);
          const isConnecting = hasNango ? hook.isConnecting : connecting === conn.id;
          const isConfirming = confirmDisconnect === conn.id;

          return (
            <div key={conn.id}>
              <div
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isConnected
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-[#1E293B] bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={conn.platform} />
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">
                      {getPlatformLabel(conn.platform)}
                    </p>
                    <p className="text-xs text-[#94A3B8]">{conn.description}</p>
                    {hasNango && isConnected && hook.connection?.username && (
                      <p className="text-xs text-emerald-400 mt-1">
                        @{hook.connection.username}
                      </p>
                    )}
                    {conn.infoNotice && !conn.requiresPro && (
                      <p className="text-xs text-[#94A3B8]/70 mt-1">{conn.infoNotice}</p>
                    )}
                    {conn.requiresPro && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-yellow-400">
                        <Lock className="h-3 w-3" /> Pro plan required
                      </span>
                    )}
                  </div>
                </div>

                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8]">Disconnect?</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfirmDisconnect(conn.id)}
                      className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-8 px-2"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Yes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDisconnect(null)}
                      className="text-[#94A3B8] hover:text-[#F8FAFC] h-8 px-2"
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      isConnected ? handleDisconnectClick(conn.id) : handleConnect(conn.id)
                    }
                    disabled={conn.requiresPro || isConnecting}
                    className={
                      isConnected
                        ? "border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                        : "bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                    }
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Connecting...
                      </>
                    ) : isConnected ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Connected
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </div>

              {/* Show Nango error */}
              {hasNango && hook.error && (
                <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-red-400/10 border border-red-400/20">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{hook.error}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
