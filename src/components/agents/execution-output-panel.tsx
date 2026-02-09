"use client";

import { useEffect, useRef } from "react";
import {
  X,
  Search,
  PenTool,
  Image,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentNode, NodeRun, NodeRunStatus } from "@/lib/types";
import { AGENT_TYPE_META } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Search, PenTool, Image, Clock, Send,
};

interface ExecutionOutputPanelProps {
  node: AgentNode;
  nodeRun: NodeRun | null;
  streamingText: string;
  onClose: () => void;
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "--";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

const statusConfig: Record<NodeRunStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  idle: { label: "Waiting", className: "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20", icon: Clock },
  running: { label: "Running", className: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20", icon: Loader2 },
  complete: { label: "Complete", className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20", icon: CheckCircle2 },
  error: { label: "Error", className: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20", icon: XCircle },
  cancelled: { label: "Cancelled", className: "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20", icon: XCircle },
  skipped: { label: "Skipped", className: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20", icon: SkipForward },
};

export function ExecutionOutputPanel({
  node,
  nodeRun,
  streamingText,
  onClose,
}: ExecutionOutputPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  const meta = AGENT_TYPE_META.find((m) => m.type === node.type);
  const IconComponent = meta ? iconMap[meta.iconName] : Search;
  const accentColor = meta?.accentColor ?? "#3B82F6";

  const status = nodeRun?.status ?? "idle";
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamingText, nodeRun?.output]);

  // Determine which text to display
  const displayLines = status === "running" && streamingText
    ? streamingText.split("\n")
    : nodeRun?.output ?? [];

  return (
    <div
      className="fixed top-[68px] right-0 bottom-0 w-[400px] bg-[#111827] border-l border-[#1E293B] z-30 flex flex-col"
      style={{ animation: "exec-panel-slide-in 200ms ease-out" }}
    >
      <style>{`
        @keyframes exec-panel-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            {IconComponent && (
              <IconComponent className="w-4.5 h-4.5" style={{ color: accentColor }} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">{node.name}</p>
            <p className="text-xs text-[#64748B]">{meta?.label ?? node.type}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]/50">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("w-4 h-4", status === "running" && "animate-spin")} />
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", config.className)}>
            {config.label}
          </span>
        </div>
        <span className="text-xs text-[#64748B]">
          {formatDuration(nodeRun?.duration ?? null)}
        </span>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-2">
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Output</p>
        </div>
        <div
          ref={outputRef}
          className="flex-1 overflow-y-auto mx-4 mb-3 rounded-lg bg-[#0B0F19] border border-[#1E293B] p-3 font-mono text-xs leading-relaxed"
        >
          {displayLines.length === 0 ? (
            <p className="text-[#475569] italic">
              {status === "idle" ? "Waiting for execution..." : "No output yet"}
            </p>
          ) : (
            displayLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "py-0.5",
                  i === displayLines.length - 1 && status === "running"
                    ? "text-[#F8FAFC]"
                    : "text-[#94A3B8]"
                )}
              >
                <span className="text-[#475569] select-none mr-2">{String(i + 1).padStart(2, "0")}</span>
                {line}
              </div>
            ))
          )}
          {status === "running" && (
            <div className="py-0.5 text-[#3B82F6]">
              <span className="inline-block w-1.5 h-3.5 bg-[#3B82F6] animate-pulse" />
            </div>
          )}
        </div>

        {/* Result preview */}
        {nodeRun?.result && status === "complete" && (
          <div className="mx-4 mb-4">
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-2">Result</p>
            <div className="rounded-lg bg-[#10B981]/5 border border-[#10B981]/20 p-3">
              <p className="text-sm text-[#F8FAFC] whitespace-pre-wrap leading-relaxed">
                {nodeRun.result}
              </p>
            </div>
          </div>
        )}

        {/* Error display */}
        {nodeRun?.error && (
          <div className="mx-4 mb-4">
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-2">Error</p>
            <div className="rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/20 p-3">
              <p className="text-sm text-[#EF4444]">{nodeRun.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
