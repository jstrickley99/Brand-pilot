"use client";

import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function BrandVoiceConfig() {
  const [formality, setFormality] = useState([30]);
  const [humor, setHumor] = useState([40]);
  const [inspiration, setInspiration] = useState([80]);

  return (
    <div className="rounded-xl bg-[#111827] border border-[#1E293B] p-6">
      <h3 className="font-semibold mb-2 text-[#F8FAFC]">Brand Voice</h3>
      <p className="text-sm text-[#94A3B8] mb-6">
        Configure the tone and personality of your content
      </p>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Casual</span>
            <span className="text-sm text-[#94A3B8]">Formal</span>
          </div>
          <Slider
            value={formality}
            onValueChange={setFormality}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-[#94A3B8] text-center mt-1">{formality[0]}%</p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Serious</span>
            <span className="text-sm text-[#94A3B8]">Humorous</span>
          </div>
          <Slider
            value={humor}
            onValueChange={setHumor}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-[#94A3B8] text-center mt-1">{humor[0]}%</p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Practical</span>
            <span className="text-sm text-[#94A3B8]">Inspirational</span>
          </div>
          <Slider
            value={inspiration}
            onValueChange={setInspiration}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-[#94A3B8] text-center mt-1">{inspiration[0]}%</p>
        </div>
      </div>
    </div>
  );
}
