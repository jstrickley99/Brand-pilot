"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  Search,
  PenTool,
  Hash,
  Image,
  Clock,
  Send,
  MessageCircle,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentType, AGENT_TYPE_META } from "@/lib/types";

// ---------------------------------------------------------------------------
// Icon mapping: resolve string icon names from AGENT_TYPE_META to components
// ---------------------------------------------------------------------------

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Search,
  PenTool,
  Hash,
  Image,
  Clock,
  Send,
  MessageCircle,
  BarChart3,
};

function getAgentIcon(iconName: string) {
  return iconMap[iconName] ?? Search;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AgentPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (agentType: AgentType) => void;
}

// ---------------------------------------------------------------------------
// AgentPicker Modal
// ---------------------------------------------------------------------------

export function AgentPicker({ open, onClose, onSelect }: AgentPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Focus trap: move focus into the panel when it opens
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  function handleSelect(agentType: AgentType) {
    onSelect(agentType);
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <>
      {/* Scoped keyframe animations */}
      <style>{`
        @keyframes agent-picker-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes agent-picker-panel-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "flex items-center justify-center",
        )}
        style={{ animation: "agent-picker-backdrop-in 200ms ease-out" }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Add Agent"
      >
        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          className={cn(
            "bg-[#111827] border border-[#1E293B] rounded-2xl p-6",
            "w-full max-w-lg mx-4 shadow-2xl",
            "outline-none",
          )}
          style={{ animation: "agent-picker-panel-in 200ms ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#F8FAFC]">Add Agent</h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Select an agent type to add to your pipeline
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                "text-[#64748B] hover:text-[#F8FAFC]",
                "hover:bg-[#1E293B] transition-colors",
              )}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Agent type grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {AGENT_TYPE_META.map((meta) => {
              const Icon = getAgentIcon(meta.iconName);

              return (
                <button
                  key={meta.type}
                  onClick={() => handleSelect(meta.type)}
                  className={cn(
                    "p-4 rounded-xl border border-[#1E293B] bg-[#0B0F19]",
                    "cursor-pointer transition-all duration-150 text-left group",
                  )}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${meta.accentColor}80`;
                    el.style.boxShadow = `0 10px 15px -3px ${meta.accentColor}0d, 0 4px 6px -4px ${meta.accentColor}0d`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = "";
                    el.style.boxShadow = "";
                  }}
                >
                  <Icon
                    className="h-6 w-6 mb-2"
                    style={{ color: meta.accentColor }}
                  />
                  <p className="text-sm font-medium text-[#F8FAFC]">
                    {meta.label}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {meta.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
