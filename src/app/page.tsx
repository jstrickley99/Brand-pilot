"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AccountMiniCards } from "@/components/dashboard/account-mini-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Button } from "@/components/ui/button";
import { GenerateContentModal } from "@/components/content/generate-content-modal";
import { Plus, Sparkles } from "lucide-react";
import { mockDashboardStats, mockAccounts, mockActivity } from "@/lib/mock-data";

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);

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
        <StatsCards stats={mockDashboardStats} />

        <div>
          <h2 className="text-lg font-semibold mb-4 text-[#F8FAFC]">
            Account Performance
          </h2>
          <AccountMiniCards accounts={mockAccounts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed activities={mockActivity} />
        </div>
      </div>

      <GenerateContentModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
