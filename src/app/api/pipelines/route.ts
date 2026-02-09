import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPipelines, createPipeline } from "@/lib/db";

// GET /api/pipelines — list all pipelines for the user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const pipelines = await getPipelines(userId);
  return NextResponse.json({ success: true, pipelines });
}

// POST /api/pipelines — create a new pipeline
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = body.name || "Untitled Pipeline";
  const id = await createPipeline(userId, name);

  if (!id) {
    return NextResponse.json({ success: false, error: "Failed to create pipeline" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
