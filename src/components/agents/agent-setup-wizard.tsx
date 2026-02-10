"use client";

import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Plus,
  User,
  Hash,
  Palette,
  Calendar,
  Clock,
  Sparkles,
  Target,
  MessageSquare,
} from "lucide-react";
import type {
  AgentConfig,
  InstagramAccount,
  ContentMix,
  ContentType,
  Niche,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STEP_LABELS = [
  "Pick Account",
  "Niche & Topics",
  "Brand Voice",
  "Content Strategy",
  "Review & Launch",
] as const;

const NICHES: { value: Niche; label: string; icon: React.ReactNode }[] = [
  { value: "fitness", label: "Fitness", icon: <Target className="h-5 w-5" /> },
  { value: "motivation", label: "Motivation", icon: <Sparkles className="h-5 w-5" /> },
  { value: "luxury", label: "Luxury", icon: <Palette className="h-5 w-5" /> },
  { value: "memes", label: "Memes", icon: <MessageSquare className="h-5 w-5" /> },
  { value: "tech", label: "Tech", icon: <Hash className="h-5 w-5" /> },
  { value: "food", label: "Food", icon: <Sparkles className="h-5 w-5" /> },
  { value: "travel", label: "Travel", icon: <Calendar className="h-5 w-5" /> },
  { value: "fashion", label: "Fashion", icon: <Palette className="h-5 w-5" /> },
  { value: "custom", label: "Custom", icon: <Plus className="h-5 w-5" /> },
];

const NICHE_TOPIC_SUGGESTIONS: Record<string, string[]> = {
  fitness: ["workout tips", "nutrition", "body transformation", "home gym", "cardio"],
  motivation: ["mindset", "success habits", "morning routine", "goal setting", "self-improvement"],
  luxury: ["watches", "supercars", "real estate", "designer fashion", "fine dining"],
  memes: ["relatable humor", "trending audio", "reaction memes", "dark humor", "wholesome"],
  tech: ["AI", "gadgets", "coding", "startups", "productivity apps"],
  food: ["recipes", "meal prep", "restaurant reviews", "healthy eating", "baking"],
  travel: ["hidden gems", "budget travel", "luxury resorts", "solo travel", "adventure"],
  fashion: ["streetwear", "OOTD", "thrift hauls", "styling tips", "seasonal trends"],
  custom: [],
};

const WRITING_STYLES = [
  "Conversational",
  "Professional",
  "Edgy",
  "Inspirational",
  "Educational",
];

const EMOJI_OPTIONS: { value: AgentConfig["brandVoice"]["emojiUsage"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "minimal", label: "Minimal" },
  { value: "moderate", label: "Moderate" },
  { value: "heavy", label: "Heavy" },
];

const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "carousel", label: "Carousel" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
];

const HASHTAG_STRATEGIES: {
  value: AgentConfig["contentStrategy"]["hashtagStrategy"];
  label: string;
  desc: string;
}[] = [
  { value: "max_reach", label: "Max Reach", desc: "Popular, high-volume hashtags" },
  { value: "niche_specific", label: "Niche Specific", desc: "Targeted, lower-competition tags" },
  { value: "mixed", label: "Mixed", desc: "Balanced mix of reach & niche" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  "Asia/Kolkata",
  "Australia/Sydney",
  "UTC",
];

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface AgentSetupWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (agentConfig: AgentConfig, name: string) => void;
  accounts: InstagramAccount[];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function AgentSetupWizard({
  open,
  onClose,
  onComplete,
  accounts,
}: AgentSetupWizardProps) {
  /* ---- wizard state ---- */
  const [step, setStep] = useState(0);

  /* ---- step 1 state ---- */
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  /* ---- step 2 state ---- */
  const [niche, setNiche] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  /* ---- step 3 state ---- */
  const [toneFormality, setToneFormality] = useState(50);
  const [toneHumor, setToneHumor] = useState(50);
  const [toneInspiration, setToneInspiration] = useState(50);
  const [writingStyle, setWritingStyle] = useState("Conversational");
  const [emojiUsage, setEmojiUsage] = useState<AgentConfig["brandVoice"]["emojiUsage"]>("minimal");
  const [examplePosts, setExamplePosts] = useState("");

  /* ---- step 4 state ---- */
  const [contentMix, setContentMix] = useState<ContentMix>({
    educational: 25,
    inspirational: 25,
    entertaining: 25,
    promotional: 25,
  });
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [contentTypes, setContentTypes] = useState<ContentType[]>(["image"]);
  const [hashtagStrategy, setHashtagStrategy] =
    useState<AgentConfig["contentStrategy"]["hashtagStrategy"]>("mixed");
  const [activeDays, setActiveDays] = useState<string[]>([
    "Mon", "Tue", "Wed", "Thu", "Fri",
  ]);
  const [postingStart, setPostingStart] = useState("09:00");
  const [postingEnd, setPostingEnd] = useState("18:00");
  const [timezone, setTimezone] = useState("America/New_York");

  /* ---- step 5 state ---- */
  const [agentName, setAgentName] = useState("");

  /* ---- derived ---- */
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  /* ---- auto-generate name when reaching step 5 ---- */
  const defaultName = useMemo(() => {
    if (!selectedAccount) return "New Agent";
    const nicheLabel = niche.charAt(0).toUpperCase() + niche.slice(1);
    return `@${selectedAccount.handle} ${nicheLabel} Agent`;
  }, [selectedAccount, niche]);

  /* ---- validation per step ---- */
  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return selectedAccountId !== "";
      case 1:
        return niche !== "" && topics.length >= 1;
      case 2:
        return true; // all have defaults
      case 3:
        return contentTypes.length >= 1 && activeDays.length >= 1;
      case 4:
        return (agentName || defaultName).trim().length > 0;
      default:
        return false;
    }
  }, [step, selectedAccountId, niche, topics, contentTypes, activeDays, agentName, defaultName]);

  /* ---- handlers ---- */
  const handleNext = useCallback(() => {
    if (step === 4) {
      // Launch
      const config: AgentConfig = {
        accountId: selectedAccountId,
        niche,
        topics,
        brandVoice: {
          toneFormality,
          toneHumor,
          toneInspiration,
          writingStyle,
          emojiUsage,
          examplePosts: examplePosts
            .split("\n---\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        contentStrategy: {
          contentMix,
          postsPerDay,
          contentTypes,
          hashtagStrategy,
        },
        visualStyle: {
          style: writingStyle,
          brandColors: ["#3B82F6", "#F97316"],
          preferredFormats: contentTypes.map((ct) => {
            const map: Record<ContentType, "reels" | "carousels" | "stories" | "single_image"> = {
              reel: "reels",
              carousel: "carousels",
              story: "stories",
              image: "single_image",
            };
            return map[ct];
          }),
        },
        schedule: {
          activeDays,
          postingWindowStart: postingStart,
          postingWindowEnd: postingEnd,
          timezone,
        },
      };
      onComplete(config, (agentName || defaultName).trim());
      return;
    }
    if (step === 0 && agentName === "") {
      // pre-fill name
    }
    setStep((s) => Math.min(s + 1, 4));
  }, [
    step, selectedAccountId, niche, topics, toneFormality, toneHumor,
    toneInspiration, writingStyle, emojiUsage, examplePosts, contentMix,
    postsPerDay, contentTypes, hashtagStrategy, activeDays, postingStart,
    postingEnd, timezone, agentName, defaultName, onComplete,
  ]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleAddTopic = useCallback(() => {
    const trimmed = topicInput.trim().toLowerCase();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics((prev) => [...prev, trimmed]);
    }
    setTopicInput("");
  }, [topicInput, topics]);

  const handleRemoveTopic = useCallback((topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic));
  }, []);

  const handleNicheSelect = useCallback((value: string) => {
    setNiche(value);
    const suggestions = NICHE_TOPIC_SUGGESTIONS[value] || [];
    setTopics(suggestions.slice(0, 3));
  }, []);

  const handleContentMixChange = useCallback(
    (key: keyof ContentMix, value: number) => {
      setContentMix((prev) => {
        const others = Object.keys(prev).filter((k) => k !== key) as (keyof ContentMix)[];
        const oldVal = prev[key];
        const diff = value - oldVal;
        const othersTotal = others.reduce((sum, k) => sum + prev[k], 0);

        if (othersTotal === 0 && diff > 0) return prev;

        const newMix = { ...prev, [key]: value };
        others.forEach((k) => {
          const proportion = othersTotal > 0 ? prev[k] / othersTotal : 1 / others.length;
          newMix[k] = Math.max(0, Math.round(prev[k] - diff * proportion));
        });

        // Adjust rounding to ensure sum = 100
        const total = Object.values(newMix).reduce((s, v) => s + v, 0);
        if (total !== 100 && others.length > 0) {
          newMix[others[0]] += 100 - total;
        }

        return newMix;
      });
    },
    []
  );

  const toggleContentType = useCallback((ct: ContentType) => {
    setContentTypes((prev) =>
      prev.includes(ct) ? prev.filter((t) => t !== ct) : [...prev, ct]
    );
  }, []);

  const toggleDay = useCallback((day: string) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  /* -------------------------------------------------------------------------- */
  /*  STEP RENDERERS                                                             */
  /* -------------------------------------------------------------------------- */

  /* ---- Step 1: Pick Account ---- */
  function renderStep1() {
    if (accounts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center">
            <User className="h-8 w-8 text-[#64748B]" />
          </div>
          <p className="text-[#94A3B8] text-center text-sm">
            No connected accounts found.
          </p>
          <a
            href="/accounts"
            className="text-[#3B82F6] hover:text-[#3B82F6]/80 text-sm font-medium underline underline-offset-2"
          >
            Connect an account first
          </a>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-[#94A3B8] text-sm mb-4">
          Select the Instagram account this agent will manage.
        </p>
        <div className="grid gap-3">
          {accounts.map((account) => {
            const selected = account.id === selectedAccountId;
            return (
              <button
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border transition-all text-left w-full
                  ${selected
                    ? "border-[#3B82F6] bg-[#3B82F6]/10"
                    : "border-[#1E293B] bg-[#111827] hover:border-[#3B82F6]/50"
                  }
                `}
              >
                <div className="relative flex-shrink-0">
                  {account.avatarUrl ? (
                    <img
                      src={account.avatarUrl}
                      alt={account.handle}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center">
                      <User className="h-6 w-6 text-[#64748B]" />
                    </div>
                  )}
                  {selected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#3B82F6] flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F8FAFC] font-medium truncate">
                    @{account.handle}
                  </p>
                  <p className="text-[#64748B] text-sm truncate">
                    {account.displayName} &middot; Instagram
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#F8FAFC] text-sm font-medium">
                    {account.followers.toLocaleString()}
                  </p>
                  <p className="text-[#64748B] text-xs">followers</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---- Step 2: Niche & Topics ---- */
  function renderStep2() {
    return (
      <div className="space-y-6">
        {/* Niche selector */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 block">
            Select your niche
          </label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => {
              const selected = niche === n.value;
              return (
                <button
                  key={n.value}
                  onClick={() => handleNicheSelect(n.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                    ${selected
                      ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "border-[#1E293B] bg-[#111827] text-[#94A3B8] hover:border-[#3B82F6]/50 hover:text-[#F8FAFC]"
                    }
                  `}
                >
                  {n.icon}
                  {n.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic tags */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 block">
            Topics
          </label>
          <p className="text-[#64748B] text-xs mb-2">
            Type a topic and press Enter to add it
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTopic();
                }
              }}
              placeholder="e.g. workout tips"
              className="flex-1 px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#F8FAFC] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
            <Button
              type="button"
              onClick={handleAddTopic}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white px-3"
              disabled={!topicInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] text-sm"
                >
                  {topic}
                  <button
                    onClick={() => handleRemoveTopic(topic)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {niche && NICHE_TOPIC_SUGGESTIONS[niche]?.length > 0 && (
            <div className="mt-4">
              <p className="text-[#64748B] text-xs mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {NICHE_TOPIC_SUGGESTIONS[niche]
                  .filter((s) => !topics.includes(s))
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() =>
                        setTopics((prev) =>
                          prev.includes(suggestion) ? prev : [...prev, suggestion]
                        )
                      }
                      className="px-3 py-1 rounded-full border border-dashed border-[#1E293B] text-[#64748B] text-xs hover:border-[#3B82F6]/50 hover:text-[#94A3B8] transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---- Step 3: Brand Voice ---- */
  function renderStep3() {
    return (
      <div className="space-y-6">
        {/* Sliders */}
        <div className="space-y-5">
          {/* Formality */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[#F8FAFC] text-sm font-medium">Formality</label>
              <span className="text-[#64748B] text-xs">
                {toneFormality < 33 ? "Casual" : toneFormality < 66 ? "Balanced" : "Formal"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#64748B] text-xs w-14">Casual</span>
              <input
                type="range"
                min={0}
                max={100}
                value={toneFormality}
                onChange={(e) => setToneFormality(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-[#1E293B] accent-[#3B82F6] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-[#64748B] text-xs w-14 text-right">Formal</span>
            </div>
          </div>

          {/* Humor */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[#F8FAFC] text-sm font-medium">Humor</label>
              <span className="text-[#64748B] text-xs">
                {toneHumor < 33 ? "Serious" : toneHumor < 66 ? "Balanced" : "Funny"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#64748B] text-xs w-14">Serious</span>
              <input
                type="range"
                min={0}
                max={100}
                value={toneHumor}
                onChange={(e) => setToneHumor(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-[#1E293B] accent-[#3B82F6] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-[#64748B] text-xs w-14 text-right">Funny</span>
            </div>
          </div>

          {/* Inspiration */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[#F8FAFC] text-sm font-medium">Inspiration</label>
              <span className="text-[#64748B] text-xs">
                {toneInspiration < 33 ? "Neutral" : toneInspiration < 66 ? "Balanced" : "Inspirational"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#64748B] text-xs w-14">Neutral</span>
              <input
                type="range"
                min={0}
                max={100}
                value={toneInspiration}
                onChange={(e) => setToneInspiration(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-[#1E293B] accent-[#3B82F6] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-[#64748B] text-xs w-14 text-right">Inspiring</span>
            </div>
          </div>
        </div>

        {/* Writing Style */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-2 block">
            Writing Style
          </label>
          <select
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
          >
            {WRITING_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Emoji Usage */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 block">
            Emoji Usage
          </label>
          <div className="flex flex-wrap gap-3">
            {EMOJI_OPTIONS.map((opt) => {
              const selected = emojiUsage === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all
                    ${selected
                      ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "border-[#1E293B] bg-[#111827] text-[#94A3B8] hover:border-[#3B82F6]/50"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="emojiUsage"
                    value={opt.value}
                    checked={selected}
                    onChange={() => setEmojiUsage(opt.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selected ? "border-[#3B82F6]" : "border-[#1E293B]"
                    }`}
                  >
                    {selected && (
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    )}
                  </div>
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* Example Posts */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-2 block">
            Example Posts
            <span className="text-[#64748B] font-normal ml-1">(optional)</span>
          </label>
          <p className="text-[#64748B] text-xs mb-2">
            Paste 2-3 of your best posts for the AI to learn from. Separate with a line containing only &quot;---&quot;.
          </p>
          <textarea
            value={examplePosts}
            onChange={(e) => setExamplePosts(e.target.value)}
            rows={4}
            placeholder={"My first amazing post here...\n---\nSecond post goes here..."}
            className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#F8FAFC] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
          />
        </div>
      </div>
    );
  }

  /* ---- Step 4: Content Strategy ---- */
  function renderStep4() {
    return (
      <div className="space-y-6">
        {/* Content Mix */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 block">
            Content Mix
          </label>
          <p className="text-[#64748B] text-xs mb-3">
            Adjust the balance of your content types. Must total 100%.
          </p>
          <div className="space-y-3">
            {(Object.keys(contentMix) as (keyof ContentMix)[]).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-[#94A3B8] text-sm w-28 capitalize">{key}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={contentMix[key]}
                  onChange={(e) => handleContentMixChange(key, Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-[#1E293B] accent-[#3B82F6] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6] [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-[#F8FAFC] text-sm w-10 text-right font-medium">
                  {contentMix[key]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts Per Day */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 block">
            Posts Per Day
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPostsPerDay((p) => Math.max(1, p - 1))}
              className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/50 hover:text-[#F8FAFC] transition-colors flex items-center justify-center text-lg font-medium"
            >
              -
            </button>
            <span className="text-[#F8FAFC] text-2xl font-bold w-12 text-center">
              {postsPerDay}
            </span>
            <button
              onClick={() => setPostsPerDay((p) => Math.min(10, p + 1))}
              className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1E293B] text-[#94A3B8] hover:border-[#3B82F6]/50 hover:text-[#F8FAFC] transition-colors flex items-center justify-center text-lg font-medium"
            >
              +
            </button>
            <span className="text-[#64748B] text-sm">per day</span>
          </div>
        </div>

        {/* Content Types */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 block">
            Content Types
          </label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPE_OPTIONS.map((ct) => {
              const selected = contentTypes.includes(ct.value);
              return (
                <button
                  key={ct.value}
                  onClick={() => toggleContentType(ct.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                    ${selected
                      ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "border-[#1E293B] bg-[#111827] text-[#94A3B8] hover:border-[#3B82F6]/50"
                    }
                  `}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                  {ct.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hashtag Strategy */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 block">
            Hashtag Strategy
          </label>
          <div className="grid gap-2">
            {HASHTAG_STRATEGIES.map((hs) => {
              const selected = hashtagStrategy === hs.value;
              return (
                <label
                  key={hs.value}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all
                    ${selected
                      ? "border-[#3B82F6] bg-[#3B82F6]/10"
                      : "border-[#1E293B] bg-[#111827] hover:border-[#3B82F6]/50"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="hashtagStrategy"
                    value={hs.value}
                    checked={selected}
                    onChange={() => setHashtagStrategy(hs.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected ? "border-[#3B82F6]" : "border-[#1E293B]"
                    }`}
                  >
                    {selected && (
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    )}
                  </div>
                  <div>
                    <p className={selected ? "text-[#3B82F6] font-medium" : "text-[#F8FAFC]"}>
                      {hs.label}
                    </p>
                    <p className="text-[#64748B] text-xs">{hs.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        <div className="border-t border-[#1E293B] pt-5">
          <label className="text-[#F8FAFC] text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#3B82F6]" />
            Schedule
          </label>

          {/* Active Days */}
          <div className="mb-4">
            <p className="text-[#94A3B8] text-xs mb-2">Active Days</p>
            <div className="flex gap-2">
              {DAYS.map((day) => {
                const selected = activeDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`
                      w-10 h-10 rounded-lg text-xs font-medium transition-all
                      ${selected
                        ? "bg-[#3B82F6] text-white"
                        : "bg-[#111827] border border-[#1E293B] text-[#64748B] hover:border-[#3B82F6]/50"
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posting Window */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[#94A3B8] text-xs mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Start Time
              </p>
              <input
                type="time"
                value={postingStart}
                onChange={(e) => setPostingStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" /> End Time
              </p>
              <input
                type="time"
                value={postingEnd}
                onChange={(e) => setPostingEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <p className="text-[#94A3B8] text-xs mb-2">Timezone</p>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Step 5: Review & Launch ---- */
  function renderStep5() {
    return (
      <div className="space-y-5">
        {/* Agent Name */}
        <div>
          <label className="text-[#F8FAFC] text-sm font-medium mb-2 block">
            Agent Name
          </label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder={defaultName}
            className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#F8FAFC] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3">
          {/* Account */}
          <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-[#3B82F6]" />
              <h4 className="text-[#F8FAFC] text-sm font-medium">Account</h4>
            </div>
            <p className="text-[#94A3B8] text-sm">
              @{selectedAccount?.handle || "N/A"}{" "}
              <span className="text-[#64748B]">
                &middot; {selectedAccount?.followers.toLocaleString()} followers
              </span>
            </p>
          </div>

          {/* Niche & Topics */}
          <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-[#F97316]" />
              <h4 className="text-[#F8FAFC] text-sm font-medium">Niche & Topics</h4>
            </div>
            <p className="text-[#94A3B8] text-sm capitalize mb-1">{niche}</p>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Brand Voice */}
          <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-[#10B981]" />
              <h4 className="text-[#F8FAFC] text-sm font-medium">Brand Voice</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div>
                <p className="text-[#64748B]">Formality</p>
                <p className="text-[#F8FAFC]">{toneFormality}%</p>
              </div>
              <div>
                <p className="text-[#64748B]">Humor</p>
                <p className="text-[#F8FAFC]">{toneHumor}%</p>
              </div>
              <div>
                <p className="text-[#64748B]">Inspiration</p>
                <p className="text-[#F8FAFC]">{toneInspiration}%</p>
              </div>
            </div>
            <p className="text-[#94A3B8] text-xs">
              {writingStyle} style &middot; Emoji: {emojiUsage}
            </p>
          </div>

          {/* Content Strategy */}
          <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#3B82F6]" />
              <h4 className="text-[#F8FAFC] text-sm font-medium">Content Strategy</h4>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Educational</span>
                <span className="text-[#F8FAFC]">{contentMix.educational}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Inspirational</span>
                <span className="text-[#F8FAFC]">{contentMix.inspirational}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Entertaining</span>
                <span className="text-[#F8FAFC]">{contentMix.entertaining}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Promotional</span>
                <span className="text-[#F8FAFC]">{contentMix.promotional}%</span>
              </div>
            </div>
            <p className="text-[#94A3B8] text-xs">
              {postsPerDay} posts/day &middot;{" "}
              {contentTypes.map((ct) => ct.charAt(0).toUpperCase() + ct.slice(1)).join(", ")}{" "}
              &middot;{" "}
              {hashtagStrategy === "max_reach"
                ? "Max Reach"
                : hashtagStrategy === "niche_specific"
                ? "Niche Specific"
                : "Mixed"}{" "}
              hashtags
            </p>
          </div>

          {/* Schedule */}
          <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-[#F97316]" />
              <h4 className="text-[#F8FAFC] text-sm font-medium">Schedule</h4>
            </div>
            <p className="text-[#94A3B8] text-xs">
              {activeDays.join(", ")} &middot; {postingStart} - {postingEnd} &middot;{" "}
              {timezone.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl bg-[#0A0F1C] border-[#1E293B] text-[#F8FAFC] max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-0 space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">
                Create New Agent
              </h2>
              <p className="text-[#94A3B8] text-sm">
                Step {step + 1} of {STEP_LABELS.length} &mdash;{" "}
                {STEP_LABELS[step]}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-1.5 bg-[#1E293B]" />

          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 pb-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                    ${i < step
                      ? "bg-[#10B981] text-white"
                      : i === step
                      ? "bg-[#3B82F6] text-white"
                      : "bg-[#1E293B] text-[#64748B]"
                    }
                  `}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      i < step ? "bg-[#10B981]" : "bg-[#1E293B]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}
          {step === 3 && renderStep4()}
          {step === 4 && renderStep5()}
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 border-t border-[#1E293B] flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={step === 0 ? onClose : handleBack}
            className="text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
          >
            {step === 0 ? (
              "Cancel"
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canContinue}
            className={`
              text-white font-medium px-6
              ${step === 4
                ? "bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:bg-[#3B82F6]/50"
                : "bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:bg-[#3B82F6]/50"
              }
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            {step === 4 ? (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Launch Agent
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
