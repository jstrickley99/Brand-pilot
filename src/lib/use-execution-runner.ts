"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentNode, AgentType, AIProvider, PipelineConnection, PipelineRun, NodeRun, NodeRunStatus, PipelineRunStatus } from "./types";
import { getApiKey } from "./api-keys";

// ---------------------------------------------------------------------------
// Status messages shown during execution (before AI response arrives)
// ---------------------------------------------------------------------------

const STATUS_LINES: Record<AgentType, string[]> = {
  content_researcher: [
    "Initializing trend analysis...",
    "Scanning social media trends...",
    "Analyzing competitor content...",
  ],
  content_writer: [
    "Loading brand voice profile...",
    "Generating caption draft...",
    "Applying tone and style...",
  ],
  hashtag_generator: [
    "Analyzing content context...",
    "Researching hashtag performance...",
    "Selecting optimal mix...",
  ],
  media_creator: [
    "Analyzing content for visual direction...",
    "Generating visual brief...",
    "Preparing creative specifications...",
  ],
  scheduler: [
    "Analyzing audience activity patterns...",
    "Calculating optimal posting window...",
    "Checking schedule conflicts...",
  ],
  publisher: [
    "Preparing publish package...",
    "Validating content requirements...",
    "Running pre-publish checks...",
  ],
  engagement_bot: [
    "Analyzing engagement patterns...",
    "Crafting reply templates...",
    "Configuring trigger rules...",
  ],
  analytics_monitor: [
    "Collecting performance metrics...",
    "Analyzing engagement data...",
    "Generating insights report...",
  ],
};

// ---------------------------------------------------------------------------
// Execution order resolver
// ---------------------------------------------------------------------------

function resolveExecutionOrder(nodes: AgentNode[], connections: PipelineConnection[]): string[] {
  if (nodes.length === 0) return [];

  const outgoing = new Map<string, string>();
  const incoming = new Set<string>();
  for (const conn of connections) {
    outgoing.set(conn.sourceNodeId, conn.targetNodeId);
    incoming.add(conn.targetNodeId);
  }

  const startNodeId = nodes.find((n) => !incoming.has(n.id))?.id;
  if (!startNodeId) return nodes.map((n) => n.id);

  const order: string[] = [];
  let current: string | undefined = startNodeId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    order.push(current);
    current = outgoing.get(current);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) order.push(node.id);
  }

  return order;
}

// ---------------------------------------------------------------------------
// Parse AI JSON response into a readable summary
// ---------------------------------------------------------------------------

function formatNodeResult(type: AgentType, jsonOutput: string): string {
  try {
    const parsed = JSON.parse(jsonOutput);

    switch (type) {
      case "content_researcher":
        return [
          parsed.contentRecommendation && `Recommendation: ${parsed.contentRecommendation}`,
          parsed.trendingTopics?.length && `Trending: ${parsed.trendingTopics.join(", ")}`,
          parsed.predictedEngagement && `Predicted engagement: ${parsed.predictedEngagement}`,
        ].filter(Boolean).join("\n");

      case "content_writer":
        return parsed.caption || jsonOutput;

      case "hashtag_generator":
        return parsed.hashtags?.length
          ? parsed.hashtags.map((h: string) => `#${h}`).join(" ")
          : jsonOutput;

      case "media_creator":
        return [
          parsed.imageDescription,
          parsed.dimensions && `Dimensions: ${parsed.dimensions}`,
          parsed.style && `Style: ${parsed.style}`,
        ].filter(Boolean).join("\n");

      case "scheduler":
        return [
          parsed.scheduledTime && `Scheduled: ${parsed.scheduledTime}`,
          parsed.dayOfWeek && `Day: ${parsed.dayOfWeek}`,
          parsed.reasoning,
        ].filter(Boolean).join("\n");

      case "publisher":
        return [
          parsed.publishSummary,
          parsed.contentChecklist?.length && `Checklist: ${parsed.contentChecklist.join(", ")}`,
        ].filter(Boolean).join("\n");

      case "engagement_bot":
        return [
          parsed.engagementStrategy,
          parsed.replyTemplates?.length && `Templates: ${parsed.replyTemplates.length} created`,
        ].filter(Boolean).join("\n");

      case "analytics_monitor":
        return [
          parsed.performanceSummary,
          parsed.insights?.length && `Insights: ${parsed.insights.join("; ")}`,
        ].filter(Boolean).join("\n");

      default:
        return jsonOutput;
    }
  } catch {
    return jsonOutput;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseExecutionRunnerOptions {
  nodes: AgentNode[];
  connections: PipelineConnection[];
  pipelineId: string;
  accountContext: {
    handle: string;
    niche: string;
    brandVoice: {
      toneFormality: number;
      toneHumor: number;
      toneInspiration: number;
    };
  } | null;
  provider: AIProvider;
}

interface ExecutionRunner {
  currentRun: PipelineRun | null;
  isRunning: boolean;
  activeNodeId: string | null;
  streamingText: string;
  start: () => void;
  stop: () => void;
  retry: () => void;
  skip: () => void;
}

export function useExecutionRunner({
  nodes,
  connections,
  pipelineId,
  accountContext,
  provider,
}: UseExecutionRunnerOptions): ExecutionRunner {
  const [currentRun, setCurrentRun] = useState<PipelineRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");

  const abortRef = useRef(false);
  const executionOrderRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearStatusTimer = useCallback(() => {
    if (statusTimerRef.current) {
      clearInterval(statusTimerRef.current);
      statusTimerRef.current = null;
    }
  }, []);

  // Execute a single node via API
  const executeNode = useCallback(
    async (nodeId: string, run: PipelineRun, previousOutput: string | null): Promise<{ run: PipelineRun; output: string | null }> => {
      if (abortRef.current) return { run, output: null };

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return { run, output: null };

      const startTime = Date.now();

      // Mark node as running
      setActiveNodeId(nodeId);
      setStreamingText("");

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

      // Show status lines while waiting for API
      const statusLines = STATUS_LINES[node.type] || ["Processing..."];
      let statusIndex = 0;
      setStreamingText(statusLines[0]);

      statusTimerRef.current = setInterval(() => {
        statusIndex++;
        if (statusIndex < statusLines.length) {
          setStreamingText((prev) => prev + "\n" + statusLines[statusIndex]);
        }
      }, 1500);

      try {
        // Get API key from localStorage
        const apiKey = getApiKey(provider);
        if (!apiKey) {
          throw new Error(`No ${provider === "anthropic" ? "Anthropic" : "OpenAI"} API key found. Add your key in Settings.`);
        }

        // Call the API
        const response = await fetch("/api/agents/execute-node", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-ai-api-key": apiKey,
          },
          body: JSON.stringify({
            type: node.type,
            config: node.config,
            provider,
            previousOutput,
            accountContext,
          }),
        });

        const data = await response.json();
        clearStatusTimer();

        if (abortRef.current) return { run: updatedRun, output: null };

        if (!data.success) {
          throw new Error(data.error || "Agent execution failed");
        }

        const output = data.output || "";
        const result = formatNodeResult(node.type, output);
        const endTime = Date.now();

        // Show the AI response
        setStreamingText((prev) => prev + "\n\nAgent response received:\n" + result);

        // Update node run as complete
        const finalRun = { ...updatedRun };
        const idx = finalRun.nodeRuns.findIndex((nr) => nr.nodeId === nodeId);
        if (idx >= 0) {
          finalRun.nodeRuns = [...finalRun.nodeRuns];
          finalRun.nodeRuns[idx] = {
            ...finalRun.nodeRuns[idx],
            status: "complete" as NodeRunStatus,
            completedAt: new Date().toISOString(),
            duration: endTime - startTime,
            output: [...statusLines.slice(0, statusIndex + 1), "", "Agent response received:", result],
            result,
          };
          finalRun.duration = endTime - new Date(finalRun.startedAt).getTime();
        }
        setCurrentRun({ ...finalRun });

        return { run: finalRun, output };
      } catch (error) {
        clearStatusTimer();
        const endTime = Date.now();
        const errorMsg = error instanceof Error ? error.message : "Unknown error";

        setStreamingText((prev) => prev + "\n\nError: " + errorMsg);

        // Update node run as error
        const errorRun = { ...updatedRun };
        const idx = errorRun.nodeRuns.findIndex((nr) => nr.nodeId === nodeId);
        if (idx >= 0) {
          errorRun.nodeRuns = [...errorRun.nodeRuns];
          errorRun.nodeRuns[idx] = {
            ...errorRun.nodeRuns[idx],
            status: "error" as NodeRunStatus,
            completedAt: new Date().toISOString(),
            duration: endTime - startTime,
            output: [...statusLines.slice(0, statusIndex + 1), "", "Error: " + errorMsg],
            error: errorMsg,
            result: null,
          };
          errorRun.status = "error" as PipelineRunStatus;
          errorRun.duration = endTime - new Date(errorRun.startedAt).getTime();
        }
        setCurrentRun({ ...errorRun });
        setIsRunning(false);
        setActiveNodeId(null);

        return { run: errorRun, output: null };
      }
    },
    [nodes, accountContext, provider, clearStatusTimer]
  );

  // Run nodes sequentially
  const runSequence = useCallback(
    async (order: string[], startIndex: number, initialRun: PipelineRun) => {
      let run = initialRun;
      let previousOutput: string | null = null;

      for (let i = startIndex; i < order.length; i++) {
        if (abortRef.current) break;
        currentIndexRef.current = i;

        const result = await executeNode(order[i], run, previousOutput);
        run = result.run;
        previousOutput = result.output;

        // If node errored, stop the sequence
        const nodeRun = run.nodeRuns.find((nr) => nr.nodeId === order[i]);
        if (nodeRun?.status === "error") return;
      }

      if (!abortRef.current) {
        const finalRun = {
          ...run,
          status: "completed" as PipelineRunStatus,
          completedAt: new Date().toISOString(),
          duration: Date.now() - new Date(run.startedAt).getTime(),
        };
        setCurrentRun(finalRun);
        setActiveNodeId(null);
        setIsRunning(false);
      }
    },
    [executeNode]
  );

  const start = useCallback(() => {
    abortRef.current = false;
    clearStatusTimer();

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
  }, [nodes, connections, pipelineId, clearStatusTimer, runSequence]);

  const stop = useCallback(() => {
    abortRef.current = true;
    clearStatusTimer();
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
  }, [clearStatusTimer]);

  const retry = useCallback(() => {
    if (!currentRun) return;
    abortRef.current = false;

    const retryIndex = currentIndexRef.current;
    const resetRun: PipelineRun = {
      ...currentRun,
      status: "running" as PipelineRunStatus,
      completedAt: null,
      nodeRuns: currentRun.nodeRuns.map((nr) => {
        const order = executionOrderRef.current;
        const nodeIdx = order.indexOf(nr.nodeId);
        if (nodeIdx >= retryIndex) {
          return { ...nr, status: "idle" as NodeRunStatus, output: [] as string[], result: null, error: null, startedAt: null, completedAt: null, duration: null };
        }
        return nr;
      }),
    };

    setCurrentRun(resetRun);
    setIsRunning(true);
    setStreamingText("");

    // Get the previous output from the last completed node before retry point
    let previousOutput: string | null = null;
    if (retryIndex > 0) {
      const prevNodeId = executionOrderRef.current[retryIndex - 1];
      const prevNodeRun = currentRun.nodeRuns.find((nr) => nr.nodeId === prevNodeId);
      previousOutput = prevNodeRun?.result ?? null;
    }

    // We need a modified runSequence that starts with the right previousOutput
    const runFromRetry = async () => {
      let run = resetRun;
      let prevOut = previousOutput;

      for (let i = retryIndex; i < executionOrderRef.current.length; i++) {
        if (abortRef.current) break;
        currentIndexRef.current = i;

        const result = await executeNode(executionOrderRef.current[i], run, prevOut);
        run = result.run;
        prevOut = result.output;

        const nodeRun = run.nodeRuns.find((nr) => nr.nodeId === executionOrderRef.current[i]);
        if (nodeRun?.status === "error") return;
      }

      if (!abortRef.current) {
        const finalRun = {
          ...run,
          status: "completed" as PipelineRunStatus,
          completedAt: new Date().toISOString(),
          duration: Date.now() - new Date(run.startedAt).getTime(),
        };
        setCurrentRun(finalRun);
        setActiveNodeId(null);
        setIsRunning(false);
      }
    };

    runFromRetry();
  }, [currentRun, executeNode]);

  const skip = useCallback(() => {
    if (!currentRun) return;
    abortRef.current = false;
    clearStatusTimer();

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
  }, [currentRun, clearStatusTimer, runSequence]);

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
