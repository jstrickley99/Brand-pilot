"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ContentHistory } from "@/components/content/content-history";
import { PostCard } from "@/components/content/post-card";
import { GenerateContentModal } from "@/components/content/generate-content-modal";
import { Sparkles, ArrowRight, Trash2, CalendarClock, X } from "lucide-react";
import {
  getContentByStatus,
  moveToQueue,
  deleteContent,
  scheduleContent,
  getScheduledContent,
  unscheduleContent,
  StoredContent,
} from "@/lib/content-store";
import { ContentPost, Platform } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function storedToPost(item: StoredContent): ContentPost {
  return {
    id: item.id,
    accountId: item.accountId,
    accountHandle: item.accountHandle,
    type: item.contentType,
    status: item.status === "generated" ? "draft" : item.status as ContentPost["status"],
    caption: item.caption,
    imageUrl: "",
    hashtags: item.hashtags,
    scheduledAt: item.scheduledFor || item.suggestedPostingTime,
    isRepost: false,
  };
}

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
];

function ScheduleForm({
  postId,
  onSchedule,
}: {
  postId: string;
  onSchedule: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [platform, setPlatform] = useState<Platform>("instagram");

  function handleSubmit() {
    if (!date || !time) return;
    const scheduledDate = new Date(`${date}T${time}:00`).toISOString();
    scheduleContent(postId, scheduledDate, platform);
    onSchedule();
  }

  return (
    <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-[#1E293B] mt-3">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-7 px-2 text-xs rounded-md border border-[#1E293B] bg-[#0D1117] text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-7 px-2 text-xs rounded-md border border-[#1E293B] bg-[#0D1117] text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="h-7 px-2 text-xs rounded-md border border-[#1E293B] bg-[#0D1117] text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={!date}
        className="bg-cyan-600 hover:bg-cyan-500 text-[#F8FAFC] h-7 px-3 text-xs"
      >
        <CalendarClock className="h-3 w-3 mr-1" />
        Schedule
      </Button>
    </div>
  );
}

export default function ContentPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<StoredContent[]>([]);
  const [queuedItems, setQueuedItems] = useState<StoredContent[]>([]);
  const [scheduledItems, setScheduledItems] = useState<StoredContent[]>([]);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadContent = useCallback(() => {
    setGeneratedItems(getContentByStatus("generated"));
    setQueuedItems(getContentByStatus("queued"));
    setScheduledItems(getScheduledContent());
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent, refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleContentSaved() {
    refresh();
  }

  function handleMoveToQueue(id: string) {
    moveToQueue(id);
    refresh();
  }

  function handleDelete(id: string) {
    deleteContent(id);
    refresh();
  }

  function handleScheduled() {
    setSchedulingId(null);
    refresh();
  }

  function handleUnschedule(id: string) {
    unscheduleContent(id);
    refresh();
  }

  const allGenerated = generatedItems.map(storedToPost);
  const allQueued = queuedItems.map(storedToPost);
  const allScheduled = scheduledItems.map(storedToPost);

  return (
    <div>
      <PageHeader title="Content" description="Manage your content queue and history">
        <Button onClick={() => setModalOpen(true)} className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-[#F8FAFC]">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content
        </Button>
      </PageHeader>

      <Tabs defaultValue="queue">
        <TabsList className="bg-[#111827] border border-[#1E293B] mb-6">
          <TabsTrigger value="queue">
            Queue ({allQueued.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({allScheduled.length})
          </TabsTrigger>
          <TabsTrigger value="generated">Generated ({allGenerated.length})</TabsTrigger>
          <TabsTrigger value="history">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          {allQueued.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allQueued.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actions={
                    post.id.startsWith("gen-") ? (
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSchedulingId(
                                schedulingId === post.id ? null : post.id
                              )
                            }
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 h-7 px-2 text-xs"
                          >
                            <CalendarClock className="h-3 w-3 mr-1" />
                            Schedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 px-2 text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                        {schedulingId === post.id && (
                          <ScheduleForm
                            postId={post.id}
                            onSchedule={handleScheduled}
                          />
                        )}
                      </div>
                    ) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#94A3B8]">
              <p>No posts in queue. Generate content to get started.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled">
          {allScheduled.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allScheduled.map((post) => {
                const stored = scheduledItems.find((s) => s.id === post.id);
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    actions={
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-[#94A3B8]">
                            <span className="text-cyan-400 font-medium">
                              {stored?.targetPlatform
                                ? stored.targetPlatform.charAt(0).toUpperCase() +
                                  stored.targetPlatform.slice(1)
                                : ""}
                            </span>
                            {stored?.scheduledFor && (
                              <span className="ml-2">
                                {formatDate(stored.scheduledFor)}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnschedule(post.id)}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 h-7 px-2 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Unschedule
                          </Button>
                        </div>
                      </div>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-[#94A3B8]">
              <p>No scheduled posts. Schedule content from your queue.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generated">
          {allGenerated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allGenerated.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actions={
                    post.id.startsWith("gen-") ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveToQueue(post.id)}
                          className="text-[#3B82F6] hover:text-[#3B82F6]/80 hover:bg-[#3B82F6]/10 h-7 px-2 text-xs"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Move to Queue
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 px-2 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </>
                    ) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#94A3B8]">
              <p>No generated content awaiting review.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <ContentHistory posts={[]} />
        </TabsContent>
      </Tabs>

      <GenerateContentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onContentSaved={handleContentSaved}
      />
    </div>
  );
}
