import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { auth } from "@clerk/nextjs/server";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

const GRAPH_API_BASE = "https://graph.instagram.com/v21.0";

interface PublishRequest {
  caption: string;
  hashtags?: string[];
  imageUrl?: string;
}

interface PublishResponse {
  success: boolean;
  postId?: string;
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
    const { caption, hashtags, imageUrl } = body;

    if (!caption) {
      return NextResponse.json(
        { success: false, error: "Caption is required" },
        { status: 400 }
      );
    }

    // Build full caption with hashtags
    const fullCaption = hashtags?.length
      ? `${caption}\n\n${hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`
      : caption;

    // Get Instagram connection from Nango
    const connection = await nango.getConnection("instagram", userId);
    const accessToken = "access_token" in connection.credentials
      ? connection.credentials.access_token
      : undefined;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Instagram access token not found. Please reconnect your account." },
        { status: 401 }
      );
    }

    // Get the Instagram Business Account ID
    const igUserRes = await fetch(`${GRAPH_API_BASE}/me?fields=user_id&access_token=${accessToken}`);
    const igUserData = await igUserRes.json();

    if (igUserData.error) {
      return NextResponse.json(
        { success: false, error: `Instagram API error: ${igUserData.error.message}` },
        { status: 502 }
      );
    }

    const igUserId: string = igUserData.user_id ?? igUserData.id;

    if (!igUserId) {
      return NextResponse.json(
        { success: false, error: "Could not resolve Instagram Business Account ID" },
        { status: 502 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "imageUrl is required for Instagram posts" },
        { status: 400 }
      );
    }

    // Step 1: Create a media container
    const containerRes = await fetch(
      `${GRAPH_API_BASE}/${igUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: fullCaption,
          access_token: accessToken,
        }),
      }
    );
    const containerData = await containerRes.json();

    if (containerData.error) {
      return NextResponse.json(
        { success: false, error: `Failed to create media container: ${containerData.error.message}` },
        { status: 502 }
      );
    }

    const creationId: string = containerData.id;

    // Step 2: Publish the container
    const publishRes = await fetch(
      `${GRAPH_API_BASE}/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );
    const publishData = await publishRes.json();

    if (publishData.error) {
      return NextResponse.json(
        { success: false, error: `Failed to publish post: ${publishData.error.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: publishData.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
