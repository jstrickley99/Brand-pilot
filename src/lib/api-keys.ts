import { AIProvider } from "./types";

const KEY_PREFIX = "brandpilot_apikey_";

export function getApiKey(provider: AIProvider): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${KEY_PREFIX}${provider}`);
}

export function setApiKey(provider: AIProvider, key: string): void {
  localStorage.setItem(`${KEY_PREFIX}${provider}`, key);
}

export function hasApiKey(provider: AIProvider): boolean {
  return !!getApiKey(provider);
}

export function clearApiKey(provider: AIProvider): void {
  localStorage.removeItem(`${KEY_PREFIX}${provider}`);
}
