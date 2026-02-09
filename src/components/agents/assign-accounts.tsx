"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users, Check, ChevronDown } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { mockAccounts } from "@/lib/mock-data";
import type { InstagramAccount } from "@/lib/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AssignAccountsProps {
  assignedAccountIds: string[];
  onAssign: (accountIds: string[]) => void;
}

// ---------------------------------------------------------------------------
// Avatar component for account thumbnails
// ---------------------------------------------------------------------------

function AccountAvatar({
  account,
  size = 24,
  className,
}: {
  account: InstagramAccount;
  size?: number;
  className?: string;
}) {
  const firstLetter = account.displayName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border-2 border-[#111827]",
        "bg-[#1E293B] text-[#F8FAFC]",
        className,
      )}
      style={{ width: size, height: size }}
      title={account.handle}
    >
      {firstLetter}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssignAccounts dropdown
// ---------------------------------------------------------------------------

export function AssignAccounts({
  assignedAccountIds,
  onAssign,
}: AssignAccountsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive the selected set from props for display and toggling
  const selectedIds = new Set(assignedAccountIds);

  // Resolve assigned accounts for avatar thumbnails
  const assignedAccounts = mockAccounts.filter((a) =>
    selectedIds.has(a.id),
  );

  // -------------------------------------------
  // Toggle an account selection
  // -------------------------------------------

  const toggleAccount = useCallback(
    (accountId: string) => {
      const next = selectedIds.has(accountId)
        ? assignedAccountIds.filter((id) => id !== accountId)
        : [...assignedAccountIds, accountId];
      onAssign(next);
    },
    [assignedAccountIds, onAssign],
  );

  // -------------------------------------------
  // Close on click outside
  // -------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // -------------------------------------------
  // Close on Escape
  // -------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // -------------------------------------------
  // Render
  // -------------------------------------------

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
          "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50",
          "transition-colors border border-[#1E293B]",
          isOpen && "text-[#F8FAFC] bg-[#1E293B]/50",
        )}
      >
        <Users className="h-4 w-4" />

        {/* Stacked avatar thumbnails when accounts are assigned */}
        {assignedAccounts.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {assignedAccounts.slice(0, 4).map((account) => (
              <AccountAvatar key={account.id} account={account} size={20} />
            ))}
            {assignedAccounts.length > 4 && (
              <div
                className={cn(
                  "rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                  "bg-[#1E293B] text-[#94A3B8] border-2 border-[#111827]",
                )}
                style={{ width: 20, height: 20 }}
              >
                +{assignedAccounts.length - 4}
              </div>
            )}
          </div>
        )}

        <span>Assign Accounts</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 w-72",
            "bg-[#111827] border border-[#1E293B] rounded-xl shadow-2xl",
            "p-2 z-50",
            "animate-in fade-in slide-in-from-top-1 duration-150",
          )}
          role="listbox"
          aria-label="Assign accounts"
          aria-multiselectable="true"
        >
          {/* Header */}
          <div className="px-2 py-1.5 mb-1">
            <p className="text-sm font-medium text-[#F8FAFC]">
              Assign Accounts
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">
              {selectedIds.size === 0
                ? "Select accounts for this pipeline"
                : `${selectedIds.size} account${selectedIds.size !== 1 ? "s" : ""} selected`}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#1E293B] mx-1 mb-1" />

          {/* Account list */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {mockAccounts.map((account) => {
              const isSelected = selectedIds.has(account.id);

              return (
                <button
                  key={account.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleAccount(account.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-2 rounded-lg",
                    "text-left transition-colors cursor-pointer",
                    "hover:bg-[#1E293B]/60",
                    isSelected && "bg-[#3B82F6]/10",
                  )}
                >
                  {/* Avatar */}
                  <AccountAvatar
                    account={account}
                    size={24}
                    className={cn(
                      "border-0",
                      isSelected && "ring-1 ring-[#3B82F6]",
                    )}
                  />

                  {/* Account info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F8FAFC] truncate">
                      {account.handle}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      {account.displayName}
                      <span className="text-[#475569] mx-1">--</span>
                      {formatNumber(account.followers)} followers
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-[#3B82F6] border-[#3B82F6]"
                        : "border-[#334155] bg-transparent",
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer count */}
          {selectedIds.size > 0 && (
            <>
              <div className="h-px bg-[#1E293B] mx-1 mt-1" />
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  {selectedIds.size} of {mockAccounts.length} accounts
                </span>
                <button
                  type="button"
                  onClick={() => onAssign([])}
                  className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  Clear all
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
