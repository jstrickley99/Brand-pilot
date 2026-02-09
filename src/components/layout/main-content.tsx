"use client";

import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "min-h-screen p-8 transition-all duration-300",
        collapsed ? "ml-16" : "ml-[280px]"
      )}
    >
      {children}
    </main>
  );
}
