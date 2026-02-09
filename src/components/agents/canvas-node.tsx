"use client";

import { useCallback, useRef } from "react";
import {
  Search,
  PenTool,
  Hash,
  Image,
  Clock,
  Send,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentNode, AgentNodeStatus } from "@/lib/types";
import { AGENT_TYPE_META as agentTypeMeta } from "@/lib/types";

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

const statusColors: Record<AgentNodeStatus, string> = {
  unconfigured: "#F97316",
  configured: "#10B981",
  error: "#EF4444",
};

interface CanvasNodeProps {
  node: AgentNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onPositionChange: (nodeId: string, position: { x: number; y: number }) => void;
  zoom: number;
}

export function CanvasNode({
  node,
  isSelected,
  onSelect,
  onPositionChange,
  zoom,
}: CanvasNodeProps) {
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const nodeStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const meta = agentTypeMeta.find((m) => m.type === node.type);
  const IconComponent = meta ? iconMap[meta.iconName] : Search;
  const accentColor = meta?.accentColor ?? "#3B82F6";

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Prevent triggering on connector clicks
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
    [node.id, node.position.x, node.position.y, onPositionChange, zoom]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only fire select if we did not drag
      if (!hasMoved.current) {
        e.stopPropagation();
        onSelect(node.id);
      }
    },
    [node.id, onSelect]
  );

  return (
    <div
      className={cn(
        "absolute group bg-[#111827] border rounded-xl p-4 min-w-[180px] cursor-grab active:cursor-grabbing transition-shadow duration-150 select-none",
        isSelected
          ? "border-[#3B82F6] shadow-lg shadow-[#3B82F6]/10"
          : "border-[#1E293B] hover:border-[#334155]"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Status dot - top right */}
      <div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111827]"
        style={{ backgroundColor: statusColors[node.status] }}
        title={node.status}
      />

      {/* Input connector - left edge */}
      <div
        data-connector="input"
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#3B82F6] rounded-full border-2 border-[#0B0F19] hover:scale-125 transition-transform"
      />

      {/* Output connector - right edge */}
      <div
        data-connector="output"
        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#3B82F6] rounded-full border-2 border-[#0B0F19] hover:scale-125 transition-transform"
      />

      {/* Node content */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {IconComponent && (
            <IconComponent
              className="w-4.5 h-4.5"
              style={{ color: accentColor }}
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#F8FAFC] truncate max-w-[140px]">
            {node.name}
          </p>
          <p className="text-xs text-[#64748B] mt-0.5">
            {meta?.label ?? node.type}
          </p>
        </div>
      </div>
    </div>
  );
}
