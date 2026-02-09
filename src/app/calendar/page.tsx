"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ContentCalendar } from "@/components/calendar/content-calendar";
import { ContentPost } from "@/lib/types";

export default function CalendarPage() {
  const [scheduledPosts, setScheduledPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScheduled() {
      try {
        const res = await fetch("/api/content?status=scheduled");
        if (!res.ok) throw new Error("Failed to fetch scheduled content");
        const json = await res.json();
        if (json.success && Array.isArray(json.content)) {
          setScheduledPosts(json.content);
        }
      } catch {
        // silently fall back to empty list
      } finally {
        setLoading(false);
      }
    }
    fetchScheduled();
  }, []);

  return (
    <div>
      <PageHeader title="Calendar" description="Visual content schedule across all accounts">
        <span className="text-sm border border-[#1E293B] rounded-full px-3 py-1.5 text-[#94A3B8]">
          {loading ? "Loading..." : `${scheduledPosts.length} posts scheduled`}
        </span>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-[#94A3B8]">
          Loading scheduled content...
        </div>
      ) : (
        <ContentCalendar posts={scheduledPosts} />
      )}
    </div>
  );
}
