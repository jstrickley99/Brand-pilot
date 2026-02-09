"use client";

interface NodeConnectionProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  id: string;
}

export function NodeConnection({
  sourcePosition,
  targetPosition,
  id,
}: NodeConnectionProps) {
  const sx = sourcePosition.x;
  const sy = sourcePosition.y;
  const tx = targetPosition.x;
  const ty = targetPosition.y;

  const dx = Math.abs(tx - sx);
  const controlOffset = Math.max(dx * 0.4, 60);

  const path = `M ${sx} ${sy} C ${sx + controlOffset} ${sy}, ${tx - controlOffset} ${ty}, ${tx} ${ty}`;

  // Calculate the total path length estimate for animation
  const pathLength = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      {/* Shadow / glow path */}
      <path
        d={path}
        stroke="#3B82F6"
        strokeWidth={4}
        fill="none"
        opacity={0.1}
        strokeLinecap="round"
      />
      {/* Main dashed path */}
      <path
        d={path}
        stroke="#3B82F6"
        strokeWidth={2}
        strokeDasharray="6 4"
        fill="none"
        opacity={0.5}
        strokeLinecap="round"
      />
      {/* Animated pulse dot */}
      <circle r={3} fill="#3B82F6" opacity={0.8}>
        <animateMotion
          dur={`${Math.max(pathLength / 150, 1.5)}s`}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Unique key for stable rendering */}
      <text className="sr-only">{id}</text>
    </svg>
  );
}
