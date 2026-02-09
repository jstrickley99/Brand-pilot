import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserSettings, upsertUserSettings } from "@/lib/db";

// GET /api/settings — get user settings
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getUserSettings(userId);
  return NextResponse.json({ success: true, settings });
}

// PUT /api/settings — create or update user settings
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  await upsertUserSettings({
    userId,
    niche: body.niche ?? "general",
    brandVoice: body.brandVoice ?? { toneFormality: 50, toneHumor: 50, toneInspiration: 50 },
    contentMix: body.contentMix ?? { educational: 25, inspirational: 25, entertaining: 25, promotional: 25 },
    postsPerDay: body.postsPerDay ?? 1,
    aiProvider: body.aiProvider ?? "anthropic",
    onboardingCompleted: body.onboardingCompleted ?? false,
  });

  return NextResponse.json({ success: true });
}
