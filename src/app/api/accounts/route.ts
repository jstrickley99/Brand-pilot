import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAccounts, createAccount, deleteAccount } from "@/lib/db";

// GET /api/accounts — list all accounts
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await getAccounts(userId);
  return NextResponse.json({ success: true, accounts });
}

// POST /api/accounts — create a new account
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = await createAccount(userId, body);

  if (!id) {
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}

// DELETE /api/accounts?id=xxx
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
  }

  const ok = await deleteAccount(userId, id);
  if (!ok) {
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
