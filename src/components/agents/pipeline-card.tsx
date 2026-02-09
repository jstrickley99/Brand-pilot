"use client";

import Link from "next/link";
import {
  Search,
  PenTool,
  Hash,
  Image,
  Clock,
  Send,
  MessageCircle,
  BarChart3,
  Plus,
  Workflow,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";
import { Pipeline, AGENT_TYPE_META, AgentType } from "@/lib/types";
import { mockAccounts } from "@/lib/mock-data";

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

function getAgentMeta(type: AgentType) {
  return AGENT_TYPE_META.find((m) => m.type === type);
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function getStatusBadgeClasses(status: Pipeline["status"]): string {
  switch (status) {
    case "active":
      return "bg-green-400/10 text-green-400 border border-green-400/20";
    case "paused":
      return "bg-orange-400/10 text-orange-400 border border-orange-400/20";
    case "draft":
    default:
      return "bg-gray-400/10 text-gray-400 border border-gray-400/20";
  }
}

// ---------------------------------------------------------------------------
// PipelineCard
// ---------------------------------------------------------------------------

interface PipelineCardProps {
  pipeline: Pipeline;
}

export function PipelineCard({ pipeline }: PipelineCardProps) {
  const assignedAccounts = mockAccounts.filter((a) =>
    pipeline.assignedAccountIds.includes(a.id),
  );

  return (
    <Link
      href={`/agents/${pipeline.id}`}
      className={cn(
        "rounded-xl border border-[#1E293B] bg-[#111827] p-6",
        "hover:border-[#3B82F6]/30 transition-all",
        "flex flex-col gap-4 cursor-pointer group",
      )}
    >
      {/* Header: name + status */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#3B82F6] transition-colors">
          {pipeline.name}
        </h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs capitalize shrink-0",
            getStatusBadgeClasses(pipeline.status),
          )}
        >
          {pipeline.status}
        </span>
      </div>

      {/* Node count + agent type icons */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#94A3B8]">
          <Workflow className="h-4 w-4" />
          <span className="text-sm">
            {pipeline.nodes.length} {pipeline.nodes.length === 1 ? "node" : "nodes"}
          </span>
        </div>

        <div className="flex items-center -space-x-1">
          {pipeline.nodes.map((node) => {
            const meta = getAgentMeta(node.type);
            if (!meta) return null;
            const Icon = getAgentIcon(meta.iconName);
            return (
              <div
                key={node.id}
                className="h-6 w-6 rounded-full flex items-center justify-center border border-[#1E293B] bg-[#0B0F19]"
                title={meta.label}
              >
                <Icon
                  className="h-3 w-3"
                  style={{ color: meta.accentColor }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned accounts */}
      <div className="flex items-center gap-2">
        {assignedAccounts.length > 0 ? (
          <>
            <Users className="h-4 w-4 text-[#64748B]" />
            <div className="flex items-center -space-x-2">
              {assignedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center border-2 border-[#111827] text-[10px] font-bold text-white"
                  title={account.handle}
                >
                  {account.handle.replace("@", "").charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-sm text-[#94A3B8]">
              {assignedAccounts.map((a) => a.handle).join(", ")}
            </span>
          </>
        ) : (
          <span className="text-sm text-[#64748B]">No accounts assigned</span>
        )}
      </div>

      {/* Footer: last edited */}
      <div className="mt-auto pt-2 border-t border-[#1E293B]">
        <p className="text-xs text-[#64748B]">
          Edited {timeAgo(pipeline.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// NewPipelineCard
// ---------------------------------------------------------------------------

interface NewPipelineCardProps {
  onCreatePipeline: () => void;
}

export function NewPipelineCard({ onCreatePipeline }: NewPipelineCardProps) {
  return (
    <button
      onClick={onCreatePipeline}
      className={cn(
        "rounded-xl border-dashed border-2 border-[#1E293B] bg-[#111827]/50",
        "hover:border-[#3B82F6]/40 hover:bg-[#111827] transition-all",
        "flex flex-col items-center justify-center gap-3 p-6 cursor-pointer",
        "min-h-[232px]",
        "group",
      )}
    >
      <div className="h-12 w-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center group-hover:bg-[#3B82F6]/20 transition-colors">
        <Plus className="h-6 w-6 text-[#3B82F6]" />
      </div>
      <span className="text-sm font-medium text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors">
        New Pipeline
      </span>
    </button>
  );
}
