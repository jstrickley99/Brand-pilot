import { NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { auth } from "@clerk/nextjs/server";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

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
