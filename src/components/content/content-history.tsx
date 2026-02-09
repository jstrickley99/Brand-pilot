import { ContentPost } from "@/lib/types";
import { PostCard } from "./post-card";

interface ContentHistoryProps {
  posts: ContentPost[];
}

export function ContentHistory({ posts }: ContentHistoryProps) {
  const published = posts.filter((p) => p.status === "published");

  if (published.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No published posts yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {published.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
