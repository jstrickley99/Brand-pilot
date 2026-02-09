"use client";

import { cn } from "@/lib/utils";
import type { ContentWriterConfig as ConfigType } from "@/lib/types";

interface ContentWriterConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  personaName: "",
  personalityDescription: "",
  writingTone: "professional",
  languagePreferences: "English",
  emojiUsage: "minimal",
  examplePosts: [],
};

const TONE_OPTIONS = [
  "casual",
  "professional",
  "witty",
  "educational",
  "motivational",
  "humorous",
];

const EMOJI_OPTIONS: { value: ConfigType["emojiUsage"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "minimal", label: "Minimal" },
  { value: "moderate", label: "Moderate" },
  { value: "heavy", label: "Heavy" },
];

export function ContentWriterConfig({
  config,
  onChange,
}: ContentWriterConfigProps) {
  const current = config ?? DEFAULT_CONFIG;

  function update(partial: Partial<ConfigType>) {
    onChange({ ...current, ...partial });
  }

  return (
    <div className="space-y-5">
      {/* Persona Name */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Persona Name
        </label>
        <input
          type="text"
          value={current.personaName}
          onChange={(e) => update({ personaName: e.target.value })}
          placeholder="e.g. Coach Mike"
          className={cn(
            "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
            "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          )}
        />
      </div>

      {/* Personality */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Personality
        </label>
        <textarea
          rows={3}
          value={current.personalityDescription}
          onChange={(e) => update({ personalityDescription: e.target.value })}
          placeholder="Describe the writing personality..."
          className={cn(
            "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
            "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] resize-none"
          )}
        />
      </div>

      {/* Writing Tone */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Writing Tone
        </label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone}
              onClick={() => update({ writingTone: tone })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                current.writingTone === tone
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                  : "bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/30"
              )}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Language
        </label>
        <input
          type="text"
          value={current.languagePreferences}
          onChange={(e) => update({ languagePreferences: e.target.value })}
          placeholder="e.g. English"
          className={cn(
            "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
            "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          )}
        />
      </div>

      {/* Emoji Usage */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Emoji Usage
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => update({ emojiUsage: option.value })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                current.emojiUsage === option.value
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                  : "bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/30"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Example Posts */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Example Posts
          <span className="text-[#64748B] ml-1">(one per line)</span>
        </label>
        <textarea
          rows={4}
          value={current.examplePosts.join("\n")}
          onChange={(e) => {
            const lines = e.target.value.split("\n");
            update({ examplePosts: lines });
          }}
          placeholder={"Write example posts here...\nOne per line"}
          className={cn(
            "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
            "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] resize-none"
          )}
        />
      </div>
    </div>
  );
}
