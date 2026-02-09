export type AccountStatus = "connected" | "disconnected" | "error" | "paused";

export type Niche =
  | "fitness"
  | "motivation"
  | "luxury"
  | "memes"
  | "tech"
  | "food"
  | "travel"
  | "fashion"
  | "custom";

export type ContentType = "image" | "carousel" | "reel" | "story";

export type ContentStatus = "queued" | "scheduled" | "published" | "draft" | "failed";

export type AutonomyLevel = "full_auto" | "semi_auto" | "approval_required";

export interface InstagramAccount {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  niche: Niche;
  status: AccountStatus;
  followers: number;
  followersGrowth: number;
  engagementRate: number;
  postsCount: number;
  lastPostAt: string;
  autonomyLevel: AutonomyLevel;
  brandVoice: BrandVoice;
}

export interface BrandVoice {
  toneFormality: number;
  toneHumor: number;
  toneInspiration: number;
  contentMix: ContentMix;
  hashtagStrategy: string[];
  postsPerDay: number;
  preferredPostingTimes: string[];
}

export interface ContentMix {
  educational: number;
  inspirational: number;
  entertaining: number;
  promotional: number;
}

export interface ContentPost {
  id: string;
  accountId: string;
  accountHandle: string;
  type: ContentType;
  status: ContentStatus;
  caption: string;
  imageUrl: string;
  hashtags: string[];
  scheduledAt: string;
  publishedAt?: string;
  likes?: number;
  comments?: number;
  reach?: number;
  impressions?: number;
  isRepost: boolean;
  originalCreator?: string;
}

export interface CreditBalance {
  total: number;
  used: number;
  remaining: number;
  plan: "starter" | "growth" | "scale";
}

export interface DashboardStats {
  totalAccounts: number;
  totalFollowers: number;
  avgEngagementRate: number;
  creditsRemaining: number;
  postsThisWeek: number;
  followersGainedThisWeek: number;
}

export interface ActivityItem {
  id: string;
  type: "post_published" | "content_generated" | "account_connected" | "engagement" | "milestone";
  message: string;
  accountHandle?: string;
  timestamp: string;
}

export interface AnalyticsData {
  followerGrowth: { date: string; followers: number }[];
  engagementByDay: { date: string; rate: number }[];
  contentPerformance: { type: ContentType; avgLikes: number; avgComments: number; avgReach: number }[];
  topPosts: ContentPost[];
}

// Agent & Pipeline types

export type AgentType =
  | "content_researcher"
  | "content_writer"
  | "hashtag_generator"
  | "media_creator"
  | "scheduler"
  | "publisher"
  | "engagement_bot"
  | "analytics_monitor";

export type AgentNodeStatus = "unconfigured" | "configured" | "error";

export type PipelineStatus = "draft" | "active" | "paused";

export interface ContentResearcherConfig {
  topics: string[];
  competitorAccounts: string[];
  trendSources: {
    tiktokTrending: boolean;
    instagramExplore: boolean;
    industryNews: boolean;
  };
}

export interface ContentWriterConfig {
  personaName: string;
  personalityDescription: string;
  writingTone: string;
  languagePreferences: string;
  emojiUsage: "none" | "minimal" | "moderate" | "heavy";
  examplePosts: string[];
}

export interface HashtagGeneratorConfig {
  strategy: "max_reach" | "niche_specific" | "mixed";
  bannedHashtags: string[];
  hashtagCountMin: number;
  hashtagCountMax: number;
}

export interface MediaCreatorConfig {
  visualStyle: string;
  brandColors: string[];
  contentFormats: ("reels" | "carousels" | "stories")[];
}

export interface SchedulerConfig {
  activeDays: string[];
  postingWindowStart: string;
  postingWindowEnd: string;
  timezone: string;
  postsPerDay: number;
}

export interface PublisherConfig {
  accountIds: string[];
  crossPostingEnabled: boolean;
}

export interface EngagementBotConfig {
  replyTone: string;
  autoReplyTriggers: ("keywords" | "all_comments" | "questions_only")[];
  triggerKeywords: string[];
  dmAutoResponse: boolean;
  dmTemplates: string[];
}

export interface AnalyticsMonitorConfig {
  metricsToTrack: ("followers" | "engagement_rate" | "reach" | "saves")[];
  reportingFrequency: "daily" | "weekly";
  performanceThresholds: {
    minEngagementRate: number;
    minReach: number;
  };
}

export type AgentNodeConfig =
  | ContentResearcherConfig
  | ContentWriterConfig
  | HashtagGeneratorConfig
  | MediaCreatorConfig
  | SchedulerConfig
  | PublisherConfig
  | EngagementBotConfig
  | AnalyticsMonitorConfig;

export interface AgentNode {
  id: string;
  type: AgentType;
  name: string;
  position: { x: number; y: number };
  config: AgentNodeConfig | null;
  status: AgentNodeStatus;
  autonomyLevel: AutonomyLevel;
  isActive: boolean;
}

export interface PipelineConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface Pipeline {
  id: string;
  name: string;
  status: PipelineStatus;
  nodes: AgentNode[];
  connections: PipelineConnection[];
  assignedAccountIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentTypeMeta {
  type: AgentType;
  label: string;
  description: string;
  iconName: string;
  accentColor: string;
}

export const AGENT_TYPE_META: AgentTypeMeta[] = [
  {
    type: "content_researcher",
    label: "Content Researcher",
    description: "Finds trending topics, competitor analysis, niche research",
    iconName: "Search",
    accentColor: "#8B5CF6",
  },
  {
    type: "content_writer",
    label: "Content Writer",
    description: "Generates captions, scripts, copy with your brand voice",
    iconName: "PenTool",
    accentColor: "#3B82F6",
  },
  {
    type: "hashtag_generator",
    label: "Hashtag Generator",
    description: "Researches and selects optimal hashtags",
    iconName: "Hash",
    accentColor: "#10B981",
  },
  {
    type: "media_creator",
    label: "Image/Video Creator",
    description: "Generates or selects visual content",
    iconName: "Image",
    accentColor: "#F97316",
  },
  {
    type: "scheduler",
    label: "Scheduler",
    description: "Determines optimal posting times and queues content",
    iconName: "Clock",
    accentColor: "#EAB308",
  },
  {
    type: "publisher",
    label: "Publisher",
    description: "Posts content to connected accounts",
    iconName: "Send",
    accentColor: "#EC4899",
  },
  {
    type: "engagement_bot",
    label: "Engagement Bot",
    description: "Auto-replies to comments, DMs, follows/unfollows",
    iconName: "MessageCircle",
    accentColor: "#14B8A6",
  },
  {
    type: "analytics_monitor",
    label: "Analytics Monitor",
    description: "Tracks performance and feeds insights back",
    iconName: "BarChart3",
    accentColor: "#6366F1",
  },
];

// Execution types

export type NodeRunStatus = "idle" | "running" | "complete" | "error" | "cancelled" | "skipped";

export type PipelineRunStatus = "running" | "completed" | "stopped" | "error";

export type ExecutionMode = "build" | "execute";

export interface NodeRun {
  nodeId: string;
  status: NodeRunStatus;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  output: string[];
  result: string | null;
  error: string | null;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: PipelineRunStatus;
  startedAt: string;
  completedAt: string | null;
  duration: number;
  nodeRuns: NodeRun[];
}

export type Platform = "youtube" | "instagram" | "facebook" | "tiktok" | "twitter";

export interface PlatformConnection {
  id: string;
  platform: Platform;
  connected: boolean;
  description: string;
  infoNotice?: string;
  requiresPro?: boolean;
}

export interface ConnectionLimit {
  current: number;
  max: number;
}

export type AIProvider = "anthropic" | "openai";

export interface GenerateContentRequest {
  provider: AIProvider;
  accountId: string;
  contentType: ContentType;
  prompt: string;
  niche: Niche;
  brandVoice: BrandVoice;
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  suggestedPostingTime: string;
  provider: AIProvider;
}

export interface GenerateContentResponse {
  success: boolean;
  content?: GeneratedContent;
  error?: string;
}

export type OnboardingStep = "welcome" | "niche" | "connect" | "configure";

export interface OnboardingData {
  niche: Niche | null;
  connectedPlatforms: string[];
  brandVoice: { toneFormality: number; toneHumor: number; toneInspiration: number };
  contentMix: ContentMix;
  postsPerDay: number;
}

export interface NangoConnectionMeta {
  connectionId: string;
  providerConfigKey: string;
  connected: boolean;
  username?: string;
  profilePicUrl?: string;
  connectedAt?: string;
}
