import { OnboardingData } from "./types";

const ONBOARDING_COMPLETE_KEY = "brandpilot_onboarding_complete";
const ONBOARDING_DATA_KEY = "brandpilot_onboarding_data";

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
}

export function setOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
}

export function getOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(ONBOARDING_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveOnboardingData(data: OnboardingData): void {
  localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
}
