import { FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { Platform } from "@/lib/types";

const platformConfig: Record<Platform, { icon: React.ComponentType<{ className?: string }>; bg: string; label: string }> = {
  youtube: { icon: FaYoutube, bg: "bg-red-600", label: "YouTube" },
  instagram: { icon: FaInstagram, bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", label: "Instagram" },
  facebook: { icon: FaFacebook, bg: "bg-blue-600", label: "Facebook" },
  tiktok: { icon: FaTiktok, bg: "bg-black", label: "TikTok" },
  twitter: { icon: FaXTwitter, bg: "bg-black", label: "X (Twitter)" },
};

export function PlatformIcon({ platform, size = "md" }: { platform: Platform; size?: "sm" | "md" }) {
  const config = platformConfig[platform];
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={`${sizeClasses} ${config.bg} rounded-lg flex items-center justify-center`}>
      <Icon className={`${iconSize} text-white`} />
    </div>
  );
}

export function getPlatformLabel(platform: Platform): string {
  return platformConfig[platform].label;
}
