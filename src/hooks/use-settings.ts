"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Niche } from "@/lib/types";

const STORAGE_KEY = "brandpilot-settings";

export interface SettingsData {
  niche: Niche;
  formality: number[];
  humor: number[];
  inspiration: number[];
  educational: number[];
  inspirational: number[];
  entertaining: number[];
  promotional: number[];
  postsPerDay: string;
}

const DEFAULTS: SettingsData = {
  niche: "fitness",
  formality: [30],
  humor: [40],
  inspiration: [80],
  educational: [40],
  inspirational: [25],
  entertaining: [20],
  promotional: [15],
  postsPerDay: "3",
};

function loadSettings(): SettingsData {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SettingsData>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from API on mount
  const isFirstRender = useRef(true);
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setSettings((prev) => ({
            ...prev,
            niche: s.niche ?? prev.niche,
            formality: s.brandVoice?.toneFormality != null ? [s.brandVoice.toneFormality] : prev.formality,
            humor: s.brandVoice?.toneHumor != null ? [s.brandVoice.toneHumor] : prev.humor,
            inspiration: s.brandVoice?.toneInspiration != null ? [s.brandVoice.toneInspiration] : prev.inspiration,
            educational: s.contentMix?.educational != null ? [s.contentMix.educational] : prev.educational,
            inspirational: s.contentMix?.inspirational != null ? [s.contentMix.inspirational] : prev.inspirational,
            entertaining: s.contentMix?.entertaining != null ? [s.contentMix.entertaining] : prev.entertaining,
            promotional: s.contentMix?.promotional != null ? [s.contentMix.promotional] : prev.promotional,
            postsPerDay: s.postsPerDay?.toString() ?? prev.postsPerDay,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Persist to localStorage + API whenever settings change (skip initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage full or unavailable — silently ignore
    }

    // Sync to API (debounced via the timer)
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSaved(false);
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: settings.niche,
          brandVoice: {
            toneFormality: settings.formality[0],
            toneHumor: settings.humor[0],
            toneInspiration: settings.inspiration[0],
          },
          contentMix: {
            educational: settings.educational[0],
            inspirational: settings.inspirational[0],
            entertaining: settings.entertaining[0],
            promotional: settings.promotional[0],
          },
          postsPerDay: parseInt(settings.postsPerDay) || 3,
        }),
      }).catch(() => {});
    }, 1500);
  }, [settings]);

  const update = useCallback(<K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { settings, update, saved };
}
