"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HashtagGeneratorConfig as ConfigType } from "@/lib/types";

interface HashtagConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  strategy: "mixed",
  bannedHashtags: [],
  hashtagCountMin: 5,
  hashtagCountMax: 15,
};

const STRATEGY_OPTIONS: { value: ConfigType["strategy"]; label: string }[] = [
  { value: "max_reach", label: "Max Reach" },
  { value: "niche_specific", label: "Niche Specific" },
  { value: "mixed", label: "Mixed" },
];

export function HashtagConfig({ config, onChange }: HashtagConfigProps) {
  const current = config ?? DEFAULT_CONFIG;
  const [bannedInput, setBannedInput] = useState("");

  function update(partial: Partial<ConfigType>) {
    onChange({ ...current, ...partial });
  }

  function addBannedHashtag() {
    let value = bannedInput.trim();
    if (!value) return;
    if (!value.startsWith("#")) value = "#" + value;
    if (current.bannedHashtags.includes(value)) return;
    update({ bannedHashtags: [...current.bannedHashtags, value] });
    setBannedInput("");
  }

  function removeBannedHashtag(tag: string) {
    update({
      bannedHashtags: current.bannedHashtags.filter((t) => t !== tag),
    });
  }

  return (
    <div className="space-y-5">
      {/* Strategy */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Strategy
        </label>
        <div className="flex gap-2">
          {STRATEGY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => update({ strategy: option.value })}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                current.strategy === option.value
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                  : "bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/30"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Banned Hashtags */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Banned Hashtags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {current.bannedHashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20"
            >
              {tag}
              <button
                onClick={() => removeBannedHashtag(tag)}
                className="hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={bannedInput}
            onChange={(e) => setBannedInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addBannedHashtag())
            }
            placeholder="#hashtag"
            className={cn(
              "flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
              "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            )}
          />
          <button
            onClick={addBannedHashtag}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[#3B82F6]/10 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Count Range */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Hashtag Count Range
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[10px] text-[#64748B] mb-1">Min</label>
            <input
              type="number"
              min={1}
              max={current.hashtagCountMax}
              value={current.hashtagCountMin}
              onChange={(e) =>
                update({ hashtagCountMin: Math.max(1, parseInt(e.target.value) || 1) })
              }
              className={cn(
                "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
                "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              )}
            />
          </div>
          <span className="text-[#64748B] text-sm mt-4">to</span>
          <div className="flex-1">
            <label className="block text-[10px] text-[#64748B] mb-1">Max</label>
            <input
              type="number"
              min={current.hashtagCountMin}
              max={30}
              value={current.hashtagCountMax}
              onChange={(e) =>
                update({
                  hashtagCountMax: Math.max(
                    current.hashtagCountMin,
                    parseInt(e.target.value) || current.hashtagCountMin
                  ),
                })
              }
              className={cn(
                "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
                "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
