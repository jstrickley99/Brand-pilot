"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  CreditCard,
  Plus,
  Smartphone,
  MessageSquare,
  Bot,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { mockCredits } from "@/lib/mock-data";

const platformNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/agents", label: "Agents", icon: Bot },
];

const accountNav = [
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
          isActive
            ? "bg-[#1E293B]/50 text-[#F8FAFC] font-medium"
            : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/30",
          collapsed && "justify-center px-2"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#10B981] -ml-1.5" />
        )}
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-[#1E293B] bg-[#111827] transition-all duration-300",
        collapsed ? "w-16" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-[#1E293B]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#F97316]" />
            <span className="text-[15px] font-bold text-[#F8FAFC]">BrandPilot</span>
          </div>
        )}
        {collapsed && <Zap className="h-5 w-5 text-[#F97316] mx-auto" />}
        <button
          onClick={toggle}
          className={cn(
            "p-1 rounded-md hover:bg-[#1E293B]/50 text-[#64748B]",
            collapsed && "mx-auto mt-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Credits compact */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#64748B]" />
              <span className="text-sm font-medium text-[#F8FAFC]">{mockCredits.remaining.toLocaleString()}</span>
              <span className="text-xs text-[#64748B]">credits</span>
            </div>
            <button className="h-6 w-6 rounded-md bg-[#F97316] hover:bg-[#F97316]/80 flex items-center justify-center transition-colors">
              <Plus className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Platform nav */}
      <nav className="flex-1 px-3 pt-4 space-y-4 overflow-y-auto">
        <div>
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] px-3 mb-2">Platform</p>
          )}
          <div className="space-y-0.5">
            {platformNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] px-3 mb-2">Account</p>
          )}
          <div className="space-y-0.5">
            {accountNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom utility row */}
      <div className="px-3 py-3 border-t border-[#1E293B]">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-md hover:bg-[#1E293B]/50 text-[#64748B] hover:text-[#94A3B8] transition-colors">
                <Smartphone className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-md hover:bg-[#1E293B]/50 text-[#64748B] hover:text-[#94A3B8] transition-colors">
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
