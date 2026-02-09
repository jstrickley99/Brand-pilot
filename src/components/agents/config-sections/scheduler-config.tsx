"use client";

import { cn } from "@/lib/utils";
import type { SchedulerConfig as ConfigType } from "@/lib/types";

interface SchedulerConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  activeDays: [],
  postingWindowStart: "09:00",
  postingWindowEnd: "21:00",
  timezone: "America/New_York",
  postsPerDay: 3,
};

const DAYS: { value: string; label: string }[] = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export function SchedulerConfig({ config, onChange }: SchedulerConfigProps) {
  const current = config ?? DEFAULT_CONFIG;

  function update(partial: Partial<ConfigType>) {
    onChange({ ...current, ...partial });
  }

  function toggleDay(day: string) {
    const has = current.activeDays.includes(day);
    update({
      activeDays: has
        ? current.activeDays.filter((d) => d !== day)
        : [...current.activeDays, day],
    });
  }

  return (
    <div className="space-y-5">
      {/* Active Days */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Active Days
        </label>
        <div className="flex gap-1.5">
          {DAYS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleDay(value)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                current.activeDays.includes(value)
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                  : "bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Posting Window */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Posting Window
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[10px] text-[#64748B] mb-1">
              Start
            </label>
            <input
              type="time"
              value={current.postingWindowStart}
              onChange={(e) => update({ postingWindowStart: e.target.value })}
              className={cn(
                "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
                "focus:outline-none focus:border-[#3B82F6] [color-scheme:dark]"
              )}
            />
          </div>
          <span className="text-[#64748B] text-sm mt-4">to</span>
          <div className="flex-1">
            <label className="block text-[10px] text-[#64748B] mb-1">End</label>
            <input
              type="time"
              value={current.postingWindowEnd}
              onChange={(e) => update({ postingWindowEnd: e.target.value })}
              className={cn(
                "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
                "focus:outline-none focus:border-[#3B82F6] [color-scheme:dark]"
              )}
            />
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Timezone
        </label>
        <select
          value={current.timezone}
          onChange={(e) => update({ timezone: e.target.value })}
          className={cn(
            "w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-[#F8FAFC]",
            "focus:outline-none focus:border-[#3B82F6] appearance-none cursor-pointer",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
            "bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-8"
          )}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Posts Per Day */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Posts Per Day
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={current.postsPerDay}
            onChange={(e) => update({ postsPerDay: parseInt(e.target.value) })}
            className="flex-1 h-1.5 bg-[#1E293B] rounded-full appearance-none cursor-pointer accent-[#3B82F6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6] [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-sm font-medium text-[#F8FAFC] w-8 text-center tabular-nums">
            {current.postsPerDay}
          </span>
        </div>
      </div>
    </div>
  );
}
