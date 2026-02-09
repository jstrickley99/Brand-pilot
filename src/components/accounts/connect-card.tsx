import { Plus } from "lucide-react";

export function ConnectCard() {
  return (
    <div className="rounded-xl bg-[#16213E] border border-dashed border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-all cursor-pointer p-6 flex flex-col items-center justify-center min-h-[280px]">
      <div className="h-16 w-16 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-[#3B82F6]" />
      </div>
      <p className="font-semibold mb-1 text-white">Connect Account</p>
      <p className="text-sm text-gray-400 text-center">
        Link a new Instagram account to start autonomous growth
      </p>
    </div>
  );
}
