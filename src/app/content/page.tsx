"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ContentQueue } from "@/components/content/content-queue";
import { ContentHistory } from "@/components/content/content-history";
import { PostCard } from "@/components/content/post-card";
import { GenerateContentModal } from "@/components/content/generate-content-modal";
import { Sparkles } from "lucide-react";
import { mockPosts } from "@/lib/mock-data";

export default function ContentPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const drafts = mockPosts.filter((p) => p.status === "draft");
  const failed = mockPosts.filter((p) => p.status === "failed");

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
            Queue ({mockPosts.filter((p) => p.status === "queued").length})
          </TabsTrigger>
          <TabsTrigger value="generated">Generated ({drafts.length})</TabsTrigger>
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
          <ContentQueue posts={mockPosts} />
        </TabsContent>

        <TabsContent value="generated">
          {drafts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {drafts.map((post) => (
                <PostCard key={post.id} post={post} />
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

      <GenerateContentModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
