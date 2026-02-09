"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AccountMiniCards } from "@/components/dashboard/account-mini-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Button } from "@/components/ui/button";
import { GenerateContentModal } from "@/components/content/generate-content-modal";
import { Plus, Sparkles } from "lucide-react";
import type { InstagramAccount, ContentPost } from "@/lib/types";
import type { DashboardStats, ActivityItem } from "@/lib/types";

const DEFAULT_STATS: DashboardStats = {
  totalAccounts: 0,
  totalFollowers: 0,
  avgEngagementRate: 0,
  postsThisWeek: 0,
  creditsRemaining: 10000,
  followersGainedThisWeek: 0,
};

function buildActivityFromContent(content: ContentPost[]): ActivityItem[] {
  return content.slice(0, 10).map((item) => {
    const typeMap: Record<string, ActivityItem["type"]> = {
      draft: "content_generated",
      queued: "content_generated",
      scheduled: "content_generated",
      published: "post_published",
      failed: "content_generated",
    };

    const messageMap: Record<string, string> = {
      draft: "Content drafted",
      queued: "Content moved to queue",
      scheduled: "Content scheduled for publishing",
      published: "Post published successfully",
      failed: "Content generation failed",
    };

    return {
      id: `activity-${item.id}`,
      type: typeMap[item.status] || "content_generated",
      message: messageMap[item.status] || `Content ${item.status}`,
      accountHandle: item.accountHandle,
      timestamp: item.publishedAt || item.scheduledAt,
    };
  });
}

function countPostsThisWeek(content: ContentPost[]): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return content.filter((item) => {
    if (item.status !== "published" || !item.publishedAt) return false;
    return new Date(item.publishedAt) >= weekAgo;
  }).length;
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);

  const fetchContent = useCallback(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content) {
          const items: ContentPost[] = data.content;
          setActivities(buildActivityFromContent(items));
          setStats((prev) => ({
            ...prev,
            postsThisWeek: countPostsThisWeek(items),
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Load content data on mount
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Fetch accounts from API
  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.accounts) {
          const accs: InstagramAccount[] = data.accounts;
          setAccounts(accs);
          const totalFollowers = accs.reduce((sum: number, a: InstagramAccount) => sum + (a.followers || 0), 0);
          const avgEngagement = accs.length > 0
            ? accs.reduce((sum: number, a: InstagramAccount) => sum + (a.engagementRate || 0), 0) / accs.length
            : 0;
          setStats((prev) => ({
            ...prev,
            totalAccounts: accs.length,
            totalFollowers,
            avgEngagementRate: Math.round(avgEngagement * 10) / 10,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Refresh content data when the modal closes (user may have generated content)
  const handleModalChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      fetchContent();
    }
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your social media growth at a glance"
      >
        <Button
          variant="outline"
          className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
        <Button onClick={() => setModalOpen(true)} className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content
        </Button>
      </PageHeader>

      <div className="space-y-8">
        <StatsCards stats={stats} />

        <div>
          <h2 className="text-lg font-semibold mb-4 text-[#F8FAFC]">
            Account Performance
          </h2>
          <AccountMiniCards accounts={accounts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      <GenerateContentModal open={modalOpen} onOpenChange={handleModalChange} />
    </div>
  );
}
