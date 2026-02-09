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

function toApiPayload(settings: SettingsData) {
  return {
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
  };
}

function applyApiResponse(
  prev: SettingsData,
  s: Record<string, unknown>,
): SettingsData {
  const bv = s.brandVoice as Record<string, number> | undefined;
  const cm = s.contentMix as Record<string, number> | undefined;
  return {
    ...prev,
    niche: (s.niche as Niche) ?? prev.niche,
    formality: bv?.toneFormality != null ? [bv.toneFormality] : prev.formality,
    humor: bv?.toneHumor != null ? [bv.toneHumor] : prev.humor,
    inspiration: bv?.toneInspiration != null ? [bv.toneInspiration] : prev.inspiration,
    educational: cm?.educational != null ? [cm.educational] : prev.educational,
    inspirational: cm?.inspirational != null ? [cm.inspirational] : prev.inspirational,
    entertaining: cm?.entertaining != null ? [cm.entertaining] : prev.entertaining,
    promotional: cm?.promotional != null ? [cm.promotional] : prev.promotional,
    postsPerDay: s.postsPerDay != null ? String(s.postsPerDay) : prev.postsPerDay,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextPersist = useRef(false);

  // Fetch settings from Supabase on mount; overwrite localStorage cache
  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data: { success: boolean; settings?: Record<string, unknown> }) => {
        if (cancelled || !data.success || !data.settings) return;
        skipNextPersist.current = true;
        setSettings((prev) => {
          const merged = applyApiResponse(prev, data.settings!);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch { /* ignore */ }
          return merged;
        });
      })
      .catch(() => { /* API unavailable — keep localStorage / defaults */ });
    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage immediately + debounce PUT to API
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    // Write to localStorage right away (fast cache)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch { /* ignore */ }

    // Debounce API call at 500ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiPayload(settings)),
      })
        .then((res) => {
          if (!res.ok) throw new Error("put failed");
          // Flash "Saved" indicator for 2 seconds
          setSaved(true);
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
        })
        .catch(() => { /* API error — localStorage still has the data */ });
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [settings]);

  const update = useCallback(<K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { settings, update, saved };
}
