import { PageHeader } from "@/components/layout/page-header";
import { ContentCalendar } from "@/components/calendar/content-calendar";
import { mockPosts } from "@/lib/mock-data";

export default function CalendarPage() {
  const queuedCount = mockPosts.filter((p) => p.status === "queued").length;

  return (
    <div>
      <PageHeader title="Calendar" description="Visual content schedule across all accounts">
        <span className="text-sm border border-[#1E293B] rounded-full px-3 py-1.5 text-[#94A3B8]">
          {queuedCount} posts scheduled
        </span>
      </PageHeader>

      <ContentCalendar posts={mockPosts} />
    </div>
  );
}
