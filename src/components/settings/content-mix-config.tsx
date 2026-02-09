"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ContentMixConfigProps {
  educational: number[];
  inspirational: number[];
  entertaining: number[];
  promotional: number[];
  postsPerDay: string;
  onEducationalChange: (value: number[]) => void;
  onInspirationalChange: (value: number[]) => void;
  onEntertainingChange: (value: number[]) => void;
  onPromotionalChange: (value: number[]) => void;
  onPostsPerDayChange: (value: string) => void;
}

export function ContentMixConfig({
  educational,
  inspirational,
  entertaining,
  promotional,
  postsPerDay,
  onEducationalChange,
  onInspirationalChange,
  onEntertainingChange,
  onPromotionalChange,
  onPostsPerDayChange,
}: ContentMixConfigProps) {
  return (
    <div className="rounded-xl bg-[#111827] border border-[#1E293B] p-6">
      <h3 className="font-semibold mb-2 text-[#F8FAFC]">Content Mix</h3>
      <p className="text-sm text-[#94A3B8] mb-6">
        Set the ratio of content types in your feed
      </p>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Educational</span>
            <span className="text-sm text-[#94A3B8]">{educational[0]}%</span>
          </div>
          <Slider
            value={educational}
            onValueChange={onEducationalChange}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Inspirational</span>
            <span className="text-sm text-[#94A3B8]">{inspirational[0]}%</span>
          </div>
          <Slider
            value={inspirational}
            onValueChange={onInspirationalChange}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Entertaining</span>
            <span className="text-sm text-[#94A3B8]">{entertaining[0]}%</span>
          </div>
          <Slider
            value={entertaining}
            onValueChange={onEntertainingChange}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Promotional</span>
            <span className="text-sm text-[#94A3B8]">{promotional[0]}%</span>
          </div>
          <Slider
            value={promotional}
            onValueChange={onPromotionalChange}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <div className="pt-4 border-t border-[#1E293B]">
          <span className="text-sm text-[#94A3B8] mb-2 block">Posts Per Day</span>
          <Input
            type="number"
            min={1}
            max={10}
            value={postsPerDay}
            onChange={(e) => onPostsPerDayChange(e.target.value)}
            className="w-24 bg-white/5 border-[#1E293B] text-[#F8FAFC]"
          />
        </div>
      </div>
    </div>
  );
}
