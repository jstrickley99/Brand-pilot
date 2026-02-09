"use client";

import type { NodeRunStatus } from "@/lib/types";

interface NodeConnectionProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  id: string;
  executionStatus?: "idle" | "active" | "complete";
}

export function NodeConnection({
  sourcePosition,
  targetPosition,
  id,
  executionStatus,
}: NodeConnectionProps) {
  const sx = sourcePosition.x;
  const sy = sourcePosition.y;
  const tx = targetPosition.x;
  const ty = targetPosition.y;

  const dx = Math.abs(tx - sx);
  const controlOffset = Math.max(dx * 0.4, 60);

  const path = `M ${sx} ${sy} C ${sx + controlOffset} ${sy}, ${tx - controlOffset} ${ty}, ${tx} ${ty}`;

  const pathLength = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));

  const isComplete = executionStatus === "complete";
  const isActive = executionStatus === "active";

  const strokeColor = isComplete ? "#10B981" : isActive ? "#3B82F6" : "#3B82F6";
  const glowOpacity = isActive ? 0.2 : isComplete ? 0.15 : 0.1;
  const mainOpacity = isComplete ? 0.8 : isActive ? 0.8 : 0.5;
  const strokeDash = isComplete ? "none" : "6 4";
  const pulseSpeed = isActive ? Math.max(pathLength / 300, 0.8) : Math.max(pathLength / 150, 1.5);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      {/* Shadow / glow path */}
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={isActive ? 6 : 4}
        fill="none"
        opacity={glowOpacity}
        strokeLinecap="round"
      />
      {/* Main path */}
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray={strokeDash}
        fill="none"
        opacity={mainOpacity}
        strokeLinecap="round"
      />
      {/* Animated pulse dot */}
      <circle
        r={isActive ? 4 : 3}
        fill={strokeColor}
        opacity={isActive ? 1 : 0.8}
      >
        <animateMotion
          dur={`${pulseSpeed}s`}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values={isActive ? "1;0.5;1" : "0.8;0.3;0.8"}
          dur={isActive ? "0.8s" : "1.5s"}
          repeatCount="indefinite"
        />
      </circle>
      <text className="sr-only">{id}</text>
    </svg>
  );
}
