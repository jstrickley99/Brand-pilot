"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  PenTool,
  Image,
  Clock,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ImageIcon,
  Layers,
  Film,
  Video,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentType, AGENT_TYPE_META } from "@/lib/types";

// ---------------------------------------------------------------------------
// Icon mapping for agent nodes
// ---------------------------------------------------------------------------

const agentIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Search,
  PenTool,
  Image,
  Clock,
  Send,
};

// ---------------------------------------------------------------------------
// Content type definitions
// ---------------------------------------------------------------------------

export type AgentContentType = "single_image" | "carousel" | "short_video" | "long_video" | "text_only";

interface ContentTypeOption {
  type: AgentContentType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  { type: "single_image", label: "Single Image", description: "Post with one image", icon: ImageIcon },
  { type: "carousel", label: "Carousel", description: "Multiple images / slides", icon: Layers },
  { type: "short_video", label: "Short Video", description: "Reels, TikToks (< 60s)", icon: Film },
  { type: "long_video", label: "Long Video", description: "YouTube / long form", icon: Video },
  { type: "text_only", label: "Text Only", description: "Text posts / tweets", icon: FileText },
];

// Which agents are available per content type
const CONTENT_TYPE_AGENTS: Record<AgentContentType, AgentType[]> = {
  single_image: ["content_researcher", "content_writer", "media_creator", "scheduler", "publisher"],
  carousel: ["content_researcher", "content_writer", "media_creator", "scheduler", "publisher"],
  short_video: ["content_researcher", "content_writer", "media_creator", "scheduler", "publisher"],
  long_video: ["content_researcher", "content_writer", "media_creator", "scheduler", "publisher"],
  text_only: ["content_researcher", "content_writer", "scheduler", "publisher"],
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AgentPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (agentType: AgentType) => void;
}

// ---------------------------------------------------------------------------
// AgentPicker – 2-step wizard
// ---------------------------------------------------------------------------

export function AgentPicker({ open, onClose, onSelect }: AgentPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedContentType, setSelectedContentType] = useState<AgentContentType | null>(null);

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedContentType(null);
    }
  }, [open]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  // Focus trap
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  function handleContentTypeSelect(ct: AgentContentType) {
    setSelectedContentType(ct);
  }

  function handleContinue() {
    if (step === 1 && selectedContentType) {
      setStep(2);
    }
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  }

  function handleAgentSelect(agentType: AgentType) {
    onSelect(agentType);
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Filtered agents for step 2
  const availableAgents = selectedContentType
    ? AGENT_TYPE_META.filter((m) => CONTENT_TYPE_AGENTS[selectedContentType].includes(m.type))
    : [];

  return (
    <>
      <style>{`
        @keyframes ap-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ap-panel-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "flex items-center justify-center",
        )}
        style={{ animation: "ap-backdrop-in 200ms ease-out" }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Create New Agent"
      >
        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          className={cn(
            "bg-[#111827] border border-[#1E293B] rounded-2xl",
            "w-full max-w-[520px] mx-4 shadow-2xl",
            "outline-none flex flex-col",
          )}
          style={{ animation: "ap-panel-in 200ms ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F8FAFC]">Create New Agent</h2>
                <p className="text-xs text-[#64748B]">Step {step} of 2</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              <div className={cn("w-6 h-1.5 rounded-full transition-colors", step >= 1 ? "bg-[#3B82F6]" : "bg-[#1E293B]")} />
              <div className={cn("w-6 h-1.5 rounded-full transition-colors", step >= 2 ? "bg-[#3B82F6]" : "bg-[#1E293B]")} />
            </div>
          </div>

          {/* Step content */}
          <div className="px-6 pb-2">
            {step === 1 && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[#F8FAFC]">Content Type</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">What kind of content will this agent create?</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {CONTENT_TYPE_OPTIONS.map((opt) => {
                    const isActive = selectedContentType === opt.type;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => handleContentTypeSelect(opt.type)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left",
                          isActive
                            ? "border-[#3B82F6] bg-[#3B82F6]/5"
                            : "border-[#1E293B] bg-[#0B0F19] hover:border-[#334155]",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            isActive ? "bg-[#3B82F6]/15" : "bg-[#1E293B]",
                          )}
                        >
                          <Icon className={cn("w-5 h-5", isActive ? "text-[#3B82F6]" : "text-[#64748B]")} />
                        </div>
                        <div>
                          <p className={cn("text-sm font-medium", isActive ? "text-[#F8FAFC]" : "text-[#CBD5E1]")}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-[#64748B] mt-0.5">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[#F8FAFC]">Select Agent</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Choose an agent for{" "}
                    <span className="text-[#94A3B8]">
                      {CONTENT_TYPE_OPTIONS.find((o) => o.type === selectedContentType)?.label}
                    </span>{" "}
                    content
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {availableAgents.map((meta) => {
                    const Icon = agentIconMap[meta.iconName] ?? Search;
                    return (
                      <button
                        key={meta.type}
                        onClick={() => handleAgentSelect(meta.type)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border border-[#1E293B] bg-[#0B0F19]",
                          "hover:border-[#334155] transition-all duration-150 text-left group",
                        )}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${meta.accentColor}80`;
                          e.currentTarget.style.boxShadow = `0 0 0 1px ${meta.accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${meta.accentColor}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: meta.accentColor }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#CBD5E1] group-hover:text-[#F8FAFC] transition-colors">
                            {meta.label}
                          </p>
                          <p className="text-xs text-[#64748B] mt-0.5">{meta.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 mt-2 border-t border-[#1E293B]">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step === 1 && (
              <button
                onClick={handleContinue}
                disabled={!selectedContentType}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium px-5 py-2 rounded-lg transition-all",
                  selectedContentType
                    ? "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                    : "bg-[#1E293B] text-[#475569] cursor-not-allowed",
                )}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
