"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformCard } from "@/components/accounts/account-card";
import { ConnectCard } from "@/components/accounts/connect-card";
import { ConnectionLimitWidget } from "@/components/accounts/connection-limit";
import { mockPlatformConnections } from "@/lib/mock-data";
import { useNangoConnect } from "@/hooks/use-nango-connect";

export default function AccountsPage() {
  const instagram = useNangoConnect("instagram");
  const tiktok = useNangoConnect("tiktok");
  const youtube = useNangoConnect("youtube");

  // Map platform connection id → Nango hook
  const nangoHooks: Record<string, typeof instagram> = {
    ig: instagram,
    tt: tiktok,
    yt: youtube,
  };

  // Merge real connection state into mock connections
  const connections = mockPlatformConnections.map((conn) => {
    const hook = nangoHooks[conn.id];
    if (hook?.connection?.connected) {
      return { ...conn, connected: true };
    }
    return conn;
  });

  const connectedCount = Object.values(nangoHooks).filter((h) => h.connection?.connected).length;

  return (
    <div>
      <PageHeader title="Accounts" description="Connect and manage your social media accounts">
        <ConnectionLimitWidget connectedCount={connectedCount} />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {connections.map((connection) => {
          const hook = nangoHooks[connection.id];
          return (
            <PlatformCard
              key={connection.id}
              connection={connection}
              {...(hook
                ? {
                    onConnect: hook.connect,
                    onDisconnect: hook.disconnect,
                    isConnecting: hook.isConnecting,
                    username: hook.connection?.username,
                  }
                : {})}
            />
          );
        })}
        <ConnectCard />
      </div>
    </div>
  );
}
