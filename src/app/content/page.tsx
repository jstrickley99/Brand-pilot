"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ContentHistory } from "@/components/content/content-history";
import { PostCard } from "@/components/content/post-card";
import { GenerateContentModal } from "@/components/content/generate-content-modal";
import { Sparkles, ArrowRight, Trash2, CalendarClock, X, Loader2 } from "lucide-react";
import {
  getContentByStatus,
  moveToQueue,
  deleteContent,
  scheduleContent,
  getScheduledContent,
  unscheduleContent,
} from "@/lib/content-store";
import type { ContentPost, Platform } from "@/lib/types";
import { formatDate } from "@/lib/utils";

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
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!date || !time) return;
    setSaving(true);
    const scheduledDate = new Date(`${date}T${time}:00`).toISOString();
    await scheduleContent(postId, scheduledDate, platform);
    setSaving(false);
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
        disabled={!date || saving}
        className="bg-cyan-600 hover:bg-cyan-500 text-[#F8FAFC] h-7 px-3 text-xs"
      >
        {saving ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <CalendarClock className="h-3 w-3 mr-1" />
        )}
        Schedule
      </Button>
    </div>
  );
}

export default function ContentPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<ContentPost[]>([]);
  const [queuedItems, setQueuedItems] = useState<ContentPost[]>([]);
  const [scheduledItems, setScheduledItems] = useState<ContentPost[]>([]);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContent = useCallback(async () => {
    setLoading(true);
    const [drafts, queued, scheduled] = await Promise.all([
      getContentByStatus("draft"),
      getContentByStatus("queued"),
      getScheduledContent(),
    ]);
    setDraftItems(drafts);
    setQueuedItems(queued);
    setScheduledItems(scheduled);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  async function handleContentSaved() {
    await loadContent();
  }

  async function handleMoveToQueue(id: string) {
    await moveToQueue(id);
    await loadContent();
  }

  async function handleDelete(id: string) {
    await deleteContent(id);
    await loadContent();
  }

  async function handleScheduled() {
    setSchedulingId(null);
    await loadContent();
  }

  async function handleUnschedule(id: string) {
    await unscheduleContent(id);
    await loadContent();
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Content" description="Manage your content queue and history">
          <Button disabled className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-[#F8FAFC]">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Content
          </Button>
        </PageHeader>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-[#3B82F6] animate-spin" />
          <span className="ml-2 text-[#94A3B8] text-sm">Loading content...</span>
        </div>
      </div>
    );
  }

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
            Queue ({queuedItems.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledItems.length})
          </TabsTrigger>
          <TabsTrigger value="generated">Generated ({draftItems.length})</TabsTrigger>
          <TabsTrigger value="history">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          {queuedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {queuedItems.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actions={
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
          {scheduledItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {scheduledItems.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actions={
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#94A3B8]">
                          <span className="text-cyan-400 font-medium">
                            {post.targetPlatform
                              ? post.targetPlatform.charAt(0).toUpperCase() +
                                post.targetPlatform.slice(1)
                              : ""}
                          </span>
                          {post.scheduledAt && (
                            <span className="ml-2">
                              {formatDate(post.scheduledAt)}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#94A3B8]">
              <p>No scheduled posts. Schedule content from your queue.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generated">
          {draftItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {draftItems.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actions={
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
