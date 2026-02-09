import { NextRequest, NextResponse } from "next/server";
import { Nango } from "@nangohq/node";

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY! });

const HARDCODED_USER_ID = "brandpilot-user-1";

export async function GET(request: NextRequest) {
  try {
    const providerConfigKey = request.nextUrl.searchParams.get("provider") || "instagram";

    const connection = await nango.getConnection(providerConfigKey, HARDCODED_USER_ID);

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
