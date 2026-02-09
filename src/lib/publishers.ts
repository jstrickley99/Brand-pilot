import { Nango } from "@nangohq/node";
import type { Platform } from "./types";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function getNangoAccessToken(
  platform: string,
  userId: string
): Promise<string> {
  const connection = await nango.getConnection(platform, userId);
  const accessToken =
    "access_token" in connection.credentials
      ? connection.credentials.access_token
      : undefined;

  if (!accessToken) {
    throw new Error(
      `${platform} access token not found for user ${userId}. Account may need reconnecting.`
    );
  }
  return accessToken;
}

// ---------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------

const GRAPH_API_BASE = "https://graph.instagram.com/v21.0";

export interface InstagramPublishInput {
  caption: string;
  hashtags?: string[];
  imageUrl: string;
}

export async function publishToInstagram(
  userId: string,
  input: InstagramPublishInput
): Promise<{ postId: string }> {
  const accessToken = await getNangoAccessToken("instagram", userId);

  const fullCaption = input.hashtags?.length
    ? `${input.caption}\n\n${input.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`
    : input.caption;

  // Resolve Instagram Business Account ID
  const igUserRes = await fetch(
    `${GRAPH_API_BASE}/me?fields=user_id&access_token=${accessToken}`
  );
  const igUserData = await igUserRes.json();

  if (igUserData.error) {
    throw new Error(`Instagram API error: ${igUserData.error.message}`);
  }

  const igUserId: string = igUserData.user_id ?? igUserData.id;
  if (!igUserId) {
    throw new Error("Could not resolve Instagram Business Account ID");
  }

  // Create media container
  const containerRes = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: input.imageUrl,
      caption: fullCaption,
      access_token: accessToken,
    }),
  });
  const containerData = await containerRes.json();

  if (containerData.error) {
    throw new Error(
      `Failed to create media container: ${containerData.error.message}`
    );
  }

  // Publish the container
  const publishRes = await fetch(
    `${GRAPH_API_BASE}/${igUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken,
      }),
    }
  );
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(`Failed to publish post: ${publishData.error.message}`);
  }

  return { postId: publishData.id };
}

// ---------------------------------------------------------------------------
// YouTube
// ---------------------------------------------------------------------------

const YOUTUBE_UPLOAD_BASE =
  "https://www.googleapis.com/upload/youtube/v3/videos";

export interface YouTubePublishInput {
  title: string;
  description: string;
  tags?: string[];
  videoUrl: string;
  privacyStatus?: "public" | "unlisted" | "private";
}

export async function publishToYouTube(
  userId: string,
  input: YouTubePublishInput
): Promise<{ videoId: string }> {
  const accessToken = await getNangoAccessToken("youtube", userId);

  // Fetch video bytes
  const videoRes = await fetch(input.videoUrl);
  if (!videoRes.ok) {
    throw new Error(
      `Failed to fetch video from URL: ${videoRes.statusText}`
    );
  }

  const videoBlob = await videoRes.blob();
  const contentType = videoRes.headers.get("content-type") || "video/*";

  const metadata = {
    snippet: {
      title: input.title,
      description: input.description,
      ...(input.tags?.length ? { tags: input.tags } : {}),
    },
    status: {
      privacyStatus: input.privacyStatus || "private",
    },
  };

  // Initiate resumable upload
  const initRes = await fetch(
    `${YOUTUBE_UPLOAD_BASE}?uploadType=resumable&part=snippet,status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(videoBlob.size),
        "X-Upload-Content-Type": contentType,
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initRes.ok) {
    const errBody = await initRes.json().catch(() => null);
    const errMsg =
      errBody?.error?.message || initRes.statusText || "Unknown error";
    throw new Error(
      `YouTube API error when initiating upload: ${errMsg}`
    );
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) {
    throw new Error("YouTube did not return a resumable upload URL");
  }

  // Upload video bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(videoBlob.size),
    },
    body: videoBlob,
  });

  if (!uploadRes.ok) {
    const errBody = await uploadRes.json().catch(() => null);
    const errMsg =
      errBody?.error?.message || uploadRes.statusText || "Unknown error";
    throw new Error(`Failed to upload video to YouTube: ${errMsg}`);
  }

  const uploadData = await uploadRes.json();
  if (!uploadData.id) {
    throw new Error(
      "YouTube upload succeeded but no video ID was returned"
    );
  }

  return { videoId: uploadData.id };
}

// ---------------------------------------------------------------------------
// TikTok
// ---------------------------------------------------------------------------

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

export interface TikTokPublishInput {
  title: string;
  videoUrl: string;
  privacyLevel?:
    | "PUBLIC_TO_EVERYONE"
    | "MUTUAL_FOLLOW_FRIENDS"
    | "FOLLOWER_OF_CREATOR"
    | "SELF_ONLY";
}

export async function publishToTikTok(
  userId: string,
  input: TikTokPublishInput
): Promise<{ publishId: string }> {
  const accessToken = await getNangoAccessToken("tiktok", userId);

  const initRes = await fetch(
    `${TIKTOK_API_BASE}/post/publish/video/init/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: input.title,
          privacy_level: input.privacyLevel || "SELF_ONLY",
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: input.videoUrl,
        },
      }),
    }
  );

  const initData = await initRes.json();

  if (initData.error?.code) {
    throw new Error(
      `TikTok API error: ${initData.error.message || initData.error.code}`
    );
  }

  const publishId: string | undefined = initData.data?.publish_id;
  if (!publishId) {
    throw new Error("TikTok did not return a publish ID");
  }

  return { publishId };
}

// ---------------------------------------------------------------------------
// Dispatcher — pick the right publisher by platform name
// ---------------------------------------------------------------------------

export interface ContentRow {
  id: string;
  user_id: string;
  caption: string;
  hashtags: string[];
  image_url: string | null;
  target_platform: Platform | null;
  content_type: string;
}

export async function publishContent(row: ContentRow): Promise<void> {
  const platform = row.target_platform;

  switch (platform) {
    case "instagram": {
      if (!row.image_url) throw new Error("imageUrl is required for Instagram");
      await publishToInstagram(row.user_id, {
        caption: row.caption,
        hashtags: row.hashtags,
        imageUrl: row.image_url,
      });
      break;
    }
    case "youtube": {
      if (!row.image_url) throw new Error("videoUrl is required for YouTube");
      await publishToYouTube(row.user_id, {
        title: row.caption.slice(0, 100),
        description: row.caption,
        videoUrl: row.image_url,
      });
      break;
    }
    case "tiktok": {
      if (!row.image_url) throw new Error("videoUrl is required for TikTok");
      await publishToTikTok(row.user_id, {
        title: row.caption.slice(0, 150),
        videoUrl: row.image_url,
      });
      break;
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
