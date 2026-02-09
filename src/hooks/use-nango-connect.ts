"use client";

import { useState, useEffect, useCallback } from "react";
import Nango from "@nangohq/frontend";
import type { Platform, NangoConnectionMeta } from "@/lib/types";
import {
  getNangoConnection,
  saveNangoConnection,
  removeNangoConnection,
} from "@/lib/nango-connections";
import type { ConnectUIEvent } from "@nangohq/frontend";

// Maps platform to the metadata key Nango uses for the username
const PLATFORM_USERNAME_KEY: Record<string, string> = {
  instagram: "instagram_username",
  tiktok: "tiktok_username",
  youtube: "youtube_channel_name",
};

const PLATFORM_PROFILE_PIC_KEY: Record<string, string> = {
  instagram: "instagram_profile_pic",
  tiktok: "tiktok_profile_pic",
  youtube: "youtube_profile_pic",
};

interface UseNangoConnectReturn {
  connection: NangoConnectionMeta | null;
  isConnecting: boolean;
  isVerifying: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useNangoConnect(platform: Platform): UseNangoConnectReturn {
  const [connection, setConnection] = useState<NangoConnectionMeta | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: load cached connection, then verify in background
  useEffect(() => {
    const cached = getNangoConnection(platform);
    if (cached) {
      setConnection(cached);
    }

    async function verify() {
      setIsVerifying(true);
      try {
        const res = await fetch(`/api/nango/connections?provider=${platform}`);
        const data = await res.json();

        if (data.success && data.connected) {
          const usernameKey = PLATFORM_USERNAME_KEY[platform] ?? `${platform}_username`;
          const picKey = PLATFORM_PROFILE_PIC_KEY[platform] ?? `${platform}_profile_pic`;
          const meta: NangoConnectionMeta = {
            connectionId: data.connectionId,
            providerConfigKey: platform,
            connected: true,
            username: data.metadata?.[usernameKey],
            profilePicUrl: data.metadata?.[picKey],
            connectedAt: cached?.connectedAt || new Date().toISOString(),
          };
          saveNangoConnection(meta);
          setConnection(meta);
        } else if (cached?.connected) {
          // Was cached as connected but Nango says it's not — invalidate
          removeNangoConnection(platform);
          setConnection(null);
        }
      } catch {
        // Network error during verification — keep cached state
      } finally {
        setIsVerifying(false);
      }
    }

    verify();
  }, [platform]);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      // Step 1: Get session token from our backend
      const sessionRes = await fetch("/api/nango/session", { method: "POST" });
      const sessionData = await sessionRes.json();

      if (!sessionData.success) {
        throw new Error(sessionData.error || "Failed to create session");
      }

      // Step 2: Open Nango Connect UI
      const nango = new Nango();
      const connectUI = nango.openConnectUI({
        sessionToken: sessionData.sessionToken,
        onEvent: (event: ConnectUIEvent) => {
          if (event.type === "close") {
            setIsConnecting(false);
          }
        },
      });
      connectUI.open();

      // Step 3: Wait for connection by polling
      const maxAttempts = 30;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const verifyRes = await fetch(`/api/nango/connections?provider=${platform}`);
        const verifyData = await verifyRes.json();

        if (verifyData.success && verifyData.connected) {
          const usernameKey = PLATFORM_USERNAME_KEY[platform] ?? `${platform}_username`;
          const picKey = PLATFORM_PROFILE_PIC_KEY[platform] ?? `${platform}_profile_pic`;
          const meta: NangoConnectionMeta = {
            connectionId: verifyData.connectionId,
            providerConfigKey: platform,
            connected: true,
            username: verifyData.metadata?.[usernameKey],
            profilePicUrl: verifyData.metadata?.[picKey],
            connectedAt: new Date().toISOString(),
          };
          saveNangoConnection(meta);
          setConnection(meta);
          connectUI.close();
          break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      if (!message.includes("closed") && !message.includes("cancelled")) {
        setError(message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [platform]);

  const disconnect = useCallback(() => {
    removeNangoConnection(platform);
    setConnection(null);
  }, [platform]);

  return { connection, isConnecting, isVerifying, error, connect, disconnect };
}
