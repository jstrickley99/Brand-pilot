"use client";

import { useCallback, useRef } from "react";
import {
  Search,
  PenTool,
  Image,
  Clock,
  Send,
  Hash,
  MessageCircle,
  BarChart3,
  Check,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentNode, AgentNodeStatus, NodeRunStatus } from "@/lib/types";
import { AGENT_TYPE_META as agentTypeMeta } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Search,
  PenTool,
  Image,
  Clock,
  Send,
  Hash,
  MessageCircle,
  BarChart3,
};

const statusColors: Record<AgentNodeStatus, string> = {
  unconfigured: "#F97316",
  configured: "#10B981",
  error: "#EF4444",
};

const statusLabels: Record<AgentNodeStatus, string> = {
  unconfigured: "Setup needed",
  configured: "Ready",
  error: "Error",
};

interface CanvasNodeProps {
  node: AgentNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onPositionChange: (nodeId: string, position: { x: number; y: number }) => void;
  zoom: number;
  executionStatus?: NodeRunStatus;
  isExecutionMode?: boolean;
}

export function CanvasNode({
  node,
  isSelected,
  onSelect,
  onPositionChange,
  zoom,
  executionStatus,
  isExecutionMode = false,
}: CanvasNodeProps) {
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const nodeStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const meta = agentTypeMeta.find((m) => m.type === node.type);
  const IconComponent = meta ? iconMap[meta.iconName] : Search;
  const accentColor = meta?.accentColor ?? "#3B82F6";

  // Execution status visual overrides
  const isRunning = executionStatus === "running";
  const isComplete = executionStatus === "complete";
  const isError = executionStatus === "error";
  const isCancelled = executionStatus === "cancelled";
  const isSkipped = executionStatus === "skipped";

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isExecutionMode) return;
      if ((e.target as HTMLElement).dataset.connector) return;

      e.stopPropagation();
      isDragging.current = true;
      hasMoved.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      nodeStart.current = { x: node.position.x, y: node.position.y };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = (moveEvent.clientX - dragStart.current.x) / zoom;
        const dy = (moveEvent.clientY - dragStart.current.y) / zoom;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          hasMoved.current = true;
        }

        onPositionChange(node.id, {
          x: nodeStart.current.x + dx,
          y: nodeStart.current.y + dy,
        });
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [node.id, node.position.x, node.position.y, onPositionChange, zoom, isExecutionMode]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!hasMoved.current || isExecutionMode) {
        e.stopPropagation();
        onSelect(node.id);
      }
    },
    [node.id, onSelect, isExecutionMode]
  );

  // Determine border style
  const borderClass = isRunning
    ? "border-[#3B82F6] shadow-lg shadow-[#3B82F6]/20"
    : isComplete
    ? "border-[#10B981] shadow-lg shadow-[#10B981]/10"
    : isError
    ? "border-[#EF4444] shadow-lg shadow-[#EF4444]/10"
    : isSelected
    ? "border-[#3B82F6] shadow-lg shadow-[#3B82F6]/10"
    : "border-[#1E293B] hover:border-[#475569] hover:shadow-lg hover:shadow-black/20";

  // Status dot rendering
  const renderStatusDot = () => {
    if (isExecutionMode && executionStatus) {
      if (isRunning) {
        return (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-[#3B82F6] animate-spin" />
          </div>
        );
      }
      if (isComplete) {
        return (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        );
      }
      if (isError) {
        return (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </div>
        );
      }
      if (isCancelled || isSkipped) {
        return (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111827] bg-[#94A3B8]" />
        );
      }
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111827] bg-[#475569]" />
      );
    }

    return (
      <div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111827]"
        style={{ backgroundColor: statusColors[node.status] }}
        title={node.status}
      />
    );
  };

  return (
    <div
      className={cn(
        "absolute group bg-[#111827] border-2 rounded-xl w-[260px] transition-all duration-150 select-none",
        isExecutionMode ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        borderClass,
        isRunning && "exec-node-pulse",
        isError && "exec-node-shake"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <style>{`
        @keyframes exec-node-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.15); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }
        @keyframes exec-node-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        .exec-node-pulse { animation: exec-node-pulse 2s ease-in-out infinite; }
        .exec-node-shake { animation: exec-node-shake 0.4s ease-in-out; }
      `}</style>

      {/* Status dot */}
      {renderStatusDot()}

      {/* Input connector */}
      <div
        data-connector="input"
        className={cn(
          "absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0B0F19] transition-transform",
          isComplete ? "bg-[#10B981]" : isRunning ? "bg-[#3B82F6]" : "bg-[#3B82F6]",
          !isExecutionMode && "hover:scale-150"
        )}
      />

      {/* Output connector */}
      <div
        data-connector="output"
        className={cn(
          "absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0B0F19] transition-transform",
          isComplete ? "bg-[#10B981]" : isRunning ? "bg-[#3B82F6]" : "bg-[#3B82F6]",
          !isExecutionMode && "hover:scale-150"
        )}
      />

      {/* Top section: icon + name + accent bar */}
      <div
        className="flex items-center gap-3 px-4 pt-3.5 pb-2"
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          {IconComponent && (
            <IconComponent
              className="w-5 h-5"
              style={{ color: accentColor }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#F8FAFC] truncate">
            {node.name}
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {meta?.label ?? node.type}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#475569] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>

      {/* Description */}
      {meta?.description && (
        <p className="text-[11px] text-[#94A3B8] leading-relaxed px-4 pb-1 line-clamp-2">
          {meta.description}
        </p>
      )}

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-4 py-2 mt-1 border-t border-[#1E293B]/60">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusColors[node.status] }}
          />
          <span
            className="text-[10px] font-medium"
            style={{ color: statusColors[node.status] }}
          >
            {statusLabels[node.status]}
          </span>
        </div>
        <span className="text-[10px] text-[#475569] group-hover:text-[#64748B] transition-colors">
          Click to configure
        </span>
      </div>
    </div>
  );
}
