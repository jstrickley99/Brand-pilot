"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ContentMix } from "@/lib/types";

interface ConfigureStepProps {
  brandVoice: { toneFormality: number; toneHumor: number; toneInspiration: number };
  onBrandVoiceChange: (voice: { toneFormality: number; toneHumor: number; toneInspiration: number }) => void;
  contentMix: ContentMix;
  onContentMixChange: (mix: ContentMix) => void;
  postsPerDay: number;
  onPostsPerDayChange: (n: number) => void;
}

export function ConfigureStep({
  brandVoice,
  onBrandVoiceChange,
  contentMix,
  onContentMixChange,
  postsPerDay,
  onPostsPerDayChange,
}: ConfigureStepProps) {
  return (
    <div className="py-4">
      <h2 className="text-lg font-semibold text-[#F8FAFC] mb-1">Configure Your Brand</h2>
      <p className="text-sm text-[#94A3B8] mb-6">
        Set your brand voice and content preferences
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Voice */}
        <div className="space-y-5">
          <h3 className="text-sm font-medium text-[#F8FAFC]">Brand Voice</h3>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Casual</span>
              <span className="text-xs text-[#94A3B8]">Formal</span>
            </div>
            <Slider
              value={[brandVoice.toneFormality]}
              onValueChange={([v]) => onBrandVoiceChange({ ...brandVoice, toneFormality: v })}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-[#94A3B8] text-center mt-1">{brandVoice.toneFormality}%</p>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Serious</span>
              <span className="text-xs text-[#94A3B8]">Humorous</span>
            </div>
            <Slider
              value={[brandVoice.toneHumor]}
              onValueChange={([v]) => onBrandVoiceChange({ ...brandVoice, toneHumor: v })}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-[#94A3B8] text-center mt-1">{brandVoice.toneHumor}%</p>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Practical</span>
              <span className="text-xs text-[#94A3B8]">Inspirational</span>
            </div>
            <Slider
              value={[brandVoice.toneInspiration]}
              onValueChange={([v]) => onBrandVoiceChange({ ...brandVoice, toneInspiration: v })}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-[#94A3B8] text-center mt-1">{brandVoice.toneInspiration}%</p>
          </div>
        </div>

        {/* Content Mix */}
        <div className="space-y-5">
          <h3 className="text-sm font-medium text-[#F8FAFC]">Content Mix</h3>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Educational</span>
              <span className="text-xs text-[#94A3B8]">{contentMix.educational}%</span>
            </div>
            <Slider
              value={[contentMix.educational]}
              onValueChange={([v]) => onContentMixChange({ ...contentMix, educational: v })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Inspirational</span>
              <span className="text-xs text-[#94A3B8]">{contentMix.inspirational}%</span>
            </div>
            <Slider
              value={[contentMix.inspirational]}
              onValueChange={([v]) => onContentMixChange({ ...contentMix, inspirational: v })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Entertaining</span>
              <span className="text-xs text-[#94A3B8]">{contentMix.entertaining}%</span>
            </div>
            <Slider
              value={[contentMix.entertaining]}
              onValueChange={([v]) => onContentMixChange({ ...contentMix, entertaining: v })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Promotional</span>
              <span className="text-xs text-[#94A3B8]">{contentMix.promotional}%</span>
            </div>
            <Slider
              value={[contentMix.promotional]}
              onValueChange={([v]) => onContentMixChange({ ...contentMix, promotional: v })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div className="pt-3 border-t border-[#1E293B]">
            <span className="text-xs text-[#94A3B8] mb-2 block">Posts Per Day</span>
            <Input
              type="number"
              min={1}
              max={10}
              value={postsPerDay}
              onChange={(e) => onPostsPerDayChange(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="w-24 bg-white/5 border-[#1E293B] text-[#F8FAFC]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
