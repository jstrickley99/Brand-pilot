"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WelcomeStep } from "./welcome-step";
import { NicheStep } from "./niche-step";
import { ConnectStep } from "./connect-step";
import { ConfigureStep } from "./configure-step";
import { isOnboardingComplete, setOnboardingComplete, saveOnboardingData } from "@/lib/onboarding";
import { OnboardingStep, OnboardingData, Niche, ContentMix } from "@/lib/types";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const STEPS: OnboardingStep[] = ["welcome", "niche", "connect", "configure"];

const stepLabels: Record<OnboardingStep, string> = {
  welcome: "Welcome",
  niche: "Niche",
  connect: "Connect",
  configure: "Configure",
};

export function OnboardingWizard() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");

  const [data, setData] = useState<OnboardingData>({
    niche: null,
    connectedPlatforms: [],
    brandVoice: { toneFormality: 50, toneHumor: 50, toneInspiration: 50 },
    contentMix: { educational: 25, inspirational: 25, entertaining: 25, promotional: 25 },
    postsPerDay: 3,
  });

  useEffect(() => {
    setMounted(true);
    if (!isOnboardingComplete()) {
      setOpen(true);
    }
  }, []);

  if (!mounted) return null;

  const currentIndex = STEPS.indexOf(currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  }

  function handleBack() {
    if (!isFirst) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  }

  function handleSkip() {
    setOnboardingComplete();
    setOpen(false);
  }

  function handleFinish() {
    saveOnboardingData(data);
    setOnboardingComplete();
    setOpen(false);
  }

  function handleTogglePlatform(platformId: string) {
    setData((prev) => ({
      ...prev,
      connectedPlatforms: prev.connectedPlatforms.includes(platformId)
        ? prev.connectedPlatforms.filter((id) => id !== platformId)
        : [...prev.connectedPlatforms, platformId],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleSkip(); }}>
      <DialogContent className="max-w-3xl bg-[#0A0F1C] border-[#1E293B] text-[#F8FAFC] max-h-[90vh] overflow-y-auto">
        {currentStep !== "welcome" && (
          <DialogHeader>
            <DialogTitle className="text-[#F8FAFC]">
              {stepLabels[currentStep]}
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Step {currentIndex + 1} of {STEPS.length}
            </DialogDescription>
            <Progress value={progress} className="h-2 bg-[#1E293B] mt-2" />
          </DialogHeader>
        )}

        {currentStep === "welcome" && (
          <WelcomeStep onNext={handleNext} onSkip={handleSkip} />
        )}

        {currentStep === "niche" && (
          <NicheStep
            selected={data.niche}
            onSelect={(niche: Niche) => setData((prev) => ({ ...prev, niche }))}
          />
        )}

        {currentStep === "connect" && (
          <ConnectStep
            connectedPlatforms={data.connectedPlatforms}
            onToggle={handleTogglePlatform}
          />
        )}

        {currentStep === "configure" && (
          <ConfigureStep
            brandVoice={data.brandVoice}
            onBrandVoiceChange={(brandVoice) => setData((prev) => ({ ...prev, brandVoice }))}
            contentMix={data.contentMix}
            onContentMixChange={(contentMix: ContentMix) => setData((prev) => ({ ...prev, contentMix }))}
            postsPerDay={data.postsPerDay}
            onPostsPerDayChange={(postsPerDay) => setData((prev) => ({ ...prev, postsPerDay }))}
          />
        )}

        {currentStep !== "welcome" && (
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              {isLast ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
