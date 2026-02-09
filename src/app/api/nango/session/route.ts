import { NextResponse } from "next/server";
import { Nango } from "@nangohq/node";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

const HARDCODED_USER_ID = "brandpilot-user-1";

export async function POST() {
  try {
    const session = await nango.createConnectSession({
      end_user: {
        id: HARDCODED_USER_ID,
        email: "demo@brandpilot.ai",
        display_name: "BrandPilot Demo User",
      },
      allowed_integrations: ["instagram"],
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
