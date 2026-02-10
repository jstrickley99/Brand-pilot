import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";
import { auth } from "@clerk/nextjs/server";

function isNangoConfigured(): boolean {
  const key = process.env.NANGO_SECRET_KEY;
  return !!key && key !== "your-nango-secret-key" && key.length > 10;
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isNangoConfigured()) {
    return NextResponse.json({
      success: true,
      connected: false,
      provider: request.nextUrl.searchParams.get("provider") || "instagram",
    });
  }

  const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

  try {
    const providerConfigKey = request.nextUrl.searchParams.get("provider") || "instagram";

    const connection = await nango.getConnection(providerConfigKey, userId);

    return NextResponse.json({
      success: true,
      connected: true,
      connectionId: connection.connection_id,
      provider: connection.provider_config_key,
      metadata: connection.metadata || {},
    });
  } catch {
    // Nango throws if connection doesn't exist — that's a valid "not connected" state
    return NextResponse.json({
      success: true,
      connected: false,
      provider: request.nextUrl.searchParams.get("provider") || "instagram",
    });
  }
}
