"use client";

import { useState, useEffect, useCallback } from "react";
import Nango from "@nangohq/frontend";
import { NangoConnectionMeta } from "@/lib/types";
import {
  getNangoConnection,
  saveNangoConnection,
  removeNangoConnection,
} from "@/lib/nango-connections";
import type { ConnectUIEvent } from "@nangohq/frontend";

interface UseNangoConnectReturn {
  connection: NangoConnectionMeta | null;
  isConnecting: boolean;
  isVerifying: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useNangoConnect(): UseNangoConnectReturn {
  const [connection, setConnection] = useState<NangoConnectionMeta | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: load cached connection, then verify in background
  useEffect(() => {
    const cached = getNangoConnection("instagram");
    if (cached) {
      setConnection(cached);
    }

    async function verify() {
      setIsVerifying(true);
      try {
        const res = await fetch("/api/nango/connections?provider=instagram");
        const data = await res.json();

        if (data.success && data.connected) {
          const meta: NangoConnectionMeta = {
            connectionId: data.connectionId,
            providerConfigKey: "instagram",
            connected: true,
            username: data.metadata?.instagram_username,
            profilePicUrl: data.metadata?.instagram_profile_pic,
            connectedAt: cached?.connectedAt || new Date().toISOString(),
          };
          saveNangoConnection(meta);
          setConnection(meta);
        } else if (cached?.connected) {
          // Was cached as connected but Nango says it's not — invalidate
          removeNangoConnection("instagram");
          setConnection(null);
        }
      } catch {
        // Network error during verification — keep cached state
      } finally {
        setIsVerifying(false);
      }
    }

    verify();
  }, []);

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

      // Step 3: Wait for connection by polling (the onEvent callback handles close)
      // We'll use waitForConnection pattern — poll our backend
      const maxAttempts = 30;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const verifyRes = await fetch("/api/nango/connections?provider=instagram");
        const verifyData = await verifyRes.json();

        if (verifyData.success && verifyData.connected) {
          const meta: NangoConnectionMeta = {
            connectionId: verifyData.connectionId,
            providerConfigKey: "instagram",
            connected: true,
            username: verifyData.metadata?.instagram_username,
            profilePicUrl: verifyData.metadata?.instagram_profile_pic,
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
  }, []);

  const disconnect = useCallback(() => {
    removeNangoConnection("instagram");
    setConnection(null);
  }, []);

  return { connection, isConnecting, isVerifying, error, connect, disconnect };
}
