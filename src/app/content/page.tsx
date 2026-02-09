"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ContentQueue } from "@/components/content/content-queue";
import { ContentHistory } from "@/components/content/content-history";
import { PostCard } from "@/components/content/post-card";
import { GenerateContentModal } from "@/components/content/generate-content-modal";
import { Sparkles, ArrowRight, Trash2 } from "lucide-react";
import { mockPosts } from "@/lib/mock-data";
import {
  getContentByStatus,
  moveToQueue,
  deleteContent,
  StoredContent,
} from "@/lib/content-store";
import { ContentPost } from "@/lib/types";

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
    scheduledAt: item.suggestedPostingTime,
    isRepost: false,
  };
}

export default function ContentPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<StoredContent[]>([]);
  const [queuedItems, setQueuedItems] = useState<StoredContent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadContent = useCallback(() => {
    setGeneratedItems(getContentByStatus("generated"));
    setQueuedItems(getContentByStatus("queued"));
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent, refreshKey]);

  function handleContentSaved() {
    setRefreshKey((k) => k + 1);
  }

  function handleMoveToQueue(id: string) {
    moveToQueue(id);
    setRefreshKey((k) => k + 1);
  }

  function handleDelete(id: string) {
    deleteContent(id);
    setRefreshKey((k) => k + 1);
  }

  const mockDrafts = mockPosts.filter((p) => p.status === "draft");
  const mockQueued = mockPosts.filter((p) => p.status === "queued");
  const failed = mockPosts.filter((p) => p.status === "failed");

  const allGenerated = [
    ...generatedItems.map(storedToPost),
    ...mockDrafts,
  ];

  const allQueued = [
    ...queuedItems.map(storedToPost),
    ...mockQueued,
  ];

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
          <TabsTrigger value="generated">Generated ({allGenerated.length})</TabsTrigger>
          <TabsTrigger value="history">
            History ({mockPosts.filter((p) => p.status === "published").length})
          </TabsTrigger>
          {failed.length > 0 && (
            <TabsTrigger value="failed" className="text-red-400">
              Failed ({failed.length})
            </TabsTrigger>
          )}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 px-2 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
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
          <ContentHistory posts={mockPosts} />
        </TabsContent>

        {failed.length > 0 && (
          <TabsContent value="failed">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {failed.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <GenerateContentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onContentSaved={handleContentSaved}
      />
    </div>
  );
}
