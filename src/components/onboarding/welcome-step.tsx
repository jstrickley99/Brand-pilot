"use client";

import { Button } from "@/components/ui/button";
import { Zap, Bot, BarChart3, Calendar } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="h-16 w-16 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center mb-6">
        <Zap className="h-8 w-8 text-[#3B82F6]" />
      </div>
      <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Welcome to BrandPilot</h2>
      <p className="text-[#94A3B8] mb-8 max-w-md">
        Your AI-powered social media growth platform. Let&apos;s get you set up in just a few steps.
      </p>

      <div className="grid gap-4 w-full max-w-sm mb-8">
        <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-white/5 border border-[#1E293B]">
          <Bot className="h-5 w-5 text-[#3B82F6] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">AI Content Generation</p>
            <p className="text-xs text-[#94A3B8]">Create engaging posts with Claude or GPT</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-white/5 border border-[#1E293B]">
          <Calendar className="h-5 w-5 text-[#3B82F6] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">Smart Scheduling</p>
            <p className="text-xs text-[#94A3B8]">Post at optimal times for maximum reach</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-white/5 border border-[#1E293B]">
          <BarChart3 className="h-5 w-5 text-[#3B82F6] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">Growth Analytics</p>
            <p className="text-xs text-[#94A3B8]">Track performance and optimize your strategy</p>
          </div>
        </div>
      </div>

      <Button onClick={onNext} className="w-full max-w-sm bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
        Get Started
      </Button>
      <button onClick={onSkip} className="mt-3 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
        Skip setup
      </button>
    </div>
  );
}
