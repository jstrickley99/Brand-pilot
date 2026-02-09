import { ContentPost } from "@/lib/types";
import { PostCard } from "./post-card";

interface ContentQueueProps {
  posts: ContentPost[];
}

export function ContentQueue({ posts }: ContentQueueProps) {
  const queued = posts.filter((p) => p.status === "queued");

  if (queued.length === 0) {
    return (
      <div className="text-center py-12 text-[#94A3B8]">
        <p>No posts in queue. Content will be auto-generated soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {queued.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
