import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

interface GenerateImageRequest {
  prompt: string;
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  style?: "natural" | "vivid";
}

interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateImageResponse>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiKey = request.headers.get("x-ai-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required. Add your OpenAI key in Settings." },
        { status: 401 }
      );
    }

    const body: GenerateImageRequest = await request.json();
    const { prompt, size = "1024x1024", style = "natural" } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    let imageUrl: string | undefined;

    try {
      const response = await client.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size,
        style,
      });
      imageUrl = response.data?.[0]?.url;
    } catch {
      // Fallback to dall-e-2 if dall-e-3 fails (e.g., unsupported features)
      const response = await client.images.generate({
        model: "dall-e-2",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      imageUrl = response.data?.[0]?.url;
    }

    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: "No image was generated. Please try again.",
      });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message });
  }
}
