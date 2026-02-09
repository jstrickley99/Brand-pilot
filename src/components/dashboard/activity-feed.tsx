import { ActivityItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Send, Sparkles, Link, MessageCircle, Trophy } from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const iconMap = {
  post_published: Send,
  content_generated: Sparkles,
  account_connected: Link,
  engagement: MessageCircle,
  milestone: Trophy,
};

const colorMap = {
  post_published: "text-[#3B82F6]",
  content_generated: "text-purple-400",
  account_connected: "text-emerald-400",
  engagement: "text-yellow-400",
  milestone: "text-[#FF6B35]",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-xl bg-[#16213E] border border-[#1E3A5F] p-4">
      <h3 className="font-semibold mb-4 text-white">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 pb-3 border-b border-[#1E3A5F] last:border-0 last:pb-0"
            >
              <div className={`mt-0.5 ${colorMap[activity.type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{activity.message}</p>
                {activity.accountHandle && (
                  <p className="text-xs text-gray-400">{activity.accountHandle}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {timeAgo(activity.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
