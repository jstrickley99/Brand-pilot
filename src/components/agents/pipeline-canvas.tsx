"use client";

import { useState, useCallback, useRef } from "react";
import { Bot, Plus, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pipeline, AgentNode, PipelineConnection } from "@/lib/types";
import { CanvasNode } from "./canvas-node";
import { NodeConnection } from "./node-connection";

// Constants
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const NODE_WIDTH = 180;
const NODE_HEIGHT = 72;
const CONNECTOR_OFFSET_X = 6; // Half of connector width (3px w-3 -> 6px offset from edge)
const START_NODE_SIZE = 64; // w-16 = 64px

interface PipelineCanvasProps {
  pipeline: Pipeline;
  nodes: AgentNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onNodePositionChange: (nodeId: string, position: { x: number; y: number }) => void;
  onAddNode: () => void;
}

export function PipelineCanvas({
  pipeline,
  nodes,
  selectedNodeId,
  onSelectNode,
  onNodePositionChange,
  onAddNode,
}: PipelineCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Deselect node when clicking on empty canvas
  const handleCanvasClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  // Pan: mouse down on canvas background
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only pan on direct canvas background clicks (left button)
      if (e.button !== 0) return;
      if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.canvasBg) return;

      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { x: pan.x, y: pan.y };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isPanning.current) return;
        const dx = moveEvent.clientX - panStart.current.x;
        const dy = moveEvent.clientY - panStart.current.y;
        setPan({
          x: panOrigin.current.x + dx,
          y: panOrigin.current.y + dy,
        });
      };

      const handleMouseUp = () => {
        isPanning.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [pan.x, pan.y]
  );

  // Zoom: mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => {
      const direction = e.deltaY < 0 ? 1 : -1;
      const next = prev + direction * ZOOM_STEP;
      return Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)) * 100) / 100;
    });
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 100) / 100));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 100) / 100));
  }, []);

  // Fit to screen: center all nodes in viewport
  const fitToScreen = useCallback(() => {
    if (!canvasRef.current || nodes.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    const container = canvasRef.current;
    const rect = container.getBoundingClientRect();

    // Include start node at (100, center)
    const startX = 100;
    const startY = rect.height / 2 - START_NODE_SIZE / 2;

    let minX = startX;
    let minY = startY;
    let maxX = startX + START_NODE_SIZE;
    let maxY = startY + START_NODE_SIZE;

    for (const node of nodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + NODE_WIDTH);
      maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
    }

    const contentWidth = maxX - minX + 100; // padding
    const contentHeight = maxY - minY + 100;

    const scaleX = rect.width / contentWidth;
    const scaleY = rect.height / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.85, MIN_ZOOM), MAX_ZOOM);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setPan({
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom,
    });
    setZoom(Math.round(newZoom * 100) / 100);
  }, [nodes]);

  // Compute connection positions
  const getConnectionPositions = useCallback(
    (connection: PipelineConnection) => {
      const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId);
      const targetNode = nodes.find((n) => n.id === connection.targetNodeId);

      if (!sourceNode || !targetNode) return null;

      return {
        source: {
          x: sourceNode.position.x + NODE_WIDTH + CONNECTOR_OFFSET_X,
          y: sourceNode.position.y + NODE_HEIGHT / 2,
        },
        target: {
          x: targetNode.position.x - CONNECTOR_OFFSET_X,
          y: targetNode.position.y + NODE_HEIGHT / 2,
        },
      };
    },
    [nodes]
  );

  // Compute start node connection to first node
  const getStartConnectionTarget = useCallback(() => {
    if (nodes.length === 0) return null;

    // Find node(s) that are not targets of any connection (root nodes)
    const targetIds = new Set(pipeline.connections.map((c) => c.targetNodeId));
    const rootNodes = nodes.filter((n) => !targetIds.has(n.id));
    const firstNode = rootNodes.length > 0 ? rootNodes[0] : nodes[0];

    return firstNode;
  }, [nodes, pipeline.connections]);

  // Calculate container dimensions
  const containerHeight = "h-[calc(100vh-140px)]";

  // Start node position
  const canvasHeight = canvasRef.current?.getBoundingClientRect().height ?? 600;
  const startNodeY = canvasHeight / 2 - START_NODE_SIZE / 2;
  const startNodeX = 100;

  return (
    <div
      ref={canvasRef}
      className={cn(
        containerHeight,
        "relative overflow-hidden rounded-xl border border-[#1E293B] select-none"
      )}
      style={{
        backgroundColor: "#0B0F19",
        backgroundImage: "radial-gradient(circle, #1E293B 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onClick={handleCanvasClick}
    >
      {/* Transform wrapper for pan + zoom */}
      <div
        data-canvas-bg="true"
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Start node */}
        <div
          className="absolute flex flex-col items-center gap-2"
          style={{
            left: startNodeX,
            top: startNodeY,
          }}
        >
          <div className="w-16 h-16 border-dashed border-2 border-[#3B82F6]/50 rounded-full flex items-center justify-center bg-[#3B82F6]/5">
            <Bot className="w-6 h-6 text-[#3B82F6]/70" />
          </div>
          <span className="text-xs text-[#64748B] font-medium">Start</span>
        </div>

        {/* Start node connection to first root node */}
        {(() => {
          const firstNode = getStartConnectionTarget();
          if (!firstNode) return null;

          return (
            <NodeConnection
              id="start-connection"
              sourcePosition={{
                x: startNodeX + START_NODE_SIZE,
                y: startNodeY + START_NODE_SIZE / 2,
              }}
              targetPosition={{
                x: firstNode.position.x - CONNECTOR_OFFSET_X,
                y: firstNode.position.y + NODE_HEIGHT / 2,
              }}
            />
          );
        })()}

        {/* Connections between nodes */}
        {pipeline.connections.map((connection) => {
          const positions = getConnectionPositions(connection);
          if (!positions) return null;

          return (
            <NodeConnection
              key={connection.id}
              id={connection.id}
              sourcePosition={positions.source}
              targetPosition={positions.target}
            />
          );
        })}

        {/* Agent nodes */}
        {nodes.map((node) => (
          <CanvasNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onPositionChange={onNodePositionChange}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Zoom controls - bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#111827] border border-[#1E293B] rounded-lg p-1 shadow-lg">
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="w-14 text-center text-xs font-medium text-[#94A3B8] tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-[#1E293B] mx-0.5" />
        <button
          onClick={fitToScreen}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          title="Fit to screen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Add node FAB - bottom right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddNode();
        }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg shadow-[#3B82F6]/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Add agent node"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#1E293B]/50 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-[#64748B]" />
            </div>
            <p className="text-[#94A3B8] text-sm font-medium mb-1">
              No agents in this pipeline yet
            </p>
            <p className="text-[#64748B] text-xs">
              Click the + button to add your first agent
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
