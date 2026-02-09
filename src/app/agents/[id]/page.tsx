"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Rocket,
  Bot,
  Search,
  PenTool,
  Hash,
  Image,
  Clock,
  Send,
  MessageCircle,
  BarChart3,
  Pause,
  Play,
  Copy,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockPipelines, mockAccounts } from "@/lib/mock-data";
import type { Pipeline, AgentNode, AgentType, AIProvider, PipelineConnection, ExecutionMode } from "@/lib/types";
import { AGENT_TYPE_META } from "@/lib/types";
import { PipelineCanvas } from "@/components/agents/pipeline-canvas";
import { ConfigPanel } from "@/components/agents/config-panel";
import { AssignAccounts } from "@/components/agents/assign-accounts";
import { ExecutionBar } from "@/components/agents/execution-bar";
import { ExecutionOutputPanel } from "@/components/agents/execution-output-panel";
import { useExecutionRunner } from "@/lib/use-execution-runner";
import { hasApiKey } from "@/lib/api-keys";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Search, PenTool, Hash, Image, Clock, Send, MessageCircle, BarChart3,
};

interface PipelinePageProps {
  params: Promise<{ id: string }>;
}

export default function PipelinePage({ params }: PipelinePageProps) {
  const { id } = use(params);
  const sourcePipeline = mockPipelines.find((p) => p.id === id);

  if (!sourcePipeline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-[#64748B]" />
          </div>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-2">Pipeline not found</h2>
          <p className="text-[#94A3B8] mb-6">The pipeline you are looking for does not exist or has been removed.</p>
          <Link href="/agents" className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] hover:text-[#60A5FA] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return <PipelinePageContent initialPipeline={sourcePipeline} />;
}

function PipelinePageContent({ initialPipeline }: { initialPipeline: Pipeline }) {
  const [pipeline, setPipeline] = useState<Pipeline>({ ...initialPipeline });
  const [pipelineName, setPipelineName] = useState(initialPipeline.name);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAgentPickerOpen, setIsAgentPickerOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<ExecutionMode>("build");
  const [aiProvider, setAiProvider] = useState<AIProvider>("anthropic");

  const selectedNode = selectedNodeId ? pipeline.nodes.find((n) => n.id === selectedNodeId) ?? null : null;

  // Resolve account context from assigned accounts
  const assignedAccount = pipeline.assignedAccountIds.length > 0
    ? mockAccounts.find((a) => a.id === pipeline.assignedAccountIds[0])
    : null;

  const accountContext = assignedAccount
    ? {
        handle: assignedAccount.handle,
        niche: assignedAccount.niche,
        brandVoice: {
          toneFormality: assignedAccount.brandVoice.toneFormality,
          toneHumor: assignedAccount.brandVoice.toneHumor,
          toneInspiration: assignedAccount.brandVoice.toneInspiration,
        },
      }
    : null;

  // Real execution runner
  const simulator = useExecutionRunner({
    nodes: pipeline.nodes,
    connections: pipeline.connections,
    pipelineId: pipeline.id,
    accountContext,
    provider: aiProvider,
  });

  const isExecutionMode = mode === "execute";

  // --- Node selection ---
  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  // --- Node position ---
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setPipeline((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
    }));
  }, []);

  // --- Add node (opens picker) ---
  const handleAddNode = useCallback(() => {
    setIsAgentPickerOpen(true);
  }, []);

  // --- Agent type selected from picker ---
  const handleAgentTypeSelect = useCallback((type: AgentType) => {
    const meta = AGENT_TYPE_META.find((m) => m.type === type);
    const newNodeId = `node-${Date.now()}`;

    const newNode: AgentNode = {
      id: newNodeId,
      type,
      name: meta?.label ?? type,
      position: { x: 300 + pipeline.nodes.length * 250, y: 200 },
      config: null,
      status: "unconfigured",
      autonomyLevel: "approval_required",
      isActive: false,
    };

    const newConnections = [...pipeline.connections];
    if (pipeline.nodes.length > 0) {
      const nodesWithOutgoing = new Set(pipeline.connections.map((c) => c.sourceNodeId));
      const lastNode = [...pipeline.nodes].reverse().find((n) => !nodesWithOutgoing.has(n.id));
      if (lastNode) {
        newConnections.push({
          id: `conn-${Date.now()}`,
          sourceNodeId: lastNode.id,
          targetNodeId: newNodeId,
        });
      }
    }

    setPipeline((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      connections: newConnections,
    }));
    setIsAgentPickerOpen(false);
    setSelectedNodeId(newNodeId);
  }, [pipeline.nodes, pipeline.connections]);

  // --- Update node (from config panel) ---
  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<AgentNode>) => {
    setPipeline((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const updated = { ...node, ...updates };
        if (updates.config !== undefined && updates.config !== null) {
          updated.status = "configured";
        }
        return updated;
      }),
    }));
  }, []);

  // --- Delete node ---
  const handleDeleteNode = useCallback((nodeId: string) => {
    setPipeline((prev) => {
      const remainingNodes = prev.nodes.filter((n) => n.id !== nodeId);
      const incomingConn = prev.connections.find((c) => c.targetNodeId === nodeId);
      const outgoingConn = prev.connections.find((c) => c.sourceNodeId === nodeId);

      let newConnections = prev.connections.filter(
        (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      );

      if (incomingConn && outgoingConn) {
        newConnections.push({
          id: `conn-${Date.now()}`,
          sourceNodeId: incomingConn.sourceNodeId,
          targetNodeId: outgoingConn.targetNodeId,
        });
      }

      return { ...prev, nodes: remainingNodes, connections: newConnections };
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  // --- Pipeline name editing ---
  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
    if (pipelineName.trim() === "") {
      setPipelineName(pipeline.name);
    } else {
      setPipeline((prev) => ({ ...prev, name: pipelineName.trim() }));
    }
  }, [pipelineName, pipeline.name]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setPipelineName(pipeline.name);
      setIsEditingName(false);
    }
  }, [pipeline.name]);

  // --- Assign accounts ---
  const handleAssignAccounts = useCallback((accountIds: string[]) => {
    setPipeline((prev) => ({ ...prev, assignedAccountIds: accountIds }));
  }, []);

  // --- Save as Draft ---
  const handleSaveAsDraft = useCallback(() => {
    setPipeline((prev) => ({ ...prev, status: "draft", updatedAt: new Date().toISOString() }));
    setSaveMessage("Saved as draft");
    setTimeout(() => setSaveMessage(null), 2000);
  }, []);

  // --- Deploy Agent ---
  const handleDeploy = useCallback(() => {
    const unconfiguredNodes = pipeline.nodes.filter((n) => n.status !== "configured");
    if (unconfiguredNodes.length > 0) {
      setSaveMessage(`${unconfiguredNodes.length} node(s) need configuration`);
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    if (pipeline.nodes.length === 0) {
      setSaveMessage("Add at least one agent node");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    if (pipeline.assignedAccountIds.length === 0) {
      setSaveMessage("Assign at least one account");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    setPipeline((prev) => ({ ...prev, status: "active", updatedAt: new Date().toISOString() }));
    setSaveMessage("Pipeline deployed!");
    setTimeout(() => setSaveMessage(null), 2000);
  }, [pipeline.nodes, pipeline.assignedAccountIds]);

  // --- Pause / Resume ---
  const handleTogglePause = useCallback(() => {
    setPipeline((prev) => ({
      ...prev,
      status: prev.status === "active" ? "paused" : "active",
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // --- Run Pipeline ---
  const handleRunPipeline = useCallback(() => {
    if (!hasApiKey(aiProvider)) {
      setSaveMessage(`Add your ${aiProvider === "anthropic" ? "Anthropic" : "OpenAI"} API key in Settings first`);
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    setMode("execute");
    setSelectedNodeId(null);
    simulator.start();
  }, [simulator, aiProvider]);

  // --- Back to Builder ---
  const handleBackToBuilder = useCallback(() => {
    setMode("build");
    setSelectedNodeId(null);
  }, []);

  // --- Status display ---
  const statusLabel = pipeline.status === "active" ? "Active" : pipeline.status === "paused" ? "Paused" : "Draft";
  const statusColor =
    pipeline.status === "active"
      ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
      : pipeline.status === "paused"
      ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20"
      : "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20";

  // Get the node run for the selected node (in execution mode)
  const selectedNodeRun = isExecutionMode && selectedNodeId && simulator.currentRun
    ? simulator.currentRun.nodeRuns.find((nr) => nr.nodeId === selectedNodeId) ?? null
    : null;

  // Determine if streaming text applies to the selected node
  const selectedStreamingText =
    isExecutionMode && selectedNodeId === simulator.activeNodeId
      ? simulator.streamingText
      : "";

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Top bar */}
      <div className="h-[68px] border-b border-[#1E293B] bg-[#0B0F19]/80 backdrop-blur-sm flex items-center justify-between px-6">
        {/* Left: back + name + status */}
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="w-9 h-9 rounded-lg bg-[#111827] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
            title="Back to Agents"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-3">
            {!isExecutionMode && isEditingName ? (
              <input
                type="text"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="text-lg font-semibold text-[#F8FAFC] bg-transparent border-b-2 border-[#3B82F6] outline-none py-0.5 px-1 -ml-1 min-w-[200px]"
              />
            ) : (
              <button
                onClick={() => !isExecutionMode && setIsEditingName(true)}
                className={cn(
                  "text-lg font-semibold text-[#F8FAFC] py-0.5 px-1 -ml-1 rounded",
                  !isExecutionMode && "hover:text-[#3B82F6] transition-colors cursor-pointer",
                  isExecutionMode && "cursor-default"
                )}
                title={isExecutionMode ? undefined : "Click to rename"}
              >
                {pipelineName}
              </button>
            )}

            {!isExecutionMode && (
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", statusColor)}>
                {statusLabel}
              </span>
            )}

            {/* Save feedback toast */}
            {saveMessage && !isExecutionMode && (
              <span className="text-xs font-medium text-[#F97316] animate-pulse">
                {saveMessage}
              </span>
            )}
          </div>
        </div>

        {/* Right: actions — conditional on mode */}
        <div className="flex items-center gap-3">
          {isExecutionMode && simulator.currentRun ? (
            <ExecutionBar
              run={simulator.currentRun}
              totalNodes={pipeline.nodes.length}
              onStop={simulator.stop}
              onRetry={simulator.retry}
              onSkip={simulator.skip}
              onBackToBuilder={handleBackToBuilder}
            />
          ) : (
            <>
              {/* Assign Accounts dropdown */}
              <AssignAccounts
                assignedAccountIds={pipeline.assignedAccountIds}
                onAssign={handleAssignAccounts}
              />

              {/* Pause/Resume */}
              {(pipeline.status === "active" || pipeline.status === "paused") && (
                <button
                  onClick={handleTogglePause}
                  className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
                  title={pipeline.status === "active" ? "Pause pipeline" : "Resume pipeline"}
                >
                  {pipeline.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {pipeline.status === "active" ? "Pause" : "Resume"}
                </button>
              )}

              {/* Run Pipeline (only for active pipelines) */}
              {pipeline.status === "active" && (
                <div className="flex items-center gap-1">
                  {/* Provider selector */}
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value as AIProvider)}
                    className="h-9 px-2 text-xs font-medium rounded-l-lg border border-[#1E293B] bg-[#111827] text-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                  >
                    <option value="anthropic">Claude</option>
                    <option value="openai">GPT-4o</option>
                  </select>
                  <button
                    onClick={handleRunPipeline}
                    className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-r-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm shadow-[#8B5CF6]/25 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Run
                  </button>
                </div>
              )}

              {/* Save as Draft */}
              <button
                onClick={handleSaveAsDraft}
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>

              {/* Deploy Agent */}
              <button
                onClick={handleDeploy}
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-5 text-sm font-medium rounded-lg shadow-sm transition-colors",
                  pipeline.status === "active"
                    ? "bg-[#10B981] text-white hover:bg-[#059669] shadow-[#10B981]/25"
                    : "bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-[#3B82F6]/25"
                )}
              >
                <Rocket className="w-4 h-4" />
                {pipeline.status === "active" ? "Deployed" : "Deploy Agent"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas area */}
      <div className="p-4">
        <PipelineCanvas
          pipeline={pipeline}
          nodes={pipeline.nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          onNodePositionChange={handleNodePositionChange}
          onAddNode={handleAddNode}
          isExecutionMode={isExecutionMode}
          currentRun={simulator.currentRun}
          activeNodeId={simulator.activeNodeId}
        />
      </div>

      {/* Agent picker overlay — only in build mode */}
      {!isExecutionMode && isAgentPickerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsAgentPickerOpen(false)}
        >
          <div
            className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "agent-picker-panel-in 200ms ease-out" }}
          >
            <style>{`
              @keyframes agent-picker-panel-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">Add Agent Node</h3>
            <p className="text-sm text-[#94A3B8] mb-4">Select an agent type to add to your pipeline.</p>

            <div className="grid grid-cols-2 gap-3">
              {AGENT_TYPE_META.map((meta) => {
                const Icon = iconMap[meta.iconName];
                return (
                  <button
                    key={meta.type}
                    onClick={() => handleAgentTypeSelect(meta.type)}
                    className="p-4 rounded-xl border border-[#1E293B] bg-[#0B0F19] cursor-pointer transition-all duration-150 text-left group"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${meta.accentColor}80`;
                      e.currentTarget.style.boxShadow = `0 10px 15px -3px ${meta.accentColor}0d`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    {Icon && <Icon className="h-6 w-6 mb-2" style={{ color: meta.accentColor }} />}
                    <p className="text-sm font-medium text-[#F8FAFC]">{meta.label}</p>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{meta.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#1E293B] mt-4">
              <button
                onClick={() => setIsAgentPickerOpen(false)}
                className="w-full text-center text-sm text-[#94A3B8] hover:text-[#F8FAFC] py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side panel: Config (build mode) or Execution Output (execute mode) */}
      {selectedNode && !isExecutionMode && (
        <ConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      )}

      {selectedNode && isExecutionMode && (
        <ExecutionOutputPanel
          node={selectedNode}
          nodeRun={selectedNodeRun}
          streamingText={selectedStreamingText}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
