"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaCreatorConfig as ConfigType } from "@/lib/types";

interface MediaCreatorConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  visualStyle: "clean",
  brandColors: [],
  contentFormats: [],
};

const STYLE_OPTIONS = [
  "aesthetic",
  "minimalist",
  "bold",
  "vibrant",
  "dark",
  "clean",
];

const FORMAT_OPTIONS: {
  value: "reels" | "carousels" | "stories";
  label: string;
}[] = [
  { value: "reels", label: "Reels" },
  { value: "carousels", label: "Carousels" },
  { value: "stories", label: "Stories" },
];

export function MediaCreatorConfig({
  config,
  onChange,
}: MediaCreatorConfigProps) {
  const current = config ?? DEFAULT_CONFIG;
  const [colorInput, setColorInput] = useState("#3B82F6");

  function update(partial: Partial<ConfigType>) {
    onChange({ ...current, ...partial });
  }

  function addColor() {
    if (current.brandColors.includes(colorInput)) return;
    update({ brandColors: [...current.brandColors, colorInput] });
  }

  function removeColor(color: string) {
    update({
      brandColors: current.brandColors.filter((c) => c !== color),
    });
  }

  function toggleFormat(format: "reels" | "carousels" | "stories") {
    const has = current.contentFormats.includes(format);
    update({
      contentFormats: has
        ? current.contentFormats.filter((f) => f !== format)
        : [...current.contentFormats, format],
    });
  }

  return (
    <div className="space-y-5">
      {/* Visual Style */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Visual Style
        </label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style}
              onClick={() => update({ visualStyle: style })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                current.visualStyle === style
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                  : "bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/30"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Colors */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Brand Colors
        </label>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {current.brandColors.map((color) => (
            <div key={color} className="relative group">
              <div
                className="w-8 h-8 rounded-full border-2 border-[#1E293B] cursor-pointer"
                style={{ backgroundColor: color }}
                title={color}
              />
              <button
                onClick={() => removeColor(color)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#111827] border border-[#1E293B] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5 text-red-400" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-[#1E293B] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
            />
            <button
              onClick={addColor}
              className="w-8 h-8 rounded-full border-2 border-dashed border-[#1E293B] flex items-center justify-center text-[#64748B] hover:border-[#3B82F6]/50 hover:text-[#3B82F6] transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Formats */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Content Formats
        </label>
        <div className="space-y-2">
          {FORMAT_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  current.contentFormats.includes(value)
                    ? "bg-[#3B82F6] border-[#3B82F6]"
                    : "border-[#1E293B] bg-[#0B0F19] group-hover:border-[#3B82F6]/50"
                )}
                onClick={() => toggleFormat(value)}
              >
                {current.contentFormats.includes(value) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[#F8FAFC]">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
