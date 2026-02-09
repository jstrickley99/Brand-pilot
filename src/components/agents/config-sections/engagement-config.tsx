"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EngagementBotConfig as ConfigType } from "@/lib/types";

interface EngagementConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  replyTone: "",
  autoReplyTriggers: [],
  triggerKeywords: [],
  dmAutoResponse: false,
  dmTemplates: [],
};

const TRIGGER_OPTIONS: {
  value: "keywords" | "all_comments" | "questions_only";
  label: string;
}[] = [
  { value: "keywords", label: "Keywords" },
  { value: "all_comments", label: "All Comments" },
  { value: "questions_only", label: "Questions Only" },
];

export function EngagementConfig({ config, onChange }: EngagementConfigProps) {
  const current = config ?? DEFAULT_CONFIG;
  const [keywordInput, setKeywordInput] = useState("");

  function update(partial: Partial<ConfigType>) {
    onChange({ ...current, ...partial });
  }

  function toggleTrigger(
    trigger: "keywords" | "all_comments" | "questions_only"
  ) {
    const has = current.autoReplyTriggers.includes(trigger);
    update({
      autoReplyTriggers: has
        ? current.autoReplyTriggers.filter((t) => t !== trigger)
        : [...current.autoReplyTriggers, trigger],
    });
  }

  function addKeyword() {
    const value = keywordInput.trim();
    if (!value || current.triggerKeywords.includes(value)) return;
    update({ triggerKeywords: [...current.triggerKeywords, value] });
    setKeywordInput("");
  }

  function removeKeyword(keyword: string) {
    update({
      triggerKeywords: current.triggerKeywords.filter((k) => k !== keyword),
    });
  }

  const showKeywords = current.autoReplyTriggers.includes("keywords");

  return (
    <div className="space-y-5">
      {/* Reply Tone */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Reply Tone
        </label>
        <input
          type="text"
          value={current.replyTone}
          onChange={(e) => update({ replyTone: e.target.value })}
          placeholder="e.g. friendly, professional, casual"
          className={cn(
            "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
            "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          )}
        />
      </div>

      {/* Auto-Reply Triggers */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Auto-Reply Triggers
        </label>
        <div className="space-y-2">
          {TRIGGER_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  current.autoReplyTriggers.includes(value)
                    ? "bg-[#3B82F6] border-[#3B82F6]"
                    : "border-[#1E293B] bg-[#0B0F19] group-hover:border-[#3B82F6]/50"
                )}
                onClick={() => toggleTrigger(value)}
              >
                {current.autoReplyTriggers.includes(value) && (
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

      {/* Trigger Keywords (conditional) */}
      {showKeywords && (
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-2">
            Trigger Keywords
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {current.triggerKeywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs border border-[#3B82F6]/20"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
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
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addKeyword())
              }
              placeholder="Add keyword..."
              className={cn(
                "flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
                "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              )}
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-[#3B82F6]/10 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* DM Auto-Response Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#F8FAFC]">DM Auto-Response</span>
        <button
          onClick={() => update({ dmAutoResponse: !current.dmAutoResponse })}
          className={cn(
            "w-10 h-5 rounded-full relative transition-colors",
            current.dmAutoResponse ? "bg-[#3B82F6]" : "bg-[#1E293B]"
          )}
          role="switch"
          aria-checked={current.dmAutoResponse}
        >
          <span
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full transition-transform",
              current.dmAutoResponse
                ? "bg-white translate-x-5"
                : "bg-[#64748B] translate-x-0.5"
            )}
          />
        </button>
      </div>

      {/* DM Templates (conditional) */}
      {current.dmAutoResponse && (
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-2">
            DM Templates
            <span className="text-[#64748B] ml-1">(one per line)</span>
          </label>
          <textarea
            rows={4}
            value={current.dmTemplates.join("\n")}
            onChange={(e) => {
              const lines = e.target.value.split("\n");
              update({ dmTemplates: lines });
            }}
            placeholder={"Thanks for reaching out!\nWe'll get back to you soon."}
            className={cn(
              "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
              "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] resize-none"
            )}
          />
        </div>
      )}
    </div>
  );
}
