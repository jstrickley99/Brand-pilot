"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeneratedContent } from "@/lib/types";
import { Copy, Check, Clock, RefreshCw, Plus } from "lucide-react";

interface GenerationResultProps {
  content: GeneratedContent;
  onRegenerate: () => void;
  onAddToQueue: () => void;
}

export function GenerationResult({ content, onRegenerate, onAddToQueue }: GenerationResultProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="rounded-lg bg-white/5 border border-[#1E293B] p-4">
          <p className="text-sm text-[#F8FAFC] whitespace-pre-wrap pr-8">{content.caption}</p>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-[#94A3B8]" />
            )}
          </button>
        </div>
      </div>

      <div>
        <span className="text-xs text-[#94A3B8] mb-2 block">Hashtags</span>
        <div className="flex flex-wrap gap-1.5">
          {content.hashtags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 text-xs"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Clock className="h-4 w-4" />
        <span>Suggested posting time: {content.suggestedPostingTime}</span>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onRegenerate}
          className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button
          onClick={onAddToQueue}
          className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Queue
        </Button>
      </div>
    </div>
  );
}
