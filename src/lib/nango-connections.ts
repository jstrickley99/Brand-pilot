import { NangoConnectionMeta } from "./types";

const STORAGE_KEY = "brandpilot_nango_connections";

export function getNangoConnections(): NangoConnectionMeta[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getNangoConnection(providerConfigKey: string): NangoConnectionMeta | null {
  return getNangoConnections().find((c) => c.providerConfigKey === providerConfigKey) || null;
}

export function saveNangoConnection(meta: NangoConnectionMeta): void {
  const connections = getNangoConnections().filter(
    (c) => c.providerConfigKey !== meta.providerConfigKey
  );
  connections.push(meta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

export function removeNangoConnection(providerConfigKey: string): void {
  const connections = getNangoConnections().filter(
    (c) => c.providerConfigKey !== providerConfigKey
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

export function isInstagramConnected(): boolean {
  const conn = getNangoConnection("instagram");
  return conn?.connected === true;
}

export function isTikTokConnected(): boolean {
  const conn = getNangoConnection("tiktok");
  return conn?.connected === true;
}

export function isPlatformConnected(platform: string): boolean {
  const conn = getNangoConnection(platform);
  return conn?.connected === true;
}
