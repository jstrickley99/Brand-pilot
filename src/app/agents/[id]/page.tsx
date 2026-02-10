"use client";

import { use, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Rocket,
  Bot,
  Pause,
  Play,
  Loader2,
  Sparkles,
  Workflow,
  Calendar,
  TrendingUp,
  Hash,
  Palette,
  Clock,
  FileText,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Zap,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn, timeAgo, formatDate } from "@/lib/utils";
import type {
  Pipeline,
  AgentNode,
  AgentType,
  AIProvider,
  PipelineConnection,
  ExecutionMode,
  InstagramAccount,
  ContentPost,
  AgentConfig,
} from "@/lib/types";
import { AGENT_TYPE_META } from "@/lib/types";
import { PipelineCanvas } from "@/components/agents/pipeline-canvas";
import { ConfigPanel } from "@/components/agents/config-panel";
import { AgentPicker } from "@/components/agents/agent-picker";
import { AssignAccounts } from "@/components/agents/assign-accounts";
import { ExecutionBar } from "@/components/agents/execution-bar";
import { ExecutionOutputPanel } from "@/components/agents/execution-output-panel";
import { useExecutionRunner } from "@/lib/use-execution-runner";
import { hasApiKey } from "@/lib/api-keys";

/* ─────────────────────────── Page entry ─────────────────────────── */

interface PipelinePageProps {
  params: Promise<{ id: string }>;
}

export default function PipelinePage({ params }: PipelinePageProps) {
  const { id } = use(params);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/pipelines/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.pipeline) {
          setPipeline(data.pipeline);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  if (notFound || !pipeline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-[#64748B]" />
          </div>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-2">
            Pipeline not found
          </h2>
          <p className="text-[#94A3B8] mb-6">
            The pipeline you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return <PageShell initialPipeline={pipeline} />;
}

/* ─────────────────── Shell: switches between views ──────────────── */

type ViewMode = "dashboard" | "pipeline";

function PageShell({ initialPipeline }: { initialPipeline: Pipeline }) {
  const [view, setView] = useState<ViewMode>("dashboard");
  const [pipeline, setPipeline] = useState<Pipeline>({ ...initialPipeline });
  const [pipelineName, setPipelineName] = useState(initialPipeline.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);

  // Fetch accounts
  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAccounts(data.accounts);
      })
      .catch(() => {});
  }, []);

  // Fetch content
  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setContentPosts(data.content ?? []);
      })
      .catch(() => {});
  }, []);

  // Auto-save pipeline to DB (debounced)
  const saveTimerRef = useState<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef[0]) clearTimeout(saveTimerRef[0]);
    const timer = setTimeout(() => {
      fetch(`/api/pipelines/${pipeline.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pipeline.name,
          status: pipeline.status,
          nodes: pipeline.nodes,
          connections: pipeline.connections,
          assignedAccountIds: pipeline.assignedAccountIds,
          agentConfig: pipeline.agentConfig,
        }),
      }).catch(() => {});
    }, 1000);
    saveTimerRef[0] = timer;
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline]);

  // --- Pipeline name editing ---
  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
    if (pipelineName.trim() === "") {
      setPipelineName(pipeline.name);
    } else {
      setPipeline((prev) => ({ ...prev, name: pipelineName.trim() }));
    }
  }, [pipelineName, pipeline.name]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") e.currentTarget.blur();
      if (e.key === "Escape") {
        setPipelineName(pipeline.name);
        setIsEditingName(false);
      }
    },
    [pipeline.name]
  );

  // --- Pause / Resume ---
  const handleTogglePause = useCallback(() => {
    setPipeline((prev) => ({
      ...prev,
      status: prev.status === "active" ? "paused" : "active",
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // --- Status display ---
  const statusLabel =
    pipeline.status === "active"
      ? "Active"
      : pipeline.status === "paused"
      ? "Paused"
      : "Draft";
  const statusColor =
    pipeline.status === "active"
      ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
      : pipeline.status === "paused"
      ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20"
      : "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20";

  // Filter content for this agent's account
  const agentConfig = pipeline.agentConfig ?? null;
  const filteredContent = agentConfig
    ? contentPosts.filter((c) => c.accountId === agentConfig.accountId)
    : contentPosts;

  const showToast = useCallback((msg: string, duration = 3000) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), duration);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* ── Top bar ── */}
      <div className="h-[68px] border-b border-[#1E293B] bg-[#0B0F19]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
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
                className="text-lg font-semibold text-[#F8FAFC] py-0.5 px-1 -ml-1 rounded hover:text-[#3B82F6] transition-colors cursor-pointer"
                title="Click to rename"
              >
                {pipelineName}
              </button>
            )}

            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                statusColor
              )}
            >
              {statusLabel}
            </span>

            {saveMessage && (
              <span className="text-xs font-medium text-[#F97316] animate-pulse">
                {saveMessage}
              </span>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {view === "dashboard" ? (
            <>
              {/* Pause / Resume */}
              {(pipeline.status === "active" ||
                pipeline.status === "paused") && (
                <button
                  onClick={handleTogglePause}
                  className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
                  title={
                    pipeline.status === "active"
                      ? "Pause agent"
                      : "Resume agent"
                  }
                >
                  {pipeline.status === "active" ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {pipeline.status === "active" ? "Pause" : "Resume"}
                </button>
              )}

              {/* Generate Posts */}
              <button
                onClick={() =>
                  showToast(
                    "Coming soon - AI generation requires API key setup"
                  )
                }
                className="inline-flex items-center gap-2 h-9 px-5 text-sm font-medium rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm shadow-[#F97316]/25 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate Posts
              </button>

              {/* Edit Pipeline */}
              <button
                onClick={() => setView("pipeline")}
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
              >
                <Workflow className="w-4 h-4" />
                Edit Pipeline
              </button>
            </>
          ) : (
            <button
              onClick={() => setView("dashboard")}
              className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      {view === "dashboard" ? (
        <AgentDashboard
          pipeline={pipeline}
          agentConfig={agentConfig}
          accounts={accounts}
          contentPosts={filteredContent}
          onTogglePause={handleTogglePause}
          onDeleteContent={(contentId) => {
            fetch(`/api/content?id=${contentId}`, { method: "DELETE" })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  setContentPosts((prev) =>
                    prev.filter((c) => c.id !== contentId)
                  );
                }
              })
              .catch(() => {});
          }}
        />
      ) : (
        <PipelineEditView
          pipeline={pipeline}
          setPipeline={setPipeline}
          accounts={accounts}
          pipelineName={pipelineName}
          setPipelineName={setPipelineName}
          setSaveMessage={setSaveMessage}
          onBackToDashboard={() => setView("dashboard")}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  AGENT DASHBOARD VIEW                                             */
/* ══════════════════════════════════════════════════════════════════ */

interface AgentDashboardProps {
  pipeline: Pipeline;
  agentConfig: AgentConfig | null;
  accounts: InstagramAccount[];
  contentPosts: ContentPost[];
  onTogglePause: () => void;
  onDeleteContent: (id: string) => void;
}

function AgentDashboard({
  pipeline,
  agentConfig,
  accounts,
  contentPosts,
  onTogglePause,
  onDeleteContent,
}: AgentDashboardProps) {
  const [configExpanded, setConfigExpanded] = useState(false);

  // Derive stats from agentConfig
  const postsPerDay = agentConfig?.contentStrategy.postsPerDay ?? 0;
  const topicsCount = agentConfig?.topics.length ?? 0;
  const contentTypesCount = agentConfig?.contentStrategy.contentTypes.length ?? 0;
  const activeDaysCount = agentConfig?.schedule.activeDays.length ?? 0;

  // Mock activity feed
  const activityItems = [
    {
      id: "1",
      type: "agent_started" as const,
      message: "Agent pipeline activated",
      timestamp: pipeline.updatedAt,
    },
    {
      id: "2",
      type: "content_generated" as const,
      message: `${contentPosts.length} content items in queue`,
      timestamp: pipeline.updatedAt,
    },
    ...(pipeline.status === "paused"
      ? [
          {
            id: "3",
            type: "agent_paused" as const,
            message: "Agent paused by user",
            timestamp: pipeline.updatedAt,
          },
        ]
      : []),
  ];

  return (
    <div className="flex gap-6 p-6 max-w-[1600px] mx-auto">
      {/* ── Left column (2/3) ── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-[#3B82F6]" />}
            value={postsPerDay}
            label="Posts Per Day"
          />
          <StatCard
            icon={<Hash className="w-5 h-5 text-[#10B981]" />}
            value={topicsCount}
            label="Topics"
          />
          <StatCard
            icon={<Palette className="w-5 h-5 text-[#F97316]" />}
            value={contentTypesCount}
            label="Content Types"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-[#8B5CF6]" />}
            value={activeDaysCount}
            label="Active Days"
          />
        </div>

        {/* Content Queue */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#94A3B8]" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                Content Queue
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8]">
                {contentPosts.length}
              </span>
            </div>
          </div>

          {contentPosts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-[#64748B]" />
              </div>
              <p className="text-sm text-[#94A3B8] mb-1">
                No content queued yet.
              </p>
              <p className="text-xs text-[#64748B]">
                Click <span className="text-[#F97316] font-medium">Generate Posts</span> to create your first batch.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E293B]">
              {contentPosts.map((post) => (
                <ContentQueueItem
                  key={post.id}
                  post={post}
                  onDelete={() => onDeleteContent(post.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Agent Configuration Summary */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827]">
          <button
            onClick={() => setConfigExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1E293B]/30 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#94A3B8]" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                Agent Configuration
              </h3>
            </div>
            {configExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#64748B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#64748B]" />
            )}
          </button>

          {configExpanded && (
            <div className="px-5 pb-5 space-y-4 border-t border-[#1E293B] pt-4">
              {agentConfig ? (
                <>
                  {/* Niche & Topics */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                      Niche & Topics
                    </h4>
                    <p className="text-sm text-[#F8FAFC] mb-1.5">
                      {agentConfig.niche}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {agentConfig.topics.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] border border-[#1E293B]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Brand Voice */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                      Brand Voice
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <VoiceStat
                        label="Formality"
                        value={agentConfig.brandVoice.toneFormality}
                      />
                      <VoiceStat
                        label="Humor"
                        value={agentConfig.brandVoice.toneHumor}
                      />
                      <VoiceStat
                        label="Inspiration"
                        value={agentConfig.brandVoice.toneInspiration}
                      />
                    </div>
                    {agentConfig.brandVoice.writingStyle && (
                      <p className="text-xs text-[#94A3B8] mt-2">
                        Style: {agentConfig.brandVoice.writingStyle}
                      </p>
                    )}
                  </div>

                  {/* Content Strategy */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                      Content Strategy
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-[#94A3B8]">
                        Posts/day:{" "}
                        <span className="text-[#F8FAFC]">
                          {agentConfig.contentStrategy.postsPerDay}
                        </span>
                      </div>
                      <div className="text-[#94A3B8]">
                        Hashtag strategy:{" "}
                        <span className="text-[#F8FAFC]">
                          {agentConfig.contentStrategy.hashtagStrategy.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </div>
                      <div className="text-[#94A3B8]">
                        Types:{" "}
                        <span className="text-[#F8FAFC]">
                          {agentConfig.contentStrategy.contentTypes.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit button */}
                  <button
                    disabled
                    className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-[#1E293B] text-[#64748B] cursor-not-allowed opacity-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Configuration
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#64748B]">
                  No agent configuration found. Set up this agent using the
                  pipeline editor first.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right column (1/3) ── */}
      <div className="w-[380px] flex-shrink-0 space-y-6">
        {/* Agent Status Card */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={cn(
                "w-3 h-3 rounded-full",
                pipeline.status === "active"
                  ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  : pipeline.status === "paused"
                  ? "bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  : "bg-[#94A3B8]"
              )}
            />
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC]">
                {pipeline.status === "active"
                  ? "Agent Active"
                  : pipeline.status === "paused"
                  ? "Agent Paused"
                  : "Agent Draft"}
              </p>
              <p className="text-xs text-[#64748B]">
                Since {formatDate(pipeline.updatedAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onTogglePause}
            disabled={pipeline.status === "draft"}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg transition-colors",
              pipeline.status === "active"
                ? "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 hover:bg-[#F97316]/20"
                : pipeline.status === "paused"
                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981]/20"
                : "bg-[#1E293B] text-[#64748B] border border-[#1E293B] cursor-not-allowed"
            )}
          >
            {pipeline.status === "active" ? (
              <>
                <Pause className="w-4 h-4" /> Pause Agent
              </>
            ) : pipeline.status === "paused" ? (
              <>
                <Play className="w-4 h-4" /> Resume Agent
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" /> Draft
              </>
            )}
          </button>
        </div>

        {/* Connected Accounts */}
        {pipeline.assignedAccountIds.length > 0 && (
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
            <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
              Connected Accounts
            </h3>
            <div className="space-y-2">
              {pipeline.assignedAccountIds.map((accId) => {
                const acc = accounts.find((a) => a.id === accId);
                if (!acc) return null;
                return (
                  <div
                    key={accId}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[#0B0F19] border border-[#1E293B]"
                  >
                    {acc.avatarUrl ? (
                      <img
                        src={acc.avatarUrl}
                        alt={acc.handle}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[#64748B]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F8FAFC] truncate">
                        @{acc.handle}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {acc.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827]">
          <div className="px-5 py-4 border-b border-[#1E293B]">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              Recent Activity
            </h3>
          </div>

          {activityItems.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-[#64748B]">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E293B]">
              {activityItems.map((item) => (
                <ActivityFeedItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components for dashboard ── */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 flex items-center gap-3 hover:border-[#334155] transition-colors">
      <div className="w-10 h-10 rounded-lg bg-[#0B0F19] border border-[#1E293B] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-[#F8FAFC]">{value}</p>
        <p className="text-xs text-[#64748B]">{label}</p>
      </div>
    </div>
  );
}

function ContentQueueItem({
  post,
  onDelete,
}: {
  post: ContentPost;
  onDelete: () => void;
}) {
  const statusStyles: Record<string, string> = {
    queued: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
    scheduled: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20",
    published: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    draft: "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20",
    failed: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  };

  const typeStyles: Record<string, string> = {
    image: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
    carousel: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20",
    reel: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20",
    story: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20",
  };

  return (
    <div className="px-5 py-3 flex items-start gap-3 hover:bg-[#1E293B]/20 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border",
              typeStyles[post.type] ?? typeStyles.image
            )}
          >
            {post.type}
          </span>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded border",
              statusStyles[post.status] ?? statusStyles.draft
            )}
          >
            {post.status}
          </span>
          {post.scheduledAt && (
            <span className="text-[10px] text-[#64748B] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(post.scheduledAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-[#94A3B8] line-clamp-2 leading-relaxed">
          {post.caption || "No caption"}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
        <button
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function VoiceStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#0B0F19] rounded-lg border border-[#1E293B] p-2.5">
      <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#3B82F6] transition-all"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[#F8FAFC] tabular-nums">
          {value}
        </span>
      </div>
    </div>
  );
}

function ActivityFeedItem({
  item,
}: {
  item: {
    id: string;
    type:
      | "post_published"
      | "content_generated"
      | "agent_started"
      | "agent_paused";
    message: string;
    timestamp: string;
  };
}) {
  const iconMap = {
    post_published: (
      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
    ),
    content_generated: <Sparkles className="w-4 h-4 text-[#3B82F6]" />,
    agent_started: <Zap className="w-4 h-4 text-[#10B981]" />,
    agent_paused: <Pause className="w-4 h-4 text-[#F97316]" />,
  };

  const bgMap = {
    post_published: "bg-[#10B981]/10",
    content_generated: "bg-[#3B82F6]/10",
    agent_started: "bg-[#10B981]/10",
    agent_paused: "bg-[#F97316]/10",
  };

  return (
    <div className="px-5 py-3 flex items-start gap-3">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
          bgMap[item.type]
        )}
      >
        {iconMap[item.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F8FAFC]">{item.message}</p>
        <p className="text-xs text-[#64748B] mt-0.5">
          {timeAgo(item.timestamp)}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  PIPELINE EDIT VIEW (preserved from original)                     */
/* ══════════════════════════════════════════════════════════════════ */

interface PipelineEditViewProps {
  pipeline: Pipeline;
  setPipeline: React.Dispatch<React.SetStateAction<Pipeline>>;
  accounts: InstagramAccount[];
  pipelineName: string;
  setPipelineName: (name: string) => void;
  setSaveMessage: (msg: string | null) => void;
  onBackToDashboard: () => void;
}

function PipelineEditView({
  pipeline,
  setPipeline,
  accounts,
  pipelineName,
  setPipelineName,
  setSaveMessage,
  onBackToDashboard,
}: PipelineEditViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAgentPickerOpen, setIsAgentPickerOpen] = useState(false);
  const [mode, setMode] = useState<ExecutionMode>("build");
  const [aiProvider, setAiProvider] = useState<AIProvider>("anthropic");

  const selectedNode = selectedNodeId
    ? pipeline.nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  // Resolve account context from assigned accounts
  const assignedAccount =
    pipeline.assignedAccountIds.length > 0
      ? accounts.find((a) => a.id === pipeline.assignedAccountIds[0])
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
  const handleNodePositionChange = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      setPipeline((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) =>
          node.id === nodeId ? { ...node, position } : node
        ),
      }));
    },
    [setPipeline]
  );

  // --- Add node (opens picker) ---
  const handleAddNode = useCallback(() => {
    setIsAgentPickerOpen(true);
  }, []);

  // --- Agent type selected from picker ---
  const handleAgentTypeSelect = useCallback(
    (type: AgentType) => {
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
        const nodesWithOutgoing = new Set(
          pipeline.connections.map((c) => c.sourceNodeId)
        );
        const lastNode = [...pipeline.nodes]
          .reverse()
          .find((n) => !nodesWithOutgoing.has(n.id));
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
    },
    [pipeline.nodes, pipeline.connections, setPipeline]
  );

  // --- Update node (from config panel) ---
  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<AgentNode>) => {
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
    },
    [setPipeline]
  );

  // --- Delete node ---
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setPipeline((prev) => {
        const remainingNodes = prev.nodes.filter((n) => n.id !== nodeId);
        const incomingConn = prev.connections.find(
          (c) => c.targetNodeId === nodeId
        );
        const outgoingConn = prev.connections.find(
          (c) => c.sourceNodeId === nodeId
        );

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
    },
    [selectedNodeId, setPipeline]
  );

  // --- Assign accounts ---
  const handleAssignAccounts = useCallback(
    (accountIds: string[]) => {
      setPipeline((prev) => ({ ...prev, assignedAccountIds: accountIds }));
    },
    [setPipeline]
  );

  // --- Save as Draft ---
  const handleSaveAsDraft = useCallback(() => {
    setPipeline((prev) => ({
      ...prev,
      status: "draft",
      updatedAt: new Date().toISOString(),
    }));
    setSaveMessage("Saved as draft");
    setTimeout(() => setSaveMessage(null), 2000);
  }, [setPipeline, setSaveMessage]);

  // --- Deploy Agent ---
  const handleDeploy = useCallback(() => {
    const unconfiguredNodes = pipeline.nodes.filter(
      (n) => n.status !== "configured"
    );
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
    setPipeline((prev) => ({
      ...prev,
      status: "active",
      updatedAt: new Date().toISOString(),
    }));
    setSaveMessage("Pipeline deployed!");
    setTimeout(() => setSaveMessage(null), 2000);
  }, [pipeline.nodes, pipeline.assignedAccountIds, setPipeline, setSaveMessage]);

  // --- Pause / Resume ---
  const handleTogglePause = useCallback(() => {
    setPipeline((prev) => ({
      ...prev,
      status: prev.status === "active" ? "paused" : "active",
      updatedAt: new Date().toISOString(),
    }));
  }, [setPipeline]);

  // --- Run Pipeline ---
  const handleRunPipeline = useCallback(() => {
    if (!hasApiKey(aiProvider)) {
      setSaveMessage(
        `Add your ${
          aiProvider === "anthropic" ? "Anthropic" : "OpenAI"
        } API key in Settings first`
      );
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    setMode("execute");
    setSelectedNodeId(null);
    simulator.start();
  }, [simulator, aiProvider, setSaveMessage]);

  // --- Back to Builder ---
  const handleBackToBuilder = useCallback(() => {
    setMode("build");
    setSelectedNodeId(null);
  }, []);

  // Get the node run for the selected node (in execution mode)
  const selectedNodeRun =
    isExecutionMode && selectedNodeId && simulator.currentRun
      ? simulator.currentRun.nodeRuns.find(
          (nr) => nr.nodeId === selectedNodeId
        ) ?? null
      : null;

  // Determine if streaming text applies to the selected node
  const selectedStreamingText =
    isExecutionMode && selectedNodeId === simulator.activeNodeId
      ? simulator.streamingText
      : "";

  return (
    <>
      {/* Pipeline toolbar */}
      <div className="h-[52px] border-b border-[#1E293B] bg-[#111827]/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
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
                accounts={accounts}
              />

              {/* Pause/Resume */}
              {(pipeline.status === "active" ||
                pipeline.status === "paused") && (
                <button
                  onClick={handleTogglePause}
                  className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
                  title={
                    pipeline.status === "active"
                      ? "Pause pipeline"
                      : "Resume pipeline"
                  }
                >
                  {pipeline.status === "active" ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {pipeline.status === "active" ? "Pause" : "Resume"}
                </button>
              )}

              {/* Run Pipeline (only for active pipelines) */}
              {pipeline.status === "active" && (
                <div className="flex items-center gap-1">
                  {/* Provider selector */}
                  <select
                    value={aiProvider}
                    onChange={(e) =>
                      setAiProvider(e.target.value as AIProvider)
                    }
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

      {/* Agent picker wizard -- only in build mode */}
      {!isExecutionMode && (
        <AgentPicker
          open={isAgentPickerOpen}
          onClose={() => setIsAgentPickerOpen(false)}
          onSelect={handleAgentTypeSelect}
        />
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
    </>
  );
}
