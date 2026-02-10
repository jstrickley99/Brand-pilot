"use client";

import Link from "next/link";
import {
  Bot,
  Zap,
  Pause,
  Play,
  Calendar,
  TrendingUp,
  Plus,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import type { Pipeline, AgentConfig } from "@/lib/types";

// ---------------------------------------------------------------------------
// Niche-based avatar colors
// ---------------------------------------------------------------------------

const NICHE_COLORS: Record<string, string> = {
  fitness: "#10B981",
  motivation: "#F97316",
  luxury: "#EAB308",
  memes: "#EC4899",
  tech: "#3B82F6",
  food: "#EF4444",
  travel: "#06B6D4",
  fashion: "#A855F7",
  custom: "#6366F1",
};

function getNicheColor(niche?: string): string {
  if (!niche) return "#3B82F6";
  return NICHE_COLORS[niche.toLowerCase()] ?? "#3B82F6";
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

type CardStatus = "active" | "paused" | "draft" | "setup";

function getStatusBadgeClasses(status: string): string {
  switch (status as CardStatus) {
    case "active":
      return "bg-green-400/10 text-green-400 border border-green-400/20";
    case "paused":
      return "bg-orange-400/10 text-orange-400 border border-orange-400/20";
    case "setup":
      return "bg-blue-400/10 text-blue-400 border border-blue-400/20";
    case "draft":
    default:
      return "bg-gray-400/10 text-gray-400 border border-gray-400/20";
  }
}

function getStatusIcon(status: string) {
  switch (status as CardStatus) {
    case "active":
      return <Play className="h-3 w-3" />;
    case "paused":
      return <Pause className="h-3 w-3" />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// AgentCard
// ---------------------------------------------------------------------------

interface AgentCardProps {
  pipeline: Pipeline;
}

export function AgentCard({ pipeline }: AgentCardProps) {
  const { agentConfig } = pipeline;
  const nicheColor = getNicheColor(agentConfig?.niche);

  return (
    <Link
      href={`/agents/${pipeline.id}`}
      className={cn(
        "rounded-xl border border-[#1E293B] bg-[#111827] p-5",
        "hover:border-[#3B82F6]/30 transition-all",
        "flex flex-col gap-3 cursor-pointer group",
      )}
    >
      {/* Top section: avatar, name, status */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${nicheColor}15` }}
        >
          <Bot className="h-5 w-5" style={{ color: nicheColor }} />
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#F8FAFC] truncate group-hover:text-[#3B82F6] transition-colors">
              {pipeline.name}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize shrink-0 flex items-center gap-1",
                getStatusBadgeClasses(pipeline.status),
              )}
            >
              {getStatusIcon(pipeline.status)}
              {pipeline.status}
            </span>
          </div>

          {/* Niche or Pipeline label */}
          {agentConfig ? (
            <span
              className="mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${nicheColor}15`,
                color: nicheColor,
              }}
            >
              {agentConfig.niche.charAt(0).toUpperCase() +
                agentConfig.niche.slice(1)}
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#64748B]">
              Pipeline
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {agentConfig ? (
        <AgentConfigDetails config={agentConfig} />
      ) : (
        <LegacyPipelineDetails pipeline={pipeline} />
      )}

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-[#1E293B]">
        <p className="text-[11px] text-[#64748B]">
          Edited {timeAgo(pipeline.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Agent config details (modern agent)
// ---------------------------------------------------------------------------

function AgentConfigDetails({ config }: { config: AgentConfig }) {
  const postsPerDay = config.contentStrategy.postsPerDay;
  const contentTypesCount = config.contentStrategy.contentTypes.length;
  const topicsCount = config.topics.length;
  const activeDaysCount = config.schedule.activeDays.length;
  const postingWindow = `${config.schedule.postingWindowStart} - ${config.schedule.postingWindowEnd}`;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Stats row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[#94A3B8]">
          <Zap className="h-3.5 w-3.5 text-[#F97316]" />
          <span className="text-xs">
            {postsPerDay}/day
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#94A3B8]">
          <TrendingUp className="h-3.5 w-3.5 text-[#3B82F6]" />
          <span className="text-xs">
            {contentTypesCount} {contentTypesCount === 1 ? "type" : "types"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#94A3B8]">
          <span className="text-xs text-[#64748B]">
            {topicsCount} {topicsCount === 1 ? "topic" : "topics"}
          </span>
        </div>
      </div>

      {/* Schedule row */}
      <div className="flex items-center gap-1.5 text-[#64748B]">
        <Calendar className="h-3.5 w-3.5" />
        <span className="text-xs">
          {activeDaysCount} {activeDaysCount === 1 ? "day" : "days"} &middot;{" "}
          {postingWindow}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legacy pipeline details (no agentConfig)
// ---------------------------------------------------------------------------

function LegacyPipelineDetails({ pipeline }: { pipeline: Pipeline }) {
  const nodeCount = pipeline.nodes.length;
  const connectionCount = pipeline.connections.length;

  return (
    <div className="flex items-center gap-3 text-[#94A3B8]">
      <span className="text-xs">
        {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
      </span>
      <span className="text-[#1E293B]">&middot;</span>
      <span className="text-xs">
        {connectionCount}{" "}
        {connectionCount === 1 ? "connection" : "connections"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NewAgentCard
// ---------------------------------------------------------------------------

interface NewAgentCardProps {
  onClick: () => void;
}

export function NewAgentCard({ onClick }: NewAgentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border-dashed border-2 border-[#1E293B] bg-[#111827]/50",
        "hover:border-[#3B82F6]/40 hover:bg-[#111827] transition-all",
        "flex flex-col items-center justify-center gap-3 p-6 cursor-pointer",
        "min-h-[220px]",
        "group",
      )}
    >
      <div className="h-12 w-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center group-hover:bg-[#3B82F6]/20 transition-colors">
        <Plus className="h-6 w-6 text-[#3B82F6]" />
      </div>
      <span className="text-sm font-medium text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors">
        New Agent
      </span>
    </button>
  );
}
