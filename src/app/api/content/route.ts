import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getContent, createContent, updateContentStatus, deleteContent } from "@/lib/db";

// GET /api/content?status=draft&limit=50
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);

  const content = await getContent(userId, { status, limit });
  return NextResponse.json({ success: true, content });
}

// POST /api/content — create new content
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = await createContent(userId, body);

  if (!id) {
    return NextResponse.json({ success: false, error: "Failed to create content" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}

// PATCH /api/content — update content status
export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ success: false, error: "id and status required" }, { status: 400 });
  }

  const ok = await updateContentStatus(userId, id, status);
  if (!ok) {
    return NextResponse.json({ success: false, error: "Failed to update content" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/content?id=xxx
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
  }

  const ok = await deleteContent(userId, id);
  if (!ok) {
    return NextResponse.json({ success: false, error: "Failed to delete content" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
