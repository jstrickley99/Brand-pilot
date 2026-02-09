import { ReactNode } from "react";
import { ContentPost } from "@/lib/types";
import { getStatusBgColor, formatDate, formatNumber } from "@/lib/utils";
import { Heart, MessageCircle, Eye, Repeat2, Image, Layers, Film, Clock } from "lucide-react";

interface PostCardProps {
  post: ContentPost;
  actions?: ReactNode;
}

const typeIcons = {
  image: Image,
  carousel: Layers,
  reel: Film,
  story: Clock,
};

export function PostCard({ post, actions }: PostCardProps) {
  const TypeIcon = typeIcons[post.type];

  return (
    <div className="rounded-xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all overflow-hidden">
      {/* Image placeholder */}
      <div className="h-40 bg-gradient-to-br from-[#0D1117] to-[#111827] flex items-center justify-center">
        <TypeIcon className="h-10 w-10 text-[#64748B]" />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#94A3B8]">{post.accountHandle}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBgColor(post.status)}`}>
            {post.status}
          </span>
        </div>

        {/* Caption */}
        <p className="text-sm text-[#F8FAFC] line-clamp-2 mb-3">{post.caption}</p>

        {/* Repost indicator */}
        {post.isRepost && (
          <div className="flex items-center gap-1 text-xs text-[#94A3B8] mb-3">
            <Repeat2 className="h-3 w-3" />
            <span>Repost from {post.originalCreator}</span>
          </div>
        )}

        {/* Type & Schedule */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-[#F8FAFC] flex items-center gap-1">
            <TypeIcon className="h-3 w-3" />
            {post.type}
          </span>
          <span className="text-xs text-[#94A3B8]">
            {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.scheduledAt)}
          </span>
        </div>

        {/* Performance (if published) */}
        {post.status === "published" && post.likes !== undefined && (
          <div className="flex items-center gap-4 pt-3 border-t border-[#1E293B]">
            <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(post.likes)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
              <MessageCircle className="h-3 w-3" />
              <span>{formatNumber(post.comments!)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(post.reach!)}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {actions && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#1E293B] mt-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
