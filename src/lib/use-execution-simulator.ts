"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentNode, AgentType, PipelineConnection, PipelineRun, NodeRun, NodeRunStatus, PipelineRunStatus } from "./types";

// ---------------------------------------------------------------------------
// Mock output data per agent type
// ---------------------------------------------------------------------------

const MOCK_OUTPUTS: Record<AgentType, { lines: string[]; result: string }> = {
  content_researcher: {
    lines: [
      "Initializing trend analysis engine...",
      "Scanning Instagram Explore feed...",
      "Analyzing competitor accounts...",
      "Found 14 trending topics in niche...",
      "Top trend: 'Morning routine content' (+340% engagement)",
      "Secondary: 'Before/after transformations' (+210%)",
      "Competitor @fitlife_daily posted 3x this week — high engagement on reels",
      "Recommendation: Focus on morning routine + transformation content",
    ],
    result: "Trend Report: 14 topics identified. Top recommendation: Morning routine content (+340% engagement). 3 competitor insights collected.",
  },
  content_writer: {
    lines: [
      "Loading brand voice profile...",
      "Generating caption draft...",
      "Applying tone: motivational, authentic",
      "Draft 1: \"Your morning sets the tone for everything...\"",
      "Refining with engagement hooks...",
      "Adding call-to-action...",
      "Final caption generated (142 characters)",
    ],
    result: "Your morning sets the tone for everything. 5 AM isn't early — it's an advantage. Drop a \u{1F525} if you're part of the early crew.\n\nWhat's your non-negotiable morning habit? Tell me below \u{1F447}",
  },
  hashtag_generator: {
    lines: [
      "Analyzing content context...",
      "Researching hashtag performance...",
      "Filtering banned hashtags...",
      "Selecting mix: 5 broad + 10 niche + 5 trending",
      "#fitness #morningroutine #fitnessmotivation",
      "#5amclub #grindset #gymlife #healthylifestyle",
      "#fitfam #workoutmotivation #transformationtuesday",
      "20 hashtags selected — avg reach: 2.1M",
    ],
    result: "#fitness #morningroutine #fitnessmotivation #5amclub #grindset #gymlife #healthylifestyle #fitfam #workoutmotivation #transformationtuesday #earlybird #disciplineovermotivation #fitnesstips #gymmotivation #healthyliving #mondaymotivation #fitspo #trainhard #noexcuses #riseandgrind",
  },
  media_creator: {
    lines: [
      "Analyzing caption for visual direction...",
      "Style: minimalist, high contrast",
      "Generating visual concept...",
      "Layout: vertical (1080x1350)",
      "Applying brand colors: #1a1a2e, #e94560",
      "Adding text overlay with caption hook...",
      "Rendering final image...",
      "Image ready — 1080x1350px, optimized for feed",
    ],
    result: "Generated: 1080x1350 feed image. Style: minimalist dark with red accent. Text overlay: \"Your morning sets the tone.\" Brand-consistent color palette applied.",
  },
  scheduler: {
    lines: [
      "Analyzing audience activity patterns...",
      "Peak engagement window: 6:00 AM - 8:00 AM EST",
      "Secondary window: 12:00 PM - 1:00 PM EST",
      "Checking queue for conflicts...",
      "No conflicts found",
      "Optimal slot: Tuesday 6:30 AM EST",
      "Scheduling post for 2026-02-11 06:30:00 EST...",
      "Post queued successfully",
    ],
    result: "Scheduled for Tuesday, Feb 11 at 6:30 AM EST. Predicted engagement: 4.2% (above 3.8% average). No queue conflicts.",
  },
  publisher: {
    lines: [
      "Preparing post payload...",
      "Validating media dimensions...",
      "Connecting to @ironpulse_fit...",
      "Uploading image (1.2 MB)...",
      "Upload complete — media ID: ig_media_28473",
      "Publishing caption + hashtags...",
      "Post published successfully!",
      "Post ID: ig_post_9284756",
    ],
    result: "Published to @ironpulse_fit. Post ID: ig_post_9284756. Media uploaded: 1.2 MB image. Status: Live.",
  },
  engagement_bot: {
    lines: [
      "Monitoring post engagement...",
      "3 new comments detected",
      "Comment from @gym_bro_42: \"fire content!\"",
      "Auto-reply sent: \"Thanks! Glad you're vibing with it \u{1F64F}\"",
      "Comment from @sarah_lifts: \"What time do you wake up?\"",
      "Auto-reply sent: \"4:45 AM! It's a game changer \u{1F4AA}\"",
      "1 new DM — auto-response queued",
      "Engagement session complete: 3 replies, 1 DM",
    ],
    result: "Engagement complete: 3 comments replied to, 1 DM auto-responded. Sentiment: 100% positive. Response time: <30s average.",
  },
  analytics_monitor: {
    lines: [
      "Collecting post metrics...",
      "Impressions: 1,240 (first 2 hours)",
      "Reach: 890 unique accounts",
      "Likes: 147 | Comments: 12 | Saves: 34",
      "Engagement rate: 4.8% (above 3.8% baseline)",
      "Follower change: +18 new followers",
      "Comparing to 7-day average...",
      "Performance: 26% above average \u{1F4C8}",
    ],
    result: "Post Performance: 1,240 impressions, 4.8% engagement rate (+26% vs avg). 147 likes, 12 comments, 34 saves. +18 new followers attributed.",
  },
};

// ---------------------------------------------------------------------------
// Execution order resolver
// ---------------------------------------------------------------------------

function resolveExecutionOrder(nodes: AgentNode[], connections: PipelineConnection[]): string[] {
  if (nodes.length === 0) return [];

  // Build adjacency: source -> target
  const outgoing = new Map<string, string>();
  const incoming = new Set<string>();
  for (const conn of connections) {
    outgoing.set(conn.sourceNodeId, conn.targetNodeId);
    incoming.add(conn.targetNodeId);
  }

  // Find the start node (no incoming connection)
  const startNodeId = nodes.find((n) => !incoming.has(n.id))?.id;
  if (!startNodeId) return nodes.map((n) => n.id);

  // Walk the chain
  const order: string[] = [];
  let current: string | undefined = startNodeId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    order.push(current);
    current = outgoing.get(current);
  }

  // Add any orphan nodes not in the chain
  for (const node of nodes) {
    if (!visited.has(node.id)) order.push(node.id);
  }

  return order;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseExecutionSimulatorOptions {
  nodes: AgentNode[];
  connections: PipelineConnection[];
  pipelineId: string;
  onNodeStart?: (nodeId: string) => void;
  onNodeOutput?: (nodeId: string, line: string) => void;
  onNodeComplete?: (nodeId: string) => void;
  onNodeError?: (nodeId: string, error: string) => void;
  onRunComplete?: () => void;
}

interface ExecutionSimulator {
  currentRun: PipelineRun | null;
  isRunning: boolean;
  activeNodeId: string | null;
  streamingText: string;
  start: () => void;
  stop: () => void;
  retry: () => void;
  skip: () => void;
}

export function useExecutionSimulator({
  nodes,
  connections,
  pipelineId,
  onNodeStart,
  onNodeOutput,
  onNodeComplete,
  onRunComplete,
}: UseExecutionSimulatorOptions): ExecutionSimulator {
  const [currentRun, setCurrentRun] = useState<PipelineRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abortRef = useRef(false);
  const executionOrderRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  // Run a single node simulation
  const runNode = useCallback(
    (nodeId: string, run: PipelineRun): Promise<PipelineRun> => {
      return new Promise((resolve) => {
        if (abortRef.current) {
          resolve(run);
          return;
        }

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) {
          resolve(run);
          return;
        }

        const mockData = MOCK_OUTPUTS[node.type];
        const lines = mockData.lines;
        const startTime = Date.now();

        // Mark node as running
        setActiveNodeId(nodeId);
        setStreamingText("");
        onNodeStart?.(nodeId);

        const updatedRun = { ...run };
        const nodeRunIndex = updatedRun.nodeRuns.findIndex((nr) => nr.nodeId === nodeId);
        if (nodeRunIndex >= 0) {
          updatedRun.nodeRuns = [...updatedRun.nodeRuns];
          updatedRun.nodeRuns[nodeRunIndex] = {
            ...updatedRun.nodeRuns[nodeRunIndex],
            status: "running" as NodeRunStatus,
            startedAt: new Date().toISOString(),
          };
        }
        setCurrentRun({ ...updatedRun });

        // Stream lines one by one
        let lineIndex = 0;
        const lineDelay = 300 + Math.random() * 200; // 300-500ms between lines

        const streamNextLine = () => {
          if (abortRef.current || lineIndex >= lines.length) {
            // Node complete
            const endTime = Date.now();
            const finalRun = { ...updatedRun };
            const idx = finalRun.nodeRuns.findIndex((nr) => nr.nodeId === nodeId);
            if (idx >= 0) {
              finalRun.nodeRuns = [...finalRun.nodeRuns];
              finalRun.nodeRuns[idx] = {
                ...finalRun.nodeRuns[idx],
                status: abortRef.current ? "cancelled" as NodeRunStatus : "complete" as NodeRunStatus,
                completedAt: new Date().toISOString(),
                duration: endTime - startTime,
                output: lines.slice(0, lineIndex),
                result: abortRef.current ? null : mockData.result,
              };
              finalRun.duration = endTime - new Date(finalRun.startedAt).getTime();
            }
            setCurrentRun({ ...finalRun });
            if (!abortRef.current) {
              onNodeComplete?.(nodeId);
            }
            resolve(finalRun);
            return;
          }

          const line = lines[lineIndex];
          setStreamingText((prev) => (prev ? prev + "\n" + line : line));
          onNodeOutput?.(nodeId, line);

          // Update the node run output
          const runCopy = { ...updatedRun };
          const nrIdx = runCopy.nodeRuns.findIndex((nr) => nr.nodeId === nodeId);
          if (nrIdx >= 0) {
            runCopy.nodeRuns = [...runCopy.nodeRuns];
            runCopy.nodeRuns[nrIdx] = {
              ...runCopy.nodeRuns[nrIdx],
              output: lines.slice(0, lineIndex + 1),
            };
          }
          setCurrentRun({ ...runCopy });

          lineIndex++;
          const timer = setTimeout(streamNextLine, lineDelay);
          timersRef.current.push(timer);
        };

        // Start streaming after a small initial delay
        const startTimer = setTimeout(streamNextLine, 500);
        timersRef.current.push(startTimer);
      });
    },
    [nodes, onNodeStart, onNodeOutput, onNodeComplete]
  );

  // Run nodes sequentially
  const runSequence = useCallback(
    async (order: string[], startIndex: number, initialRun: PipelineRun) => {
      let run = initialRun;

      for (let i = startIndex; i < order.length; i++) {
        if (abortRef.current) break;
        currentIndexRef.current = i;
        run = await runNode(order[i], run);
      }

      if (!abortRef.current) {
        // Mark run as completed
        const finalRun = {
          ...run,
          status: "completed" as PipelineRunStatus,
          completedAt: new Date().toISOString(),
          duration: Date.now() - new Date(run.startedAt).getTime(),
        };
        setCurrentRun(finalRun);
        setActiveNodeId(null);
        setIsRunning(false);
        onRunComplete?.();
      }
    },
    [runNode, onRunComplete]
  );

  const start = useCallback(() => {
    abortRef.current = false;
    clearTimers();

    const order = resolveExecutionOrder(nodes, connections);
    executionOrderRef.current = order;
    currentIndexRef.current = 0;

    const nodeRuns: NodeRun[] = order.map((nodeId) => ({
      nodeId,
      status: "idle" as NodeRunStatus,
      startedAt: null,
      completedAt: null,
      duration: null,
      output: [],
      result: null,
      error: null,
    }));

    const run: PipelineRun = {
      id: `run-${Date.now()}`,
      pipelineId,
      status: "running",
      startedAt: new Date().toISOString(),
      completedAt: null,
      duration: 0,
      nodeRuns,
    };

    setCurrentRun(run);
    setIsRunning(true);
    setStreamingText("");

    runSequence(order, 0, run);
  }, [nodes, connections, pipelineId, clearTimers, runSequence]);

  const stop = useCallback(() => {
    abortRef.current = true;
    clearTimers();
    setIsRunning(false);
    setActiveNodeId(null);

    setCurrentRun((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: "stopped",
        completedAt: new Date().toISOString(),
        duration: Date.now() - new Date(prev.startedAt).getTime(),
        nodeRuns: prev.nodeRuns.map((nr) =>
          nr.status === "running" ? { ...nr, status: "cancelled" as NodeRunStatus } : nr
        ),
      };
    });
  }, [clearTimers]);

  const retry = useCallback(() => {
    // Retry from the current (failed/cancelled) node
    if (!currentRun) return;
    abortRef.current = false;

    const retryIndex = currentIndexRef.current;
    const resetRun = {
      ...currentRun,
      status: "running" as PipelineRunStatus,
      completedAt: null,
      nodeRuns: currentRun.nodeRuns.map((nr, i) => {
        const order = executionOrderRef.current;
        const nodeIdx = order.indexOf(nr.nodeId);
        if (nodeIdx >= retryIndex) {
          return { ...nr, status: "idle" as NodeRunStatus, output: [], result: null, error: null, startedAt: null, completedAt: null, duration: null };
        }
        return nr;
      }),
    };

    setCurrentRun(resetRun);
    setIsRunning(true);
    setStreamingText("");

    runSequence(executionOrderRef.current, retryIndex, resetRun);
  }, [currentRun, runSequence]);

  const skip = useCallback(() => {
    if (!currentRun) return;
    abortRef.current = false;
    clearTimers();

    const skipIndex = currentIndexRef.current;
    const skippedRun = {
      ...currentRun,
      status: "running" as PipelineRunStatus,
      nodeRuns: currentRun.nodeRuns.map((nr) => {
        const order = executionOrderRef.current;
        const nodeIdx = order.indexOf(nr.nodeId);
        if (nodeIdx === skipIndex) {
          return { ...nr, status: "skipped" as NodeRunStatus, completedAt: new Date().toISOString() };
        }
        return nr;
      }),
    };

    setCurrentRun(skippedRun);
    setActiveNodeId(null);
    setStreamingText("");

    runSequence(executionOrderRef.current, skipIndex + 1, skippedRun);
  }, [currentRun, clearTimers, runSequence]);

  return {
    currentRun,
    isRunning,
    activeNodeId,
    streamingText,
    start,
    stop,
    retry,
    skip,
  };
}
