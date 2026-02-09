import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { auth } from "@clerk/nextjs/server";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

interface PublishRequest {
  title: string;
  videoUrl: string;
  privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  disableComment?: boolean;
  disableDuet?: boolean;
  disableStitch?: boolean;
}

interface PublishResponse {
  success: boolean;
  publishId?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<PublishResponse>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body: PublishRequest = await request.json();
    const { title, videoUrl, privacyLevel, disableComment, disableDuet, disableStitch } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "videoUrl is required" },
        { status: 400 }
      );
    }

    // Get TikTok connection from Nango
    const connection = await nango.getConnection("tiktok", userId);
    const accessToken =
      "access_token" in connection.credentials
        ? connection.credentials.access_token
        : undefined;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "TikTok access token not found. Please reconnect your account.",
        },
        { status: 401 }
      );
    }

    // Initialize video post using PULL_FROM_URL (TikTok fetches the video)
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
            title,
            privacy_level: privacyLevel || "SELF_ONLY",
            disable_comment: disableComment ?? false,
            disable_duet: disableDuet ?? false,
            disable_stitch: disableStitch ?? false,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: videoUrl,
          },
        }),
      }
    );

    const initData = await initRes.json();

    if (initData.error?.code) {
      return NextResponse.json(
        {
          success: false,
          error: `TikTok API error: ${initData.error.message || initData.error.code}`,
        },
        { status: 502 }
      );
    }

    const publishId: string | undefined = initData.data?.publish_id;

    if (!publishId) {
      return NextResponse.json(
        {
          success: false,
          error: "TikTok did not return a publish ID",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      publishId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
