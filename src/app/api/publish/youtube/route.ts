import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { auth } from "@clerk/nextjs/server";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

const YOUTUBE_UPLOAD_BASE =
  "https://www.googleapis.com/upload/youtube/v3/videos";

interface PublishRequest {
  title: string;
  description: string;
  tags?: string[];
  videoUrl: string;
  privacyStatus?: "public" | "unlisted" | "private";
}

interface PublishResponse {
  success: boolean;
  videoId?: string;
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
    const { title, description, tags, videoUrl, privacyStatus } = body;

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

    // Get YouTube connection from Nango
    const connection = await nango.getConnection("youtube", userId);
    const accessToken =
      "access_token" in connection.credentials
        ? connection.credentials.access_token
        : undefined;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "YouTube access token not found. Please reconnect your account.",
        },
        { status: 401 }
      );
    }

    // Step 1: Fetch the video content from the provided URL
    const videoRes = await fetch(videoUrl);

    if (!videoRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch video from URL: ${videoRes.statusText}`,
        },
        { status: 400 }
      );
    }

    const videoBlob = await videoRes.blob();
    const contentType = videoRes.headers.get("content-type") || "video/*";

    // Step 2: Initiate a resumable upload session
    const metadata = {
      snippet: {
        title,
        description,
        ...(tags?.length ? { tags } : {}),
      },
      status: {
        privacyStatus: privacyStatus || "private",
      },
    };

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
      return NextResponse.json(
        {
          success: false,
          error: `YouTube API error when initiating upload: ${errMsg}`,
        },
        { status: 502 }
      );
    }

    const uploadUrl = initRes.headers.get("location");

    if (!uploadUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "YouTube did not return a resumable upload URL",
        },
        { status: 502 }
      );
    }

    // Step 3: Upload the video bytes to the resumable session URL
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
      return NextResponse.json(
        {
          success: false,
          error: `Failed to upload video to YouTube: ${errMsg}`,
        },
        { status: 502 }
      );
    }

    const uploadData = await uploadRes.json();

    if (!uploadData.id) {
      return NextResponse.json(
        {
          success: false,
          error: "YouTube upload succeeded but no video ID was returned",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId: uploadData.id,
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
