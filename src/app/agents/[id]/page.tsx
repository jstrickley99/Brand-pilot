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
import { mockPipelines } from "@/lib/mock-data";
import type { Pipeline, AgentNode, AgentType, PipelineConnection } from "@/lib/types";
import { AGENT_TYPE_META } from "@/lib/types";
import { PipelineCanvas } from "@/components/agents/pipeline-canvas";
import { ConfigPanel } from "@/components/agents/config-panel";
import { AssignAccounts } from "@/components/agents/assign-accounts";

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

  const selectedNode = selectedNodeId ? pipeline.nodes.find((n) => n.id === selectedNodeId) ?? null : null;

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

    // Auto-connect: link from the last node in the chain to the new node
    const newConnections = [...pipeline.connections];
    if (pipeline.nodes.length > 0) {
      // Find the last node that has no outgoing connection
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
        // Auto-set status to configured when config is provided
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
      // Remove the node
      const remainingNodes = prev.nodes.filter((n) => n.id !== nodeId);

      // Find connections that involve this node
      const incomingConn = prev.connections.find((c) => c.targetNodeId === nodeId);
      const outgoingConn = prev.connections.find((c) => c.sourceNodeId === nodeId);

      // Remove connections involving this node
      let newConnections = prev.connections.filter(
        (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      );

      // Re-connect: if node had both incoming and outgoing, bridge them
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

  // --- Duplicate pipeline ---
  const handleDuplicate = useCallback(() => {
    setSaveMessage("Pipeline duplicated (local only)");
    setTimeout(() => setSaveMessage(null), 2000);
  }, []);

  // --- Status display ---
  const statusLabel = pipeline.status === "active" ? "Active" : pipeline.status === "paused" ? "Paused" : "Draft";
  const statusColor =
    pipeline.status === "active"
      ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
      : pipeline.status === "paused"
      ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20"
      : "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20";

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
            {isEditingName ? (
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
                onClick={() => setIsEditingName(true)}
                className="text-lg font-semibold text-[#F8FAFC] hover:text-[#3B82F6] transition-colors py-0.5 px-1 -ml-1 rounded"
                title="Click to rename"
              >
                {pipelineName}
              </button>
            )}

            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", statusColor)}>
              {statusLabel}
            </span>

            {/* Save feedback toast */}
            {saveMessage && (
              <span className="text-xs font-medium text-[#F97316] animate-pulse">
                {saveMessage}
              </span>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {/* Assign Accounts dropdown */}
          <AssignAccounts
            assignedAccountIds={pipeline.assignedAccountIds}
            onAssign={handleAssignAccounts}
          />

          {/* Pause/Resume (only for active/paused pipelines) */}
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
        />
      </div>

      {/* Agent picker overlay */}
      {isAgentPickerOpen && (
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

      {/* Config panel (side panel) */}
      {selectedNode && (
        <ConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      )}
    </div>
  );
}
