import type { ContentPost, Platform } from "./types";

export type StoredContentStatus = "draft" | "queued" | "scheduled" | "published" | "failed";

// Re-export ContentPost as StoredContent for backwards compatibility in imports
export type StoredContent = ContentPost;

export async function saveGeneratedContent(content: {
  caption: string;
  hashtags: string[];
  suggestedPostingTime: string;
  provider: string;
  contentType: string;
  accountId: string;
  accountHandle: string;
}): Promise<string | null> {
  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountId: content.accountId,
      accountHandle: content.accountHandle,
      contentType: content.contentType,
      status: "draft",
      caption: content.caption,
      hashtags: content.hashtags,
      scheduledAt: content.suggestedPostingTime,
      aiProvider: content.provider,
    }),
  });

  const data = await res.json();
  if (!data.success) return null;
  return data.id;
}

export async function getContentByStatus(status: StoredContentStatus): Promise<ContentPost[]> {
  const res = await fetch(`/api/content?status=${encodeURIComponent(status)}`);
  const data = await res.json();
  if (!data.success) return [];
  return data.content;
}

export async function getAllContent(): Promise<ContentPost[]> {
  const res = await fetch("/api/content");
  const data = await res.json();
  if (!data.success) return [];
  return data.content;
}

export async function moveToQueue(contentId: string): Promise<boolean> {
  const res = await fetch("/api/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: contentId, status: "queued" }),
  });
  const data = await res.json();
  return data.success;
}

export async function deleteContent(contentId: string): Promise<boolean> {
  const res = await fetch(`/api/content?id=${encodeURIComponent(contentId)}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return data.success;
}

export async function scheduleContent(
  contentId: string,
  scheduledDate: string,
  platform: Platform
): Promise<boolean> {
  const res = await fetch("/api/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: contentId,
      status: "scheduled",
      scheduledAt: scheduledDate,
      targetPlatform: platform,
    }),
  });
  const data = await res.json();
  return data.success;
}

export async function getScheduledContent(): Promise<ContentPost[]> {
  return getContentByStatus("scheduled");
}

export async function unscheduleContent(contentId: string): Promise<boolean> {
  const res = await fetch("/api/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: contentId,
      status: "queued",
      scheduledAt: null,
      targetPlatform: null,
    }),
  });
  const data = await res.json();
  return data.success;
}
