import { formatNumber } from "@/lib/utils";
import { ContentType } from "@/lib/types";
import { Image, Layers, Film, Clock } from "lucide-react";

interface ContentPerformanceProps {
  data: {
    type: ContentType;
    avgLikes: number;
    avgComments: number;
    avgReach: number;
  }[];
}

const typeIcons = {
  image: Image,
  carousel: Layers,
  reel: Film,
  story: Clock,
};

export function ContentPerformance({ data }: ContentPerformanceProps) {
  return (
    <div className="rounded-xl bg-[#16213E] border border-[#1E3A5F] p-6">
      <h3 className="font-semibold mb-4 text-white">Content Performance by Type</h3>
      <div className="space-y-3">
        {data.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={item.type}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
            >
              <div className="flex items-center gap-2 w-24">
                <Icon className="h-4 w-4 text-gray-400" />
                <span className="text-sm capitalize text-white">{item.type}</span>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatNumber(item.avgLikes)}
                  </p>
                  <p className="text-xs text-gray-400">Avg Likes</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatNumber(item.avgComments)}
                  </p>
                  <p className="text-xs text-gray-400">Avg Comments</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatNumber(item.avgReach)}
                  </p>
                  <p className="text-xs text-gray-400">Avg Reach</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
