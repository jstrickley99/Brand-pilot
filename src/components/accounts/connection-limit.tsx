import { mockConnectionLimit } from "@/lib/mock-data";

interface ConnectionLimitWidgetProps {
  connectedCount?: number;
}

export function ConnectionLimitWidget({ connectedCount }: ConnectionLimitWidgetProps) {
  const { max } = mockConnectionLimit;
  const current = connectedCount ?? mockConnectionLimit.current;
  const percent = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#111827] border border-[#1E293B]">
      <span className="text-sm text-[#94A3B8]">Connection Limit</span>
      <span className="text-sm font-semibold text-[#F8FAFC]">{current}/{max}</span>
      <div className="w-20 h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#F97316] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
