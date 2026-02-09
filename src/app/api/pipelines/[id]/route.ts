import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPipeline, updatePipeline, deletePipeline } from "@/lib/db";

// GET /api/pipelines/:id — get a single pipeline
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pipeline = await getPipeline(userId, id);

  if (!pipeline) {
    return NextResponse.json({ success: false, error: "Pipeline not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, pipeline });
}

// PATCH /api/pipelines/:id — update a pipeline
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const ok = await updatePipeline(userId, id, body);
  if (!ok) {
    return NextResponse.json({ success: false, error: "Failed to update pipeline" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/pipelines/:id — delete a pipeline
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deletePipeline(userId, id);
  if (!ok) {
    return NextResponse.json({ success: false, error: "Failed to delete pipeline" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
