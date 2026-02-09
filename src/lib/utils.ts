import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  return Math.floor(seconds / 86400) + "d ago";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "connected":
      return "text-emerald-400";
    case "disconnected":
      return "text-gray-400";
    case "error":
      return "text-red-400";
    case "paused":
      return "text-yellow-400";
    case "queued":
      return "text-blue-400";
    case "published":
      return "text-emerald-400";
    case "draft":
      return "text-gray-400";
    case "generated":
      return "text-purple-400";
    case "failed":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "connected":
      return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
    case "disconnected":
      return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    case "error":
      return "bg-red-400/10 text-red-400 border-red-400/20";
    case "paused":
      return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
    case "queued":
      return "bg-blue-400/10 text-blue-400 border-blue-400/20";
    case "published":
      return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
    case "draft":
      return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    case "generated":
      return "bg-purple-400/10 text-purple-400 border-purple-400/20";
    case "failed":
      return "bg-red-400/10 text-red-400 border-red-400/20";
    default:
      return "bg-gray-400/10 text-gray-400 border-gray-400/20";
  }
}

export function getNicheEmoji(niche: string): string {
  const map: Record<string, string> = {
    fitness: "\uD83D\uDCAA",
    motivation: "\uD83C\uDFAF",
    luxury: "\u2728",
    memes: "\uD83D\uDE02",
    tech: "\uD83E\uDD16",
    food: "\uD83C\uDF55",
    travel: "\u2708\uFE0F",
    fashion: "\uD83D\uDC57",
    custom: "\uD83C\uDFA8",
  };
  return map[niche] || "\uD83D\uDCF1";
}
