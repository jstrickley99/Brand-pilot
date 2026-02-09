"use client";

import { getNicheEmoji, cn } from "@/lib/utils";
import { useState } from "react";
import { Niche } from "@/lib/types";

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

export function NicheSelector() {
  const [selected, setSelected] = useState<Niche>("fitness");

  return (
    <div className="rounded-xl bg-[#16213E] border border-[#1E3A5F] p-6">
      <h3 className="font-semibold mb-2 text-white">Niche Selection</h3>
      <p className="text-sm text-gray-400 mb-4">
        Choose the niche for your account&apos;s content strategy
      </p>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {niches.map((niche) => (
          <button
            key={niche.value}
            onClick={() => setSelected(niche.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
              selected === niche.value
                ? "border-[#3B82F6] bg-[#3B82F6]/10"
                : "border-[#1E3A5F] hover:border-[#3B82F6]/30 bg-white/5"
            )}
          >
            <span className="text-2xl">{getNicheEmoji(niche.value)}</span>
            <span className="text-sm text-white">{niche.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
