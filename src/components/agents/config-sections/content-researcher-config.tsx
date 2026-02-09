"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentResearcherConfig as ConfigType } from "@/lib/types";

interface ContentResearcherConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  topics: [],
  competitorAccounts: [],
  trendSources: {
    tiktokTrending: false,
    instagramExplore: false,
    industryNews: false,
  },
};

export function ContentResearcherConfig({
  config,
  onChange,
}: ContentResearcherConfigProps) {
  const current = config ?? DEFAULT_CONFIG;
  const [topicInput, setTopicInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");

  function addTopic() {
    const value = topicInput.trim();
    if (!value || current.topics.includes(value)) return;
    const updated = { ...current, topics: [...current.topics, value] };
    onChange(updated);
    setTopicInput("");
  }

  function removeTopic(topic: string) {
    const updated = {
      ...current,
      topics: current.topics.filter((t) => t !== topic),
    };
    onChange(updated);
  }

  function addCompetitor() {
    let value = competitorInput.trim();
    if (!value) return;
    if (!value.startsWith("@")) value = "@" + value;
    if (current.competitorAccounts.includes(value)) return;
    const updated = {
      ...current,
      competitorAccounts: [...current.competitorAccounts, value],
    };
    onChange(updated);
    setCompetitorInput("");
  }

  function removeCompetitor(account: string) {
    const updated = {
      ...current,
      competitorAccounts: current.competitorAccounts.filter(
        (a) => a !== account
      ),
    };
    onChange(updated);
  }

  function toggleTrendSource(
    key: keyof ConfigType["trendSources"],
    checked: boolean
  ) {
    const updated = {
      ...current,
      trendSources: { ...current.trendSources, [key]: checked },
    };
    onChange(updated);
  }

  return (
    <div className="space-y-5">
      {/* Topics */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Topics
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {current.topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs border border-[#3B82F6]/20"
            >
              {topic}
              <button
                onClick={() => removeTopic(topic)}
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
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
            placeholder="Add a topic..."
            className={cn(
              "flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
              "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            )}
          />
          <button
            onClick={addTopic}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[#3B82F6]/10 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Competitor Accounts */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Competitor Accounts
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {current.competitorAccounts.map((account) => (
            <span
              key={account}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs border border-[#3B82F6]/20"
            >
              {account}
              <button
                onClick={() => removeCompetitor(account)}
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
            value={competitorInput}
            onChange={(e) => setCompetitorInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCompetitor())
            }
            placeholder="@competitor_handle"
            className={cn(
              "flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
              "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            )}
          />
          <button
            onClick={addCompetitor}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[#3B82F6]/10 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Trend Sources */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Trend Sources
        </label>
        <div className="space-y-2">
          {(
            [
              { key: "tiktokTrending" as const, label: "TikTok Trending" },
              { key: "instagramExplore" as const, label: "Instagram Explore" },
              { key: "industryNews" as const, label: "Industry News" },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  current.trendSources[key]
                    ? "bg-[#3B82F6] border-[#3B82F6]"
                    : "border-[#1E293B] bg-[#0B0F19] group-hover:border-[#3B82F6]/50"
                )}
                onClick={() => toggleTrendSource(key, !current.trendSources[key])}
              >
                {current.trendSources[key] && (
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
