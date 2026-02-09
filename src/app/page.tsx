"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AccountMiniCards } from "@/components/dashboard/account-mini-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Button } from "@/components/ui/button";
import { GenerateContentModal } from "@/components/content/generate-content-modal";
import { Plus, Sparkles } from "lucide-react";
import { mockDashboardStats, mockAccounts, mockActivity } from "@/lib/mock-data";
import { getAllContent } from "@/lib/content-store";
import type { DashboardStats, ActivityItem } from "@/lib/types";

interface ConnectionStatus {
  provider: string;
  connected: boolean;
}

function buildRealStats(): DashboardStats {
  const allContent = getAllContent();
  const totalPosts = allContent.length;
  const postsThisWeek = totalPosts > 0 ? totalPosts : mockDashboardStats.postsThisWeek;

  return {
    ...mockDashboardStats,
    postsThisWeek,
    // Override totalAccounts if we have real connection data (set later)
    totalAccounts: mockDashboardStats.totalAccounts,
    // Keep mock values for metrics we can't compute from localStorage:
    // totalFollowers, avgEngagementRate, creditsRemaining, followersGainedThisWeek
  };
}

function buildRealActivity(): ActivityItem[] {
  const allContent = getAllContent();

  // Create activity entries from real content, sorted newest first (already sorted by unshift in store)
  const realActivities: ActivityItem[] = allContent.slice(0, 10).map((item) => {
    const typeMap: Record<string, ActivityItem["type"]> = {
      generated: "content_generated",
      queued: "content_generated",
      published: "post_published",
      failed: "content_generated",
    };

    const messageMap: Record<string, string> = {
      generated: "Content generated via AI",
      queued: "Content moved to queue",
      published: "Post published successfully",
      failed: "Content generation failed",
    };

    return {
      id: `real-${item.id}`,
      type: typeMap[item.status] || "content_generated",
      message: messageMap[item.status] || `Content ${item.status}`,
      accountHandle: item.accountHandle,
      timestamp: item.createdAt,
    };
  });

  if (realActivities.length === 0) {
    return mockActivity;
  }

  // Blend: real activities first, then fill with mock to have a reasonable list
  const combined = [...realActivities, ...mockActivity.slice(0, Math.max(0, 7 - realActivities.length))];
  return combined.slice(0, 10);
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(mockDashboardStats);
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivity);
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);

  const refreshData = useCallback(() => {
    setStats(buildRealStats());
    setActivities(buildRealActivity());
  }, []);

  // Load real data on mount and after modal closes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Fetch connection status for instagram and youtube
  useEffect(() => {
    async function fetchConnections() {
      const providers = ["instagram", "youtube"];
      const results: ConnectionStatus[] = [];

      for (const provider of providers) {
        try {
          const res = await fetch(`/api/nango/connections?provider=${provider}`);
          if (res.ok) {
            const data = await res.json();
            results.push({ provider, connected: data.connected === true });
          } else {
            results.push({ provider, connected: false });
          }
        } catch {
          results.push({ provider, connected: false });
        }
      }

      setConnections(results);

      // Update totalAccounts based on real connections
      const connectedCount = results.filter((c) => c.connected).length;
      if (connectedCount > 0) {
        setStats((prev) => ({ ...prev, totalAccounts: connectedCount }));
      }
    }

    fetchConnections();
  }, []);

  // Refresh content data when the modal closes (user may have generated content)
  const handleModalChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      refreshData();
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
          <AccountMiniCards accounts={mockAccounts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      <GenerateContentModal open={modalOpen} onOpenChange={handleModalChange} />
    </div>
  );
}
