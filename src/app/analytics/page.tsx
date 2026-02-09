import { PageHeader } from "@/components/layout/page-header";
import { FollowerChart } from "@/components/analytics/follower-chart";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import { ContentPerformance } from "@/components/analytics/content-performance";
import { mockAnalytics } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep insights into your social media performance"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FollowerChart data={mockAnalytics.followerGrowth} />
          <EngagementChart data={mockAnalytics.engagementByDay} />
        </div>

        <ContentPerformance data={mockAnalytics.contentPerformance} />
      </div>
    </div>
  );
}
