"use client";

import { cn } from "@/lib/utils";
import type { AnalyticsMonitorConfig as ConfigType } from "@/lib/types";

interface AnalyticsConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  metricsToTrack: [],
  reportingFrequency: "weekly",
  performanceThresholds: {
    minEngagementRate: 3.0,
    minReach: 1000,
  },
};

const METRIC_OPTIONS: {
  value: "followers" | "engagement_rate" | "reach" | "saves";
  label: string;
}[] = [
  { value: "followers", label: "Followers" },
  { value: "engagement_rate", label: "Engagement Rate" },
  { value: "reach", label: "Reach" },
  { value: "saves", label: "Saves" },
];

const FREQUENCY_OPTIONS: { value: ConfigType["reportingFrequency"]; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export function AnalyticsConfig({ config, onChange }: AnalyticsConfigProps) {
  const current = config ?? DEFAULT_CONFIG;

  function update(partial: Partial<ConfigType>) {
    onChange({ ...current, ...partial });
  }

  function toggleMetric(
    metric: "followers" | "engagement_rate" | "reach" | "saves"
  ) {
    const has = current.metricsToTrack.includes(metric);
    update({
      metricsToTrack: has
        ? current.metricsToTrack.filter((m) => m !== metric)
        : [...current.metricsToTrack, metric],
    });
  }

  function updateThreshold(
    key: keyof ConfigType["performanceThresholds"],
    value: number
  ) {
    update({
      performanceThresholds: {
        ...current.performanceThresholds,
        [key]: value,
      },
    });
  }

  return (
    <div className="space-y-5">
      {/* Metrics to Track */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Metrics to Track
        </label>
        <div className="space-y-2">
          {METRIC_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  current.metricsToTrack.includes(value)
                    ? "bg-[#3B82F6] border-[#3B82F6]"
                    : "border-[#1E293B] bg-[#0B0F19] group-hover:border-[#3B82F6]/50"
                )}
                onClick={() => toggleMetric(value)}
              >
                {current.metricsToTrack.includes(value) && (
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

      {/* Reporting Frequency */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Reporting Frequency
        </label>
        <div className="flex gap-2">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => update({ reportingFrequency: option.value })}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                current.reportingFrequency === option.value
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                  : "bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/30"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Engagement Rate */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Min Engagement Rate
        </label>
        <div className="relative">
          <input
            type="number"
            step={0.1}
            min={0}
            max={100}
            value={current.performanceThresholds.minEngagementRate}
            onChange={(e) =>
              updateThreshold(
                "minEngagementRate",
                parseFloat(e.target.value) || 0
              )
            }
            className={cn(
              "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 pr-8 text-sm text-[#F8FAFC]",
              "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
            %
          </span>
        </div>
      </div>

      {/* Min Reach */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Min Reach
        </label>
        <input
          type="number"
          min={0}
          step={100}
          value={current.performanceThresholds.minReach}
          onChange={(e) =>
            updateThreshold("minReach", parseInt(e.target.value) || 0)
          }
          className={cn(
            "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
            "placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          )}
        />
      </div>
    </div>
  );
}
