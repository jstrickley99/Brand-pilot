"use client";

import { ContentPost } from "@/lib/types";
import { getNicheEmoji } from "@/lib/utils";
import { mockAccounts } from "@/lib/mock-data";

interface ContentCalendarProps {
  posts: ContentPost[];
}

const hours = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = ["Feb 3", "Feb 4", "Feb 5", "Feb 6", "Feb 7", "Feb 8", "Feb 9"];

export function ContentCalendar({ posts }: ContentCalendarProps) {
  const getPostsForSlot = (dayIndex: number, hour: string) => {
    return posts.filter((post) => {
      const date = new Date(post.scheduledAt);
      const postDay = date.getDay();
      const adjustedDay = postDay === 0 ? 6 : postDay - 1;
      const postHour = date.getHours().toString().padStart(2, "0") + ":00";
      return adjustedDay === dayIndex && postHour === hour;
    });
  };

  const getAccount = (accountId: string) =>
    mockAccounts.find((a) => a.id === accountId);

  return (
    <div className="rounded-xl bg-[#111827] border border-[#1E293B] overflow-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-[#1E293B]">
          <div className="p-3 text-xs text-[#94A3B8]">Time</div>
          {days.map((day, i) => (
            <div key={day} className="p-3 text-center border-l border-[#1E293B]">
              <p className="text-xs text-[#94A3B8]">{day}</p>
              <p className="text-sm font-medium text-[#F8FAFC]">{dates[i]}</p>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 border-b border-[#1E293B] last:border-0"
          >
            <div className="p-3 text-xs text-[#94A3B8]">{hour}</div>
            {days.map((_, dayIndex) => {
              const slotPosts = getPostsForSlot(dayIndex, hour);
              return (
                <div
                  key={dayIndex}
                  className="p-1 border-l border-[#1E293B] min-h-[48px]"
                >
                  {slotPosts.map((post) => {
                    const account = getAccount(post.accountId);
                    return (
                      <div
                        key={post.id}
                        className="p-1.5 rounded bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-xs mb-1 cursor-pointer hover:bg-[#3B82F6]/20 transition-colors"
                      >
                        <div className="flex items-center gap-1 text-[#F8FAFC]">
                          <span>
                            {account ? getNicheEmoji(account.niche) : ""}
                          </span>
                          <span className="truncate">{post.accountHandle}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
