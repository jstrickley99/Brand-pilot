"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { mockCredits } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const creditPercent = (mockCredits.used / mockCredits.total) * 100;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-[#1E3A5F] bg-[#0F3460] transition-all duration-300",
        collapsed ? "w-16" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#1E3A5F]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#FF6B35]" />
            <span className="text-lg font-bold text-white">BrandPilot</span>
          </div>
        )}
        {collapsed && <Zap className="h-6 w-6 text-[#FF6B35] mx-auto" />}
        <button
          onClick={toggle}
          className={cn(
            "p-1 rounded-md hover:bg-white/5 text-gray-400",
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

      {/* Credits */}
      {!collapsed && (
        <div className="p-4 border-b border-[#1E3A5F]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Credits</span>
            </div>
            <span className="text-sm font-medium text-white">
              {mockCredits.remaining.toLocaleString()}
            </span>
          </div>
          <Progress value={100 - creditPercent} className="h-1.5" />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400">{mockCredits.plan} plan</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-[#FF6B35] hover:text-[#FF6B35]/80"
            >
              Top Up
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-[#3B82F6]/10 text-[#3B82F6] font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-4 border-t border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-sm font-medium text-[#3B82F6]">
              BP
            </div>
            <div>
              <p className="text-sm font-medium text-white">Demo User</p>
              <p className="text-xs text-gray-400">Growth Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
