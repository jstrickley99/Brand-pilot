"use client";

import { useState, useMemo } from "react";
import { ContentPost } from "@/lib/types";
import { X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ContentCalendarProps {
  posts: ContentPost[];
}

const hours = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ContentCalendar({ posts }: ContentCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);

  const weekStart = useMemo(() => {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return monday;
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const getPostsForSlot = (dayIndex: number, hour: string) => {
    const slotDate = weekDates[dayIndex];
    return posts.filter((post) => {
      const date = new Date(post.scheduledAt);
      const postHour = date.getHours().toString().padStart(2, "0") + ":00";
      return isSameDay(date, slotDate) && postHour === hour;
    });
  };

  const postCountThisWeek = posts.filter((post) => {
    const d = new Date(post.scheduledAt);
    return d >= weekDates[0] && d < new Date(weekDates[6].getTime() + 86400000);
  }).length;

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="text-xs px-3 py-1.5 rounded-md border border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B]/50 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-[#F8FAFC]">
          {formatShortDate(weekDates[0])} &ndash; {formatShortDate(weekDates[6])}
          <span className="text-[#94A3B8] ml-2">({postCountThisWeek} posts)</span>
        </span>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="text-xs px-3 py-1.5 rounded-md border border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B]/50 transition-colors"
        >
          Next
        </button>
      </div>

      <div className="rounded-xl bg-[#111827] border border-[#1E293B] overflow-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-[#1E293B]">
            <div className="p-3 text-xs text-[#94A3B8]">Time</div>
            {weekDates.map((date, i) => (
              <div key={i} className="p-3 text-center border-l border-[#1E293B]">
                <p className="text-xs text-[#94A3B8]">{dayLabels[i]}</p>
                <p className="text-sm font-medium text-[#F8FAFC]">
                  {formatShortDate(date)}
                </p>
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
              {weekDates.map((_, dayIndex) => {
                const slotPosts = getPostsForSlot(dayIndex, hour);
                return (
                  <div
                    key={dayIndex}
                    className="p-1 border-l border-[#1E293B] min-h-[48px]"
                  >
                    {slotPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs mb-1 cursor-pointer hover:bg-cyan-500/20 transition-colors"
                      >
                        <div className="flex items-center gap-1 text-[#F8FAFC]">
                          <span className="truncate">{post.accountHandle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Post detail overlay */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1">
              Scheduled Post
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              {selectedPost.accountHandle}
            </p>
            <p className="text-sm text-[#F8FAFC] mb-4 leading-relaxed">
              {selectedPost.caption}
            </p>
            {selectedPost.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedPost.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-[#94A3B8] pt-3 border-t border-[#1E293B]">
              <span>
                Type: <span className="text-[#F8FAFC]">{selectedPost.type}</span>
              </span>
              <span>
                Time:{" "}
                <span className="text-[#F8FAFC]">
                  {formatDate(selectedPost.scheduledAt)}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
