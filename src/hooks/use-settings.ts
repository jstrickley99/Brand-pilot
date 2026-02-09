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

  // Persist to localStorage whenever settings change (skip initial mount)
  const isFirstRender = useRef(true);
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
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 1500);
  }, [settings]);

  const update = useCallback(<K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { settings, update, saved };
}
