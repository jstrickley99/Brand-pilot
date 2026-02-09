"use client";

import { Niche } from "@/lib/types";
import { getNicheEmoji, cn } from "@/lib/utils";

const niches: { value: Niche; label: string }[] = [
  { value: "fitness", label: "Fitness" },
  { value: "motivation", label: "Motivation" },
  { value: "luxury", label: "Luxury" },
  { value: "memes", label: "Memes" },
  { value: "tech", label: "Tech" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "fashion", label: "Fashion" },
  { value: "custom", label: "Custom" },
];

interface NicheStepProps {
  selected: Niche | null;
  onSelect: (niche: Niche) => void;
}

export function NicheStep({ selected, onSelect }: NicheStepProps) {
  return (
    <div className="py-4">
      <h2 className="text-lg font-semibold text-[#F8FAFC] mb-1">Choose Your Niche</h2>
      <p className="text-sm text-[#94A3B8] mb-6">
        Select the niche that best describes your content strategy
      </p>
      <div className="grid grid-cols-3 gap-3">
        {niches.map((niche) => (
          <button
            key={niche.value}
            onClick={() => onSelect(niche.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
              selected === niche.value
                ? "border-[#3B82F6] bg-[#3B82F6]/10"
                : "border-[#1E293B] hover:border-[#3B82F6]/30 bg-white/5"
            )}
          >
            <span className="text-2xl">{getNicheEmoji(niche.value)}</span>
            <span className="text-sm text-[#F8FAFC]">{niche.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
