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

export type ContentStatus = "queued" | "published" | "draft" | "failed";

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
