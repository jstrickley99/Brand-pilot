import { AIProvider, ContentType } from "./types";

export type StoredContentStatus = "generated" | "queued" | "published" | "failed";

export interface StoredContent {
  id: string;
  caption: string;
  hashtags: string[];
  suggestedPostingTime: string;
  provider: AIProvider;
  contentType: ContentType;
  accountId: string;
  accountHandle: string;
  createdAt: string;
  status: StoredContentStatus;
}

const STORAGE_KEY = "brandpilot_content";

function readStore(): StoredContent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(items: StoredContent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function saveGeneratedContent(
  content: Omit<StoredContent, "id" | "createdAt" | "status">
): StoredContent {
  const items = readStore();
  const entry: StoredContent = {
    ...content,
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "generated",
  };
  items.unshift(entry);
  writeStore(items);
  return entry;
}

export function getContentByStatus(status: StoredContentStatus): StoredContent[] {
  return readStore().filter((item) => item.status === status);
}

export function getAllContent(): StoredContent[] {
  return readStore();
}

export function moveToQueue(contentId: string): void {
  const items = readStore();
  const idx = items.findIndex((item) => item.id === contentId);
  if (idx !== -1) {
    items[idx].status = "queued";
    writeStore(items);
  }
}

export function deleteContent(contentId: string): void {
  const items = readStore().filter((item) => item.id !== contentId);
  writeStore(items);
}
