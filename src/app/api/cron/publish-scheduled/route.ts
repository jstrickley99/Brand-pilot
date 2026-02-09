import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { publishContent, type ContentRow } from "@/lib/publishers";

export const dynamic = "force-dynamic";

interface CronResult {
  processed: number;
  published: number;
  failed: number;
  errors: { contentId: string; error: string }[];
}

export async function GET(request: NextRequest): Promise<NextResponse<CronResult | { error: string }>> {
  // Verify cron secret from header or query param
  const secret =
    request.headers.get("x-cron-secret") ||
    request.nextUrl.searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: CronResult = { processed: 0, published: 0, failed: 0, errors: [] };

  try {
    // Find all scheduled content whose scheduled_at is in the past
    const { data: duePosts, error: queryError } = await supabase
      .from("content")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString());

    if (queryError) {
      return NextResponse.json(
        { error: `Database query failed: ${queryError.message}` },
        { status: 500 }
      );
    }

    if (!duePosts || duePosts.length === 0) {
      return NextResponse.json(result);
    }

    for (const post of duePosts) {
      result.processed++;

      const row: ContentRow = {
        id: post.id,
        user_id: post.user_id,
        caption: post.caption ?? "",
        hashtags: post.hashtags ?? [],
        image_url: post.image_url ?? null,
        target_platform: post.target_platform ?? null,
        content_type: post.content_type,
      };

      try {
        await publishContent(row);

        // Mark as published
        await supabase
          .from("content")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
          })
          .eq("id", post.id);

        result.published++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        // Mark as failed
        await supabase
          .from("content")
          .update({ status: "failed" })
          .eq("id", post.id);

        result.failed++;
        result.errors.push({ contentId: post.id, error: message });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Unexpected error: ${message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
