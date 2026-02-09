"use client";

import { cn } from "@/lib/utils";
import type { AutonomyLevel } from "@/lib/types";

interface AutonomyConfigProps {
  autonomyLevel: AutonomyLevel;
  isActive: boolean;
  onChange: (level: AutonomyLevel) => void;
  onActiveChange: (active: boolean) => void;
}

const AUTONOMY_OPTIONS: { value: AutonomyLevel; label: string }[] = [
  { value: "full_auto", label: "Full Auto" },
  { value: "semi_auto", label: "Semi-Auto" },
  { value: "approval_required", label: "Approval Required" },
];

export function AutonomyConfig({
  autonomyLevel,
  isActive,
  onChange,
  onActiveChange,
}: AutonomyConfigProps) {
  return (
    <div className="px-6 py-4 border-b border-[#1E293B]">
      {/* Autonomy Level */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Autonomy Level
        </label>
        <div className="flex gap-2">
          {AUTONOMY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                autonomyLevel === option.value
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                  : "bg-[#0B0F19] border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/30"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active/Paused Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#F8FAFC]">
          {isActive ? "Active" : "Paused"}
        </span>
        <button
          onClick={() => onActiveChange(!isActive)}
          className={cn(
            "w-10 h-5 rounded-full relative transition-colors",
            isActive ? "bg-[#3B82F6]" : "bg-[#1E293B]"
          )}
          role="switch"
          aria-checked={isActive}
        >
          <span
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full transition-transform",
              isActive
                ? "bg-white translate-x-5"
                : "bg-[#64748B] translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
