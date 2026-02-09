"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Trash2,
  ChevronDown,
  Search,
  PenTool,
  Image,
  Clock,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AGENT_TYPE_META,
  type AgentNode,
  type AgentType,
  type AgentNodeConfig,
  type AutonomyLevel,
  type ContentResearcherConfig as ContentResearcherConfigType,
  type ContentWriterConfig as ContentWriterConfigType,
  type MediaCreatorConfig as MediaCreatorConfigType,
  type SchedulerConfig as SchedulerConfigType,
  type PublisherConfig as PublisherConfigType,
} from "@/lib/types";

import { AutonomyConfig } from "./config-sections/autonomy-config";
import { ContentResearcherConfig } from "./config-sections/content-researcher-config";
import { ContentWriterConfig } from "./config-sections/content-writer-config";
import { MediaCreatorConfig } from "./config-sections/media-creator-config";
import { SchedulerConfig } from "./config-sections/scheduler-config";
import { PublisherConfig } from "./config-sections/publisher-config";

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Search,
  PenTool,
  Image,
  Clock,
  Send,
};

function getAgentIcon(iconName: string) {
  return iconMap[iconName] ?? Search;
}

// ---------------------------------------------------------------------------
// Section config label mapping
// ---------------------------------------------------------------------------

const SECTION_LABELS: Record<AgentType, string> = {
  content_researcher: "Research Settings",
  content_writer: "Writer Settings",
  hashtag_generator: "Hashtag Settings",
  media_creator: "Media Settings",
  scheduler: "Schedule Settings",
  publisher: "Publisher Settings",
  engagement_bot: "Engagement Settings",
  analytics_monitor: "Analytics Settings",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConfigPanelProps {
  node: AgentNode;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: Partial<AgentNode>) => void;
  onDelete: (nodeId: string) => void;
}

// ---------------------------------------------------------------------------
// ConfigPanel
// ---------------------------------------------------------------------------

export function ConfigPanel({
  node,
  onClose,
  onUpdate,
  onDelete,
}: ConfigPanelProps) {
  const [visible, setVisible] = useState(false);
  const [autonomySectionOpen, setAutonomySectionOpen] = useState(true);
  const [configSectionOpen, setConfigSectionOpen] = useState(true);
  const [editingName, setEditingName] = useState(node.name);

  const meta = AGENT_TYPE_META.find((m) => m.type === node.type);
  const Icon = meta ? getAgentIcon(meta.iconName) : Search;
  const accentColor = meta?.accentColor ?? "#3B82F6";

  // Slide-in animation on mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Sync editingName when node changes
  useEffect(() => {
    setEditingName(node.name);
  }, [node.name]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleClose() {
    setVisible(false);
    // Wait for slide-out animation to finish
    setTimeout(onClose, 300);
  }

  function handleNameBlur() {
    const trimmed = editingName.trim();
    if (trimmed && trimmed !== node.name) {
      onUpdate(node.id, { name: trimmed });
    } else {
      setEditingName(node.name);
    }
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleAutonomyChange(level: AutonomyLevel) {
    onUpdate(node.id, { autonomyLevel: level });
  }

  function handleActiveChange(active: boolean) {
    onUpdate(node.id, { isActive: active });
  }

  function handleConfigChange(config: AgentNodeConfig) {
    onUpdate(node.id, { config, status: "configured" });
  }

  function handleDelete() {
    handleClose();
    // Use a small delay so the panel slides out before removal
    setTimeout(() => onDelete(node.id), 50);
  }

  // ---------------------------------------------------------------------------
  // Render the agent-type-specific config section
  // ---------------------------------------------------------------------------

  function renderAgentConfig() {
    switch (node.type) {
      case "content_researcher":
        return (
          <ContentResearcherConfig
            config={node.config as ContentResearcherConfigType | null}
            onChange={handleConfigChange}
          />
        );
      case "content_writer":
        return (
          <ContentWriterConfig
            config={node.config as ContentWriterConfigType | null}
            onChange={handleConfigChange}
          />
        );
      case "media_creator":
        return (
          <MediaCreatorConfig
            config={node.config as MediaCreatorConfigType | null}
            onChange={handleConfigChange}
          />
        );
      case "scheduler":
        return (
          <SchedulerConfig
            config={node.config as SchedulerConfigType | null}
            onChange={handleConfigChange}
          />
        );
      case "publisher":
        return (
          <PublisherConfig
            config={node.config as PublisherConfigType | null}
            onChange={handleConfigChange}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-20 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-30 h-screen w-[400px] bg-[#111827] border-l border-[#1E293B] shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ---- Header ---- */}
        <div className="shrink-0 border-b border-[#1E293B] px-6 py-5">
          <div className="flex items-start justify-between">
            {/* Agent type icon + label */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: accentColor }}
                />
              </div>
              <div>
                <span
                  className="text-xs font-medium"
                  style={{ color: accentColor }}
                >
                  {meta?.label ?? node.type}
                </span>
                {/* Editable name */}
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className={cn(
                    "block w-full bg-transparent text-base font-semibold text-[#F8FAFC]",
                    "border-b border-transparent focus:border-[#3B82F6] focus:outline-none",
                    "transition-colors py-0.5 -ml-px"
                  )}
                />
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                "text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
              )}
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className={cn(
              "mt-3 flex items-center gap-1.5 text-xs",
              "text-[#64748B] hover:text-red-400 transition-colors"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Agent
          </button>
        </div>

        {/* ---- Scrollable content ---- */}
        <div className="flex-1 overflow-y-auto">
          {/* Autonomy Config (shared) */}
          <AutonomyConfig
            autonomyLevel={node.autonomyLevel}
            isActive={node.isActive}
            onChange={handleAutonomyChange}
            onActiveChange={handleActiveChange}
          />

          {/* Autonomy Section (collapsible) */}
          <div className="border-b border-[#1E293B]">
            <button
              onClick={() => setAutonomySectionOpen(!autonomySectionOpen)}
              className="flex items-center justify-between w-full px-6 py-4"
            >
              <span className="text-sm font-medium text-[#F8FAFC]">
                General Settings
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[#64748B] transition-transform",
                  autonomySectionOpen && "rotate-180"
                )}
              />
            </button>
            {autonomySectionOpen && (
              <div className="px-6 pb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          node.status === "configured"
                            ? "bg-[#10B981]"
                            : node.status === "error"
                            ? "bg-red-400"
                            : "bg-[#64748B]"
                        )}
                      />
                      <span className="text-sm text-[#F8FAFC] capitalize">
                        {node.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                      Node ID
                    </label>
                    <span className="text-xs text-[#64748B] font-mono">
                      {node.id}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Agent-specific config section (collapsible) */}
          <div className="border-b border-[#1E293B]">
            <button
              onClick={() => setConfigSectionOpen(!configSectionOpen)}
              className="flex items-center justify-between w-full px-6 py-4"
            >
              <span className="text-sm font-medium text-[#F8FAFC]">
                {SECTION_LABELS[node.type]}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[#64748B] transition-transform",
                  configSectionOpen && "rotate-180"
                )}
              />
            </button>
            {configSectionOpen && (
              <div className="px-6 pb-6">{renderAgentConfig()}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
