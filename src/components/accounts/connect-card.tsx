import { Plus } from "lucide-react";

export function ConnectCard() {
  return (
    <div className="rounded-xl bg-[#111827] border border-dashed border-[#1E293B] hover:border-[#3B82F6]/50 transition-all cursor-pointer p-6 flex flex-col items-center justify-center min-h-[280px]">
      <div className="h-14 w-14 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4">
        <Plus className="h-7 w-7 text-[#3B82F6]" />
      </div>
      <p className="font-semibold mb-1 text-[#F8FAFC]">Connect Another</p>
      <p className="text-sm text-[#94A3B8] text-center">
        Add more social profiles to manage from one place
      </p>
    </div>
  );
}
