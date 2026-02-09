export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: "instagram" | "tiktok" | "youtube" | "facebook" | "twitter";
          handle: string;
          display_name: string;
          avatar_url: string | null;
          niche: string;
          status: "connected" | "disconnected" | "error" | "paused";
          followers: number;
          followers_growth: number;
          engagement_rate: number;
          posts_count: number;
          last_post_at: string | null;
          autonomy_level: "full_auto" | "semi_auto" | "approval_required";
          brand_voice: {
            toneFormality: number;
            toneHumor: number;
            toneInspiration: number;
            contentMix: { educational: number; inspirational: number; entertaining: number; promotional: number };
            hashtagStrategy: string[];
            postsPerDay: number;
            preferredPostingTimes: string[];
          };
          nango_connection_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["accounts"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
      };
      pipelines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: "draft" | "active" | "paused";
          nodes: Database["public"]["Tables"]["accounts"]["Row"]["brand_voice"] extends never ? never : unknown;
          connections: unknown;
          assigned_account_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pipelines"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pipelines"]["Insert"]>;
      };
      content: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          account_handle: string;
          content_type: "image" | "carousel" | "reel" | "story";
          status: "draft" | "queued" | "scheduled" | "published" | "failed";
          caption: string;
          image_url: string | null;
          hashtags: string[];
          scheduled_at: string | null;
          published_at: string | null;
          likes: number;
          comments: number;
          reach: number;
          impressions: number;
          is_repost: boolean;
          original_creator: string | null;
          ai_provider: "anthropic" | "openai" | null;
          pipeline_run_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["content"]["Row"], "id" | "created_at" | "updated_at" | "likes" | "comments" | "reach" | "impressions"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          likes?: number;
          comments?: number;
          reach?: number;
          impressions?: number;
        };
        Update: Partial<Database["public"]["Tables"]["content"]["Insert"]>;
      };
      pipeline_runs: {
        Row: {
          id: string;
          user_id: string;
          pipeline_id: string;
          status: "running" | "completed" | "stopped" | "error";
          started_at: string;
          completed_at: string | null;
          duration_ms: number;
          node_runs: unknown;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pipeline_runs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pipeline_runs"]["Insert"]>;
      };
      user_settings: {
        Row: {
          user_id: string;
          niche: string;
          brand_voice: {
            toneFormality: number;
            toneHumor: number;
            toneInspiration: number;
          };
          content_mix: {
            educational: number;
            inspirational: number;
            entertaining: number;
            promotional: number;
          };
          posts_per_day: number;
          ai_provider: "anthropic" | "openai";
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_settings"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Insert"]>;
      };
    };
  };
}
