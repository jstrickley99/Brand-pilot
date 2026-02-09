"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ContentCalendar } from "@/components/calendar/content-calendar";
import { getScheduledContent, StoredContent } from "@/lib/content-store";
import { ContentPost } from "@/lib/types";

function storedToPost(item: StoredContent): ContentPost {
  return {
    id: item.id,
    accountId: item.accountId,
    accountHandle: item.accountHandle,
    type: item.contentType,
    status: "scheduled",
    caption: item.caption,
    imageUrl: "",
    hashtags: item.hashtags,
    scheduledAt: item.scheduledFor || item.suggestedPostingTime,
    isRepost: false,
  };
}

export default function CalendarPage() {
  const [scheduledPosts, setScheduledPosts] = useState<ContentPost[]>([]);

  const loadScheduled = useCallback(() => {
    const items = getScheduledContent();
    setScheduledPosts(items.map(storedToPost));
  }, []);

  useEffect(() => {
    loadScheduled();
  }, [loadScheduled]);

  return (
    <div>
      <PageHeader title="Calendar" description="Visual content schedule across all accounts">
        <span className="text-sm border border-[#1E293B] rounded-full px-3 py-1.5 text-[#94A3B8]">
          {scheduledPosts.length} posts scheduled
        </span>
      </PageHeader>

      <ContentCalendar posts={scheduledPosts} />
    </div>
  );
}
