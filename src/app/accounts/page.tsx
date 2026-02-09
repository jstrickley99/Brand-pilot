"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformCard } from "@/components/accounts/account-card";
import { ConnectCard } from "@/components/accounts/connect-card";
import { ConnectionLimitWidget } from "@/components/accounts/connection-limit";
import { mockPlatformConnections } from "@/lib/mock-data";
import { useNangoConnect } from "@/hooks/use-nango-connect";

export default function AccountsPage() {
  const nango = useNangoConnect();

  // Merge real Instagram state into mock connections
  const connections = mockPlatformConnections.map((conn) => {
    if (conn.id === "ig" && nango.connection?.connected) {
      return { ...conn, connected: true };
    }
    return conn;
  });

  return (
    <div>
      <PageHeader title="Accounts" description="Connect and manage your social media accounts">
        <ConnectionLimitWidget connectedCount={nango.connection?.connected ? 1 : 0} />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <PlatformCard
            key={connection.id}
            connection={connection}
            {...(connection.id === "ig"
              ? {
                  onConnect: nango.connect,
                  onDisconnect: nango.disconnect,
                  isConnecting: nango.isConnecting,
                  igUsername: nango.connection?.username,
                }
              : {})}
          />
        ))}
        <ConnectCard />
      </div>
    </div>
  );
}
