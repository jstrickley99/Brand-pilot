"use client";

import { cn } from "@/lib/utils";
import type { PublisherConfig as ConfigType } from "@/lib/types";
import { mockAccounts } from "@/lib/mock-data";

interface PublisherConfigProps {
  config: ConfigType | null;
  onChange: (config: ConfigType) => void;
}

const DEFAULT_CONFIG: ConfigType = {
  accountIds: [],
  crossPostingEnabled: false,
};

export function PublisherConfig({ config, onChange }: PublisherConfigProps) {
  const current = config ?? DEFAULT_CONFIG;

  function update(partial: Partial<ConfigType>) {
    onChange({ ...current, ...partial });
  }

  function toggleAccount(accountId: string) {
    const has = current.accountIds.includes(accountId);
    update({
      accountIds: has
        ? current.accountIds.filter((id) => id !== accountId)
        : [...current.accountIds, accountId],
    });
  }

  return (
    <div className="space-y-5">
      {/* Account Selector */}
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] mb-2">
          Publish To
        </label>
        <div className="space-y-2">
          {mockAccounts.map((account) => (
            <label
              key={account.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                current.accountIds.includes(account.id)
                  ? "border-[#3B82F6]/50 bg-[#3B82F6]/5"
                  : "border-[#1E293B] bg-[#0B0F19] hover:border-[#3B82F6]/30"
              )}
              onClick={() => toggleAccount(account.id)}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                  current.accountIds.includes(account.id)
                    ? "bg-[#3B82F6] border-[#3B82F6]"
                    : "border-[#1E293B] bg-[#0B0F19]"
                )}
              >
                {current.accountIds.includes(account.id) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-xs font-medium text-[#94A3B8] shrink-0 overflow-hidden">
                {account.avatarUrl ? (
                  <img
                    src={account.avatarUrl}
                    alt={account.handle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (
                        e.target as HTMLImageElement
                      ).parentElement!.textContent = account.handle
                        .replace("@", "")
                        .slice(0, 2)
                        .toUpperCase();
                    }}
                  />
                ) : (
                  account.handle.replace("@", "").slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F8FAFC] truncate">
                  {account.handle}
                </p>
                <p className="text-xs text-[#64748B] truncate">
                  {account.displayName}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cross-Posting Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-[#F8FAFC]">Cross-Posting</span>
          <p className="text-xs text-[#64748B] mt-0.5">
            Post the same content to all selected accounts
          </p>
        </div>
        <button
          onClick={() =>
            update({ crossPostingEnabled: !current.crossPostingEnabled })
          }
          className={cn(
            "w-10 h-5 rounded-full relative transition-colors shrink-0",
            current.crossPostingEnabled ? "bg-[#3B82F6]" : "bg-[#1E293B]"
          )}
          role="switch"
          aria-checked={current.crossPostingEnabled}
        >
          <span
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full transition-transform",
              current.crossPostingEnabled
                ? "bg-white translate-x-5"
                : "bg-[#64748B] translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
