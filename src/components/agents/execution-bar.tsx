"use client";

import { Square, RotateCcw, SkipForward, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineRun } from "@/lib/types";

interface ExecutionBarProps {
  run: PipelineRun;
  totalNodes: number;
  onStop: () => void;
  onRetry: () => void;
  onSkip: () => void;
  onBackToBuilder: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function ExecutionBar({
  run,
  totalNodes,
  onStop,
  onRetry,
  onSkip,
  onBackToBuilder,
}: ExecutionBarProps) {
  const completedCount = run.nodeRuns.filter(
    (nr) => nr.status === "complete" || nr.status === "skipped"
  ).length;
  const progressPercent = totalNodes > 0 ? (completedCount / totalNodes) * 100 : 0;
  const hasError = run.status === "error" || run.nodeRuns.some((nr) => nr.status === "error");
  const isStopped = run.status === "stopped";
  const isComplete = run.status === "completed";
  const isRunning = run.status === "running";

  const statusBadge = isComplete
    ? { label: "Run Complete", className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" }
    : isStopped
    ? { label: "Run Stopped", className: "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20" }
    : hasError
    ? { label: `Error`, className: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" }
    : { label: "Executing...", className: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20" };

  return (
    <div className="flex items-center gap-4 flex-1">
      {/* Status badge */}
      <span
        className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
          statusBadge.className,
          isRunning && "animate-pulse"
        )}
      >
        {statusBadge.label}
      </span>

      {/* Progress section */}
      <div className="flex items-center gap-3 flex-1 max-w-xs">
        <div className="flex-1">
          <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isComplete ? "bg-[#10B981]" : hasError ? "bg-[#EF4444]" : "bg-[#3B82F6]"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-[#94A3B8] whitespace-nowrap">
          {completedCount} of {totalNodes} agents
        </span>
      </div>

      {/* Elapsed time */}
      <span className="text-xs text-[#64748B] whitespace-nowrap">
        {formatDuration(run.duration)}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {isRunning && (
          <button
            onClick={onStop}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/20 transition-colors"
          >
            <Square className="w-3 h-3" />
            Stop
          </button>
        )}

        {hasError && !isRunning && (
          <>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 hover:bg-[#F97316]/20 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
            <button
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
            >
              <SkipForward className="w-3 h-3" />
              Skip
            </button>
          </>
        )}

        {(isComplete || isStopped) && (
          <button
            onClick={onBackToBuilder}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Builder
          </button>
        )}
      </div>
    </div>
  );
}
