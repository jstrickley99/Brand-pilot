import { NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { auth } from "@clerk/nextjs/server";

function isNangoConfigured(): boolean {
  const key = process.env.NANGO_SECRET_KEY;
  return !!key && key !== "your-nango-secret-key" && key.length > 10;
}

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isNangoConfigured()) {
    return NextResponse.json(
      { success: false, error: "OAuth not configured. Add your Nango secret key in environment variables." },
      { status: 503 }
    );
  }

  const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

  try {
    const session = await nango.createConnectSession({
      end_user: {
        id: userId,
        display_name: "BrandPilot User",
      },
      allowed_integrations: ["instagram", "tiktok", "youtube"],
    });

    return NextResponse.json({
      success: true,
      sessionToken: session.data.token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create Nango session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
