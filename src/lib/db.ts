import { supabase } from "./supabase";
import type {
  Pipeline,
  AgentNode,
  PipelineConnection,
  ContentPost,
  InstagramAccount,
  BrandVoice,
  ContentMix,
  Niche,
  AIProvider,
} from "./types";

// ---------------------------------------------------------------------------
// User Settings
// ---------------------------------------------------------------------------

export interface UserSettings {
  userId: string;
  niche: Niche;
  brandVoice: { toneFormality: number; toneHumor: number; toneInspiration: number };
  contentMix: ContentMix;
  postsPerDay: number;
  aiProvider: AIProvider;
  onboardingCompleted: boolean;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    userId: data.user_id,
    niche: data.niche as Niche,
    brandVoice: data.brand_voice as UserSettings["brandVoice"],
    contentMix: data.content_mix as ContentMix,
    postsPerDay: data.posts_per_day,
    aiProvider: data.ai_provider as AIProvider,
    onboardingCompleted: data.onboarding_completed,
  };
}

export async function upsertUserSettings(settings: UserSettings): Promise<void> {
  await supabase.from("user_settings").upsert({
    user_id: settings.userId,
    niche: settings.niche,
    brand_voice: settings.brandVoice,
    content_mix: settings.contentMix,
    posts_per_day: settings.postsPerDay,
    ai_provider: settings.aiProvider,
    onboarding_completed: settings.onboardingCompleted,
  });
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export async function getAccounts(userId: string): Promise<InstagramAccount[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url || "",
    niche: row.niche as Niche,
    status: row.status as InstagramAccount["status"],
    followers: row.followers,
    followersGrowth: row.followers_growth,
    engagementRate: row.engagement_rate,
    postsCount: row.posts_count,
    lastPostAt: row.last_post_at || "",
    autonomyLevel: row.autonomy_level as InstagramAccount["autonomyLevel"],
    brandVoice: row.brand_voice as BrandVoice,
  }));
}

export async function createAccount(
  userId: string,
  account: {
    platform: string;
    handle: string;
    displayName: string;
    niche: string;
    nangoConnectionId?: string;
  }
): Promise<string | null> {
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      platform: account.platform,
      handle: account.handle,
      display_name: account.displayName,
      niche: account.niche,
      nango_connection_id: account.nangoConnectionId || null,
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id;
}

export async function deleteAccount(userId: string, accountId: string): Promise<boolean> {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", userId);

  return !error;
}

// ---------------------------------------------------------------------------
// Pipelines
// ---------------------------------------------------------------------------

export async function getPipelines(userId: string): Promise<Pipeline[]> {
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status as Pipeline["status"],
    nodes: (row.nodes as AgentNode[]) || [],
    connections: (row.connections as PipelineConnection[]) || [],
    assignedAccountIds: row.assigned_account_ids || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getPipeline(userId: string, pipelineId: string): Promise<Pipeline | null> {
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("id", pipelineId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    status: data.status as Pipeline["status"],
    nodes: (data.nodes as AgentNode[]) || [],
    connections: (data.connections as PipelineConnection[]) || [],
    assignedAccountIds: data.assigned_account_ids || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createPipeline(userId: string, name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("pipelines")
    .insert({
      user_id: userId,
      name,
      status: "draft",
      nodes: [],
      connections: [],
      assigned_account_ids: [],
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id;
}

export async function updatePipeline(
  userId: string,
  pipelineId: string,
  updates: {
    name?: string;
    status?: string;
    nodes?: AgentNode[];
    connections?: PipelineConnection[];
    assignedAccountIds?: string[];
  }
): Promise<boolean> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.nodes !== undefined) payload.nodes = updates.nodes;
  if (updates.connections !== undefined) payload.connections = updates.connections;
  if (updates.assignedAccountIds !== undefined) payload.assigned_account_ids = updates.assignedAccountIds;

  const { error } = await supabase
    .from("pipelines")
    .update(payload)
    .eq("id", pipelineId)
    .eq("user_id", userId);

  return !error;
}

export async function deletePipeline(userId: string, pipelineId: string): Promise<boolean> {
  const { error } = await supabase
    .from("pipelines")
    .delete()
    .eq("id", pipelineId)
    .eq("user_id", userId);

  return !error;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export async function getContent(
  userId: string,
  options?: { status?: string; limit?: number }
): Promise<ContentPost[]> {
  let query = supabase
    .from("content")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    accountId: row.account_id || "",
    accountHandle: row.account_handle,
    type: row.content_type as ContentPost["type"],
    status: row.status as ContentPost["status"],
    caption: row.caption,
    imageUrl: row.image_url || "",
    hashtags: row.hashtags || [],
    scheduledAt: row.scheduled_at || "",
    publishedAt: row.published_at || undefined,
    likes: row.likes,
    comments: row.comments,
    reach: row.reach,
    impressions: row.impressions,
    isRepost: row.is_repost,
    originalCreator: row.original_creator || undefined,
    targetPlatform: row.target_platform || undefined,
  }));
}

export async function createContent(
  userId: string,
  content: {
    accountId?: string;
    accountHandle: string;
    contentType: string;
    status: string;
    caption: string;
    hashtags: string[];
    scheduledAt?: string;
    aiProvider?: string;
    pipelineRunId?: string;
  }
): Promise<string | null> {
  const { data, error } = await supabase
    .from("content")
    .insert({
      user_id: userId,
      account_id: content.accountId || null,
      account_handle: content.accountHandle,
      content_type: content.contentType,
      status: content.status,
      caption: content.caption,
      hashtags: content.hashtags,
      scheduled_at: content.scheduledAt || null,
      ai_provider: content.aiProvider || null,
      pipeline_run_id: content.pipelineRunId || null,
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id;
}

export async function updateContentStatus(
  userId: string,
  contentId: string,
  status: string,
  extra?: { scheduledAt?: string | null; targetPlatform?: string | null }
): Promise<boolean> {
  const payload: Record<string, unknown> = { status };
  if (status === "published") {
    payload.published_at = new Date().toISOString();
  }
  if (extra?.scheduledAt !== undefined) {
    payload.scheduled_at = extra.scheduledAt;
  }
  if (extra?.targetPlatform !== undefined) {
    payload.target_platform = extra.targetPlatform;
  }

  const { error } = await supabase
    .from("content")
    .update(payload)
    .eq("id", contentId)
    .eq("user_id", userId);

  return !error;
}

export async function deleteContent(userId: string, contentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("content")
    .delete()
    .eq("id", contentId)
    .eq("user_id", userId);

  return !error;
}

// ---------------------------------------------------------------------------
// Pipeline Runs
// ---------------------------------------------------------------------------

export async function savePipelineRun(
  userId: string,
  run: {
    pipelineId: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    durationMs: number;
    nodeRuns: unknown;
  }
): Promise<string | null> {
  const { data, error } = await supabase
    .from("pipeline_runs")
    .insert({
      user_id: userId,
      pipeline_id: run.pipelineId,
      status: run.status,
      started_at: run.startedAt,
      completed_at: run.completedAt || null,
      duration_ms: run.durationMs,
      node_runs: run.nodeRuns,
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id;
}

export async function getPipelineRuns(
  userId: string,
  pipelineId: string,
  limit = 10
): Promise<Array<{
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number;
  nodeRuns: unknown;
}>> {
  const { data, error } = await supabase
    .from("pipeline_runs")
    .select("*")
    .eq("user_id", userId)
    .eq("pipeline_id", pipelineId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationMs: row.duration_ms,
    nodeRuns: row.node_runs,
  }));
}
